import { query, pool } from '../config/database.js';

// ============================================
// SERIAL_COUNTER OPERATIONS
// ============================================

export async function getCounters() {
  const result = await query('SELECT * FROM Serial_Counter WHERE is_active = true ORDER BY financial_year_start DESC');
  return result.rows;
}

export async function getCounterById(counterId) {
  const result = await query(
    'SELECT * FROM Serial_Counter WHERE counter_id = $1',
    [counterId]
  );
  return result.rows[0];
}

export async function getCounterByYear(year) {
  const result = await query(
    'SELECT * FROM Serial_Counter WHERE financial_year_start = $1 AND is_active = true',
    [year]
  );
  return result.rows[0];
}

// Get the first active counter (or create one if none exists)
export async function getOrCreateCurrentCounter() {
  const counters = await getCounters();
  
  if (counters && counters.length > 0) {
    return counters[0];
  }
  
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const financialYearStart = currentMonth >= 4 ? currentYear : currentYear - 1;
  const nextReset = `${financialYearStart + 1}-04-01`;
  
  const newCounter = await createCounter(financialYearStart, nextReset);
  return newCounter;
}

export async function createCounter(financialYearStart, nextReset) {
  const result = await query(
    'INSERT INTO Serial_Counter (financial_year_start, current_counter, next_reset, is_active) VALUES ($1, 0, $2, true) RETURNING *',
    [financialYearStart, nextReset]
  );
  return result.rows[0];
}

export async function incrementCounter(counterId) {
  const result = await query(
    'UPDATE Serial_Counter SET current_counter = current_counter + 1, updated_at = CURRENT_TIMESTAMP WHERE counter_id = $1 RETURNING *',
    [counterId]
  );
  return result.rows[0];
}

export async function resetCounter(counterId) {
  const result = await query(
    'UPDATE Serial_Counter SET current_counter = 0, updated_at = CURRENT_TIMESTAMP WHERE counter_id = $1 RETURNING *',
    [counterId]
  );
  return result.rows[0];
}

export async function toggleCounterActive(counterId) {
  const counter = await getCounterById(counterId);
  const result = await query(
    'UPDATE Serial_Counter SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE counter_id = $2 RETURNING *',
    [!counter.is_active, counterId]
  );
  return result.rows[0];
}

// ============================================
// SERIAL_NUMBER OPERATIONS
// ============================================

export async function getSerials() {
  const result = await query('SELECT * FROM Serial_Number WHERE is_active = true ORDER BY created_at DESC');
  return result.rows;
}

export async function getSerialById(serialId) {
  const result = await query(
    'SELECT * FROM Serial_Number WHERE serial_id = $1',
    [serialId]
  );
  return result.rows[0];
}

export async function getSerialByNumber(serialNumber) {
  const result = await query(
    'SELECT * FROM Serial_Number WHERE serial_number = $1',
    [serialNumber]
  );
  return result.rows[0];
}

export async function getSerialsByCounter(counterId) {
  const result = await query(
    'SELECT * FROM Serial_Number WHERE counter_id = $1 AND is_active = true ORDER BY created_at DESC',
    [counterId]
  );
  return result.rows;
}

export async function getUnusedSerials(counterId) {
  const result = await query(
    'SELECT * FROM Serial_Number WHERE counter_id = $1 AND is_used = false AND is_active = true ORDER BY created_at ASC',
    [counterId]
  );
  return result.rows;
}

export async function createSerialNumber(serialNumber, counterId) {
  const result = await query(
    'INSERT INTO Serial_Number (serial_number, counter_id, is_used, is_active) VALUES ($1, $2, false, true) RETURNING *',
    [serialNumber, counterId]
  );
  return result.rows[0];
}

// Generate single serial number with TRANSACTION + ROW LOCK
// This prevents race conditions by locking the counter row during update
export async function generateSerialNumber(counterId) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Lock the counter row with FOR UPDATE and increment atomically
    const counterResult = await client.query(
      'UPDATE Serial_Counter SET current_counter = current_counter + 1, updated_at = CURRENT_TIMESTAMP WHERE counter_id = $1 RETURNING *',
      [counterId]
    );
    
    if (!counterResult.rows[0]) {
      throw new Error('Failed to increment counter');
    }
    
    const counterValue = counterResult.rows[0].current_counter;

    // Get current date for YYMM
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // Format: XXXXYYMM
    const counterStr = String(counterValue).padStart(4, '0');
    const serialNumber = `JR - ${counterStr}${year}${month}`;

    // Create serial number within the same transaction
    const serialResult = await client.query(
      'INSERT INTO Serial_Number (serial_number, counter_id, is_used, is_active) VALUES ($1, $2, false, true) RETURNING *',
      [serialNumber, counterId]
    );
    
    await client.query('COMMIT');
    
    console.log(`Generated serial: ${serialNumber}`);
    
    return serialResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error generating serial number:', error);
    throw error;
  } finally {
    client.release();
  }
}

// ============================================
// BATCH GENERATE - Creates multiple serials in ONE transaction
// This is the KEY fix for race conditions when applying Qty > 1
// ============================================
export async function batchGenerateSerialNumbers(count) {
  if (count < 1 || count > 100) {
    throw new Error('Count must be between 1 and 100');
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get or create current counter with ROW LOCK (FOR UPDATE)
    // This prevents other transactions from reading/updating until we commit
    const countersResult = await client.query(
      'SELECT * FROM Serial_Counter WHERE is_active = true ORDER BY financial_year_start DESC LIMIT 1 FOR UPDATE'
    );
    
    let counter;
    if (countersResult.rows.length > 0) {
      counter = countersResult.rows[0];
    } else {
      // Create new counter
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const financialYearStart = currentMonth >= 4 ? currentYear : currentYear - 1;
      const nextReset = `${financialYearStart + 1}-04-01`;
      
      const newCounterResult = await client.query(
        'INSERT INTO Serial_Counter (financial_year_start, current_counter, next_reset, is_active) VALUES ($1, 0, $2, true) RETURNING *',
        [financialYearStart, nextReset]
      );
      counter = newCounterResult.rows[0];
    }
    
    // Atomically increment counter by the FULL batch count
    // This reserves all serial numbers at once
    const updateResult = await client.query(
      'UPDATE Serial_Counter SET current_counter = current_counter + $1, updated_at = CURRENT_TIMESTAMP WHERE counter_id = $2 RETURNING current_counter',
      [count, counter.counter_id]
    );
    
    const endingCounter = updateResult.rows[0].current_counter;
    const startingCounter = endingCounter - count + 1;
    
    // Get current date for YYMM
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // Generate all serial numbers in sequence
    const serials = [];
    for (let i = 0; i < count; i++) {
      const counterValue = startingCounter + i;
      const counterStr = String(counterValue).padStart(4, '0');
      const serialNumber = `JR - ${counterStr}${year}${month}`;
      
      const serialResult = await client.query(
        'INSERT INTO Serial_Number (serial_number, counter_id, is_used, is_active) VALUES ($1, $2, false, true) RETURNING *',
        [serialNumber, counter.counter_id]
      );
      
      serials.push(serialResult.rows[0]);
    }
    
    await client.query('COMMIT');
    
    console.log(`✅ Batch generated ${count} serials: ${serials[0].serial_number} to ${serials[serials.length - 1].serial_number}`);
    
    return serials;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error batch generating serial numbers:', error);
    throw error;
  } finally {
    client.release();
  }
}

// ============================================
// VOID BATCH SERIALS - Delete pending serials and decrement counter
// Called when user cancels from PrintPreview
// This ensures serial numbers are not wasted
// ============================================
export async function voidBatchSerials(serialIds) {
  if (!serialIds || serialIds.length === 0) {
    throw new Error('No serial IDs provided');
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // First, verify all serials exist and are NOT used (safety check)
    // Only void serials that haven't been linked to a Label yet
    const checkResult = await client.query(
      `SELECT sn.serial_id, sn.serial_number, sn.counter_id, sn.is_used,
              EXISTS(SELECT 1 FROM Label l WHERE l.serial_id = sn.serial_id AND l.is_deleted = false) as has_label
       FROM Serial_Number sn 
       WHERE sn.serial_id = ANY($1::uuid[])
       FOR UPDATE`,
      [serialIds]
    );
    
    const serialsToVoid = checkResult.rows;
    
    // Filter out any serials that are already used or have labels
    const safeToVoid = serialsToVoid.filter(s => !s.is_used && !s.has_label);
    
    if (safeToVoid.length === 0) {
      await client.query('COMMIT');
      console.log('⚠️ No serials safe to void (all already used or have labels)');
      return { voided: 0, skipped: serialIds.length };
    }
    
    const safeIds = safeToVoid.map(s => s.serial_id);
    
    // Get the counter ID from the first serial (they should all have the same counter)
    const counterId = safeToVoid[0].counter_id;
    
    // Delete the serial numbers that are safe to void
    const deleteResult = await client.query(
      'DELETE FROM Serial_Number WHERE serial_id = ANY($1::uuid[]) RETURNING *',
      [safeIds]
    );
    
    const deletedCount = deleteResult.rowCount;
    
    // Decrement the counter by the number of deleted serials
    // This ensures the next batch generation picks up where we left off
    if (deletedCount > 0) {
      await client.query(
        'UPDATE Serial_Counter SET current_counter = GREATEST(current_counter - $1, 0), updated_at = CURRENT_TIMESTAMP WHERE counter_id = $2',
        [deletedCount, counterId]
      );
    }
    
    await client.query('COMMIT');
    
    console.log(`🗑️ Voided ${deletedCount} serial(s), skipped ${serialIds.length - deletedCount}`);
    
    return { 
      voided: deletedCount, 
      skipped: serialIds.length - deletedCount,
      voidedSerials: deleteResult.rows
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error voiding serial numbers:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Auto-generate single serial (uses batch internally for consistency)
export async function autoGenerateSerialNumber() {
  try {
    // Use batch generate with count=1 to ensure transaction safety
    const serials = await batchGenerateSerialNumbers(1);
    return serials[0];
  } catch (error) {
    console.error('Error auto-generating serial number:', error);
    throw error;
  }
}

export async function markSerialAsUsed(serialId) {
  const result = await query(
    'UPDATE Serial_Number SET is_used = true, updated_at = CURRENT_TIMESTAMP WHERE serial_id = $1 RETURNING *',
    [serialId]
  );
  return result.rows[0];
}

export async function markSerialAsUnused(serialId) {
  const result = await query(
    'UPDATE Serial_Number SET is_used = false, updated_at = CURRENT_TIMESTAMP WHERE serial_id = $1 RETURNING *',
    [serialId]
  );
  return result.rows[0];
}

export async function validateSerial(serialNumber) {
  const serial = await getSerialByNumber(serialNumber);
  if (!serial) {
    return { valid: false, message: 'Serial number not found' };
  }
  if (!serial.is_active) {
    return { valid: false, message: 'Serial number is inactive' };
  }
  if (serial.is_used) {
    return { valid: false, message: 'Serial number already used' };
  }
  return { valid: true, serial };
}

export async function toggleSerialActive(serialId) {
  const serial = await getSerialById(serialId);
  const result = await query(
    'UPDATE Serial_Number SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE serial_id = $2',
    [!serial.is_active, serialId]
  );
  return result.rows[0];
}

export async function getSerialStats() {
  const result = await query(`
    SELECT 
      sc.counter_id,
      sc.financial_year_start,
      sc.current_counter,
      COUNT(sn.serial_id) as total_serials,
      SUM(CASE WHEN sn.is_used = true THEN 1 ELSE 0 END) as used_serials,
      SUM(CASE WHEN sn.is_used = false THEN 1 ELSE 0 END) as unused_serials
    FROM Serial_Counter sc
    LEFT JOIN Serial_Number sn ON sc.counter_id = sn.counter_id
    WHERE sc.is_active = true
    GROUP BY sc.counter_id, sc.financial_year_start, sc.current_counter
    ORDER BY sc.financial_year_start DESC
  `);
  return result.rows;
}