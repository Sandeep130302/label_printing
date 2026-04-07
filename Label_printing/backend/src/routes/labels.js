import express from 'express';
import * as labelController from '../controllers/labelController.js';

const router = express.Router();

// ✅ SPECIFIC ROUTES FIRST
router.get('/search/query', labelController.searchLabels);
router.get('/stats/all', labelController.getLabelStats);

// ✅ GENERAL ROUTES LAST
router.get('/', labelController.getLabels);
router.post('/', labelController.createLabel);
router.get('/:id', labelController.getLabelById);
router.put('/:id', labelController.updateLabel);
router.delete('/:id', labelController.deleteLabel);

export default router;