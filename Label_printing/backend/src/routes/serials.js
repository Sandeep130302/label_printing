import express from 'express';
import * as serialController from '../controllers/serialController.js';

const router = express.Router();

// ============================================
// SERIAL_COUNTER ROUTES
// ============================================
router.get('/counters', serialController.getCounters);
router.get('/counters/current', serialController.getCurrentCounter);
router.post('/counters', serialController.createCounter);

// ============================================
// SERIAL_NUMBER ROUTES
// ============================================
router.post('/generate', serialController.generateSerialNumber);
router.post('/auto-generate', serialController.autoGenerateSerialNumber);
router.post('/batch-generate', serialController.batchGenerateSerialNumbers);
router.post('/void-batch', serialController.voidBatchSerials);  // ✅ NEW: Void pending serials on cancel
router.get('/validate/:serialNumber', serialController.validateSerial);
router.post('/:id/mark-used', serialController.markSerialAsUsed);
router.get('/stats', serialController.getSerialStats);

export default router;