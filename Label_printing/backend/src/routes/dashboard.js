import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';

const router = express.Router();

// ============================================
// DASHBOARD ROUTES
// ============================================

// GET /api/dashboard - Get all dashboard data (stats + events + chart)
router.get('/', dashboardController.getAllDashboardData);

// GET /api/dashboard/stats - Get stats only
router.get('/stats', dashboardController.getDashboardStats);

// GET /api/dashboard/events - Get recent events
router.get('/events', dashboardController.getRecentEvents);

// GET /api/dashboard/chart?filter=thisMonth - Get chart data
router.get('/chart', dashboardController.getChartData);

export default router;