import * as dashboardModel from '../models/dashboardModel.js';

// ============================================
// GET DASHBOARD STATS
// Returns: totalLabels, totalDuplicates, activeProducts, labelsToday
// ============================================

export async function getDashboardStats(req, res) {
  try {
    const stats = await dashboardModel.getDashboardStats();
    
    res.json({
      success: true,
      data: stats,
      message: 'Dashboard stats retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve dashboard stats',
      details: error.message
    });
  }
}

// ============================================
// GET RECENT EVENTS
// Returns: Last 5 print events with details
// ============================================

export async function getRecentEvents(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const events = await dashboardModel.getRecentEvents(limit);
    
    res.json({
      success: true,
      data: events,
      message: 'Recent events retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching recent events:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve recent events',
      details: error.message
    });
  }
}

// ============================================
// GET CHART DATA
// Query params: filter (today, thisWeek, thisMonth, thisYear)
// Returns: Array of { name, labels } for chart
// ============================================

export async function getChartData(req, res) {
  try {
    const filter = req.query.filter || 'thisMonth';
    
    // Validate filter
    const validFilters = ['today', 'thisWeek', 'thisMonth', 'thisYear'];
    if (!validFilters.includes(filter)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: `Invalid filter. Must be one of: ${validFilters.join(', ')}`
      });
    }
    
    const chartData = await dashboardModel.getChartData(filter);
    
    res.json({
      success: true,
      data: chartData,
      filter: filter,
      message: 'Chart data retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve chart data',
      details: error.message
    });
  }
}

// ============================================
// GET ALL DASHBOARD DATA (Combined endpoint)
// Returns: stats, recentEvents, chartData all in one call
// Useful for initial page load
// ============================================

export async function getAllDashboardData(req, res) {
  try {
    const filter = req.query.filter || 'thisMonth';
    
    // Fetch all data in parallel
    const [stats, recentEvents, chartData] = await Promise.all([
      dashboardModel.getDashboardStats(),
      dashboardModel.getRecentEvents(5),
      dashboardModel.getChartData(filter)
    ]);
    
    res.json({
      success: true,
      data: {
        stats,
        recentEvents,
        chartData
      },
      filter: filter,
      message: 'Dashboard data retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve dashboard data',
      details: error.message
    });
  }
}