import express from 'express';
import * as configController from '../controllers/configController.js';

const router = express.Router();

// ============================================
// PRINT_FORMAT ROUTES (Specific first)
// ============================================
router.get('/formats/all', configController.getFormats);
router.get('/formats/:id', configController.getFormatById);
router.post('/formats', configController.createFormat);
router.put('/formats/:id', configController.updateFormat);
router.delete('/formats/:id', configController.deleteFormat);

// ============================================
// LABEL_CONFIG ROUTES
// ============================================

// ✅ NEW: Get active config (for label printing) - specific route first
router.get('/active', configController.getActiveConfig);

// ✅ NEW: Save config (create or update) - for Settings page
router.post('/save', configController.saveConfig);

// General routes
router.get('/', configController.getConfigs);
router.post('/', configController.createConfig);
router.get('/:id', configController.getConfigById);
router.put('/:id', configController.updateConfig);
router.delete('/:id', configController.deleteConfig);

export default router;