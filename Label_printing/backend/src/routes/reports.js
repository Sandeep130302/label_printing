import express from 'express';
import * as reportController from '../controllers/reportController.js';

const router = express.Router();

// ============================================
// EVENT_REPORT ROUTES
// ============================================
router.get('/events', reportController.getEventReports);
router.post('/events', reportController.createEventReport);
router.get('/events/:id', reportController.getEventReportById);
router.get('/events/:eventId/reports', reportController.getReportsByEvent);

// ============================================
// REPORT ROUTES
// ============================================
router.get('/', reportController.getReports);
router.post('/', reportController.createReport);
router.post('/:id/mark-reprinted', reportController.markAsReprinted);
router.get('/summary', reportController.getReportSummary);
router.get('/filter', reportController.getReportsByFilter);

export default router;
