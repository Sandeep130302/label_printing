-- ============================================
-- MIGRATION 004: Fix Duplicate reports & Add UPSERT Support
-- ============================================
-- This migration will:
-- 1. Clean existing duplicate rows (keep first, update count)
-- 2. Add UNIQUE constraint for UPSERT to work
-- 3. Set proper defaults for duplicate_count
-- ============================================
-- ⚠️ BACKUP YOUR DATABASE BEFORE RUNNING!
-- pg_dump your_database > backup_before_migration.sql
-- ============================================

BEGIN;

-- ============================================
-- STEP 1: Create temp table with duplicate counts
-- ============================================
CREATE TEMP TABLE report_cleanup AS
SELECT DISTINCT ON (overall_report_id, serial_number)
  report_id as keep_id,
  overall_report_id,
  serial_number,
  COUNT(*) OVER (PARTITION BY overall_report_id, serial_number) as total_prints,
  created_at as first_print,
  MAX(CASE WHEN is_reprinted THEN 1 ELSE 0 END) 
    OVER (PARTITION BY overall_report_id, serial_number)::boolean as any_reprinted
FROM report
WHERE overall_report_id IS NOT NULL 
  AND serial_number IS NOT NULL
  AND serial_number != ''
ORDER BY overall_report_id, serial_number, created_at ASC;

-- ============================================
-- STEP 2: Update the rows we're keeping with correct duplicate_count
-- ============================================
UPDATE report r
SET 
  duplicate_count = rc.total_prints,
  is_reprinted = CASE 
    WHEN rc.total_prints > 1 THEN true 
    ELSE rc.any_reprinted 
  END
FROM report_cleanup rc
WHERE r.report_id = rc.keep_id;

-- ============================================
-- STEP 3: Delete duplicate rows (keep only first per event+serial)
-- ============================================
DELETE FROM report 
WHERE report_id IN (
  SELECT r.report_id 
  FROM report r
  INNER JOIN report_cleanup rc 
    ON r.overall_report_id = rc.overall_report_id 
    AND r.serial_number = rc.serial_number
  WHERE r.report_id != rc.keep_id
);

-- ============================================
-- STEP 4: Set default value for any remaining NULLs
-- ============================================
UPDATE report 
SET duplicate_count = 1 
WHERE duplicate_count IS NULL;

-- ============================================
-- STEP 5: Alter column to have proper default and NOT NULL
-- ============================================
ALTER TABLE report 
  ALTER COLUMN duplicate_count SET DEFAULT 1;

ALTER TABLE report 
  ALTER COLUMN duplicate_count SET NOT NULL;

-- ============================================
-- STEP 6: Add UNIQUE constraint (required for ON CONFLICT to work)
-- ============================================
-- STEP 6: Add UNIQUE constraint safely
ALTER TABLE report 
DROP CONSTRAINT IF EXISTS unique_report_event_serial;

ALTER TABLE report 
ADD CONSTRAINT unique_report_event_serial 
UNIQUE (overall_report_id, serial_number);

-- ============================================
-- STEP 7: Cleanup
-- ============================================
DROP TABLE report_cleanup;

COMMIT;

-- ============================================
-- VERIFICATION QUERIES (run after migration)
-- ============================================

-- Check total rows (should be reduced):
-- SELECT COUNT(*) as total_rows FROM report;

-- Check no NULLs remain:
-- SELECT COUNT(*) as null_count FROM report WHERE duplicate_count IS NULL;

-- Check no duplicates remain:
-- SELECT overall_report_id, serial_number, COUNT(*) as cnt 
-- FROM report 
-- GROUP BY overall_report_id, serial_number 
-- HAVING COUNT(*) > 1;

-- Check duplicate_count distribution:
-- SELECT duplicate_count, COUNT(*) as count 
-- FROM report 
-- GROUP BY duplicate_count 
-- ORDER BY duplicate_count;

-- Check constraint exists:
-- SELECT constraint_name FROM information_schema.table_constraints 
-- WHERE table_name = 'report' AND constraint_type = 'UNIQUE';
