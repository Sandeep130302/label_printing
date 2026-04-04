-- ============================================
-- MIGRATION 002: Create Serial Tables
-- ============================================

-- TABLE: Serial_Counter
CREATE TABLE IF NOT EXISTS Serial_Counter (
  Counter_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  Financial_year_start INT NOT NULL UNIQUE,
  Current_counter INT DEFAULT 0,
  Next_reset INT,
  Is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: Serial_Number
CREATE TABLE IF NOT EXISTS Serial_Number (
  Serial_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  Serial_number VARCHAR(50) NOT NULL UNIQUE,
  counter_ID UUID NOT NULL REFERENCES Serial_Counter(Counter_id),
  Is_used BOOLEAN DEFAULT false,
  Is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR SERIAL TABLES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_serial_counter_year ON Serial_Counter(Financial_year_start);
CREATE INDEX IF NOT EXISTS idx_serial_counter_active ON Serial_Counter(Is_active);
CREATE INDEX IF NOT EXISTS idx_serial_number_unique ON Serial_Number(Serial_number);
CREATE INDEX IF NOT EXISTS idx_serial_number_used ON Serial_Number(Is_used);
CREATE INDEX IF NOT EXISTS idx_serial_number_counter ON Serial_Number(counter_ID);

COMMIT;
