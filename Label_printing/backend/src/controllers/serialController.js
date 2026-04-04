import * as serialModel from '../models/serialModel.js';

export async function getCounters(req, res) {
  try {
    const counters = await serialModel.getCounters();
    res.json({ success: true, data: counters, message: 'Counters retrieved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to retrieve counters', details: error.message });
  }
}

export async function createCounter(req, res) {
  try {
    const { financialYearStart, nextReset } = req.body;
    if (!financialYearStart) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'Financial year is required' });
    }
    const counter = await serialModel.createCounter(financialYearStart, nextReset);
    res.status(201).json({ success: true, data: counter, message: 'Counter created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to create counter', details: error.message });
  }
}

// Generate serial number with specific counter
export async function generateSerialNumber(req, res) {
  try {
    const { counterId } = req.body;
    if (!counterId) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'Counter ID is required' });
    }
    const serial = await serialModel.generateSerialNumber(counterId);
    res.status(201).json({ success: true, data: serial, message: 'Serial number generated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to generate serial number', details: error.message });
  }
}

// Auto-generate single serial number (uses current financial year counter)
export async function autoGenerateSerialNumber(req, res) {
  try {
    const serial = await serialModel.autoGenerateSerialNumber();
    res.status(201).json({ success: true, data: serial, message: 'Serial number auto-generated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to auto-generate serial number', details: error.message });
  }
}

// Batch generate multiple serial numbers in ONE transaction
// This prevents race conditions when generating multiple serials at once
export async function batchGenerateSerialNumbers(req, res) {
  try {
    const { count } = req.body;
    
    if (!count || count < 1) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'Count must be at least 1' });
    }
    
    if (count > 100) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'Count cannot exceed 100' });
    }
    
    console.log(`Batch generating ${count} serial numbers...`);
    
    const serials = await serialModel.batchGenerateSerialNumbers(count);
    
    res.status(201).json({ 
      success: true, 
      data: serials, 
      message: `${count} serial numbers generated successfully` 
    });
  } catch (error) {
    console.error('Batch generate error:', error);
    res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to batch generate serial numbers', details: error.message });
  }
}

// ============================================
// VOID BATCH SERIALS - Delete pending serials when user cancels
// This ensures serial numbers are not wasted when user doesn't complete print
// ============================================
export async function voidBatchSerials(req, res) {
  try {
    const { serialIds } = req.body;
    
    if (!serialIds || !Array.isArray(serialIds) || serialIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'VALIDATION_ERROR', 
        message: 'serialIds array is required' 
      });
    }
    
    if (serialIds.length > 100) {
      return res.status(400).json({ 
        success: false, 
        error: 'VALIDATION_ERROR', 
        message: 'Cannot void more than 100 serials at once' 
      });
    }
    
    console.log(`Voiding ${serialIds.length} serial numbers...`);
    
    const result = await serialModel.voidBatchSerials(serialIds);
    
    res.json({ 
      success: true, 
      data: result, 
      message: `${result.voided} serial number(s) voided successfully${result.skipped > 0 ? `, ${result.skipped} skipped (already used)` : ''}` 
    });
  } catch (error) {
    console.error('Void batch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'DATABASE_ERROR', 
      message: 'Failed to void serial numbers', 
      details: error.message 
    });
  }
}

export async function validateSerial(req, res) {
  try {
    const { serialNumber } = req.params;
    const validation = await serialModel.validateSerial(serialNumber);
    res.json({ success: validation.valid, data: validation, message: validation.valid ? 'Serial is valid' : validation.message });
  } catch (error) {
    res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to validate serial', details: error.message });
  }
}

export async function markSerialAsUsed(req, res) {
  try {
    const { id } = req.params;
    const serial = await serialModel.markSerialAsUsed(id);
    if (!serial) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Serial not found' });
    res.json({ success: true, data: serial, message: 'Serial marked as used successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to mark serial as used', details: error.message });
  }
}

export async function getSerialStats(req, res) {
  try {
    const stats = await serialModel.getSerialStats();
    res.json({ success: true, data: stats, message: 'Serial statistics retrieved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to retrieve serial stats', details: error.message });
  }
}

// Get or create current financial year counter
export async function getCurrentCounter(req, res) {
  try {
    const counter = await serialModel.getOrCreateCurrentCounter();
    res.json({ success: true, data: counter, message: 'Current counter retrieved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to get current counter', details: error.message });
  }
}