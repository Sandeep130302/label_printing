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

// Get unique reports by event (deduplicates by serial number)
router.get('/events/:eventId/unique-reports', reportController.getUniqueReportsByEvent);

// ✅ NEW: Get filtered labels for an event (with search)
router.get('/events/:eventId/filtered-labels', reportController.getFilteredLabelsByEvent);

// ============================================
// ✅ NEW: SEARCH ROUTE
// Search events with labels - supports time filter and field search
// ============================================
router.get('/search', reportController.searchEventsWithLabels);

// ============================================
// REPORT ROUTES
// ============================================
router.get('/', reportController.getReports);
router.post('/', reportController.createReport);
router.post('/:id/mark-reprinted', reportController.markAsReprinted);
router.get('/summary', reportController.getReportSummary);
router.get('/filter', reportController.getReportsByFilter);

export default router;