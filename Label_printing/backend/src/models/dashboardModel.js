import { query } from '../config/database.js';

// ============================================
// DASHBOARD STATISTICS
// ============================================

/**
 * Get total labels printed (count of all reports)
 */
export async function getTotalLabels() {
  const result = await query(`
    SELECT COUNT(*) as total 
    FROM Report
  `);
  return parseInt(result.rows[0]?.total || 0);
}

/**
 * Get total duplicates (sum of duplicate_count where > 1)
 */
export async function getTotalDuplicates() {
  const result = await query(`
    SELECT COALESCE(SUM(duplicate_count), 0) as total 
    FROM Report 
    WHERE duplicate_count > 1
  `);
  return parseInt(result.rows[0]?.total || 0);
}

/**
 * Get count of active products
 */
export async function getActiveProductsCount() {
  const result = await query(`
    SELECT COUNT(*) as total 
    FROM Product 
    WHERE is_active = true
  `);
  return parseInt(result.rows[0]?.total || 0);
}

/**
 * Get labels printed today
 */
export async function getLabelsToday() {
  const result = await query(`
    SELECT COUNT(*) as total 
    FROM Report 
    WHERE DATE(created_at) = CURRENT_DATE
  `);
  return parseInt(result.rows[0]?.total || 0);
}

/**
 * Get all dashboard stats in one call
 */
export async function getDashboardStats() {
  const result = await query(`
    SELECT 
      (SELECT COUNT(*) FROM Report) as total_labels,
      (SELECT COALESCE(SUM(duplicate_count), 0) FROM Report WHERE duplicate_count > 1) as total_duplicates,
      (SELECT COUNT(*) FROM Product WHERE is_active = true) as active_products,
      (SELECT COUNT(*) FROM Report WHERE DATE(created_at) = CURRENT_DATE) as labels_today
  `);
  
  return {
    totalLabels: parseInt(result.rows[0]?.total_labels || 0),
    totalDuplicates: parseInt(result.rows[0]?.total_duplicates || 0),
    activeProducts: parseInt(result.rows[0]?.active_products || 0),
    labelsToday: parseInt(result.rows[0]?.labels_today || 0)
  };
}

// ============================================
// RECENT EVENTS
// ============================================

/**
 * Get recent print events (last 5)
 */
export async function getRecentEvents(limit = 5) {
  const result = await query(`
    SELECT 
      oer.overall_report_id,
      oer.event_number,
      oer.number_of_label_printed,
      oer.created_at,
      COUNT(DISTINCT r.serial_number) as unique_labels,
      COUNT(r.report_id) as total_prints
    FROM Overall_Event_Report oer
    LEFT JOIN Report r ON oer.overall_report_id = r.overall_report_id
    GROUP BY oer.overall_report_id, oer.event_number, oer.number_of_label_printed, oer.created_at
    ORDER BY oer.created_at DESC
    LIMIT $1
  `, [limit]);
  
  return result.rows;
}

// ============================================
// CHART DATA - Time-based grouping
// ============================================

/**
 * Get chart data for "This Year" - grouped by month
 */
export async function getChartDataByYear(year = new Date().getFullYear()) {
  const result = await query(`
    SELECT 
      EXTRACT(MONTH FROM created_at) as month,
      COUNT(*) as count
    FROM Report
    WHERE EXTRACT(YEAR FROM created_at) = $1
    GROUP BY EXTRACT(MONTH FROM created_at)
    ORDER BY month
  `, [year]);
  
  // Create array for all 12 months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = months.map((name, index) => {
    const monthData = result.rows.find(r => parseInt(r.month) === index + 1);
    return {
      name,
      labels: parseInt(monthData?.count || 0)
    };
  });
  
  return chartData;
}

/**
 * Get chart data for "This Month" - grouped by week
 */
export async function getChartDataByMonth(year = new Date().getFullYear(), month = new Date().getMonth() + 1) {
  const result = await query(`
    SELECT 
      EXTRACT(WEEK FROM created_at) - EXTRACT(WEEK FROM DATE_TRUNC('month', created_at)) + 1 as week,
      COUNT(*) as count
    FROM Report
    WHERE EXTRACT(YEAR FROM created_at) = $1 
      AND EXTRACT(MONTH FROM created_at) = $2
    GROUP BY week
    ORDER BY week
  `, [year, month]);
  
  // Create array for 4-5 weeks
  const chartData = [];
  for (let i = 1; i <= 5; i++) {
    const weekData = result.rows.find(r => parseInt(r.week) === i);
    chartData.push({
      name: `Week ${i}`,
      labels: parseInt(weekData?.count || 0)
    });
  }
  
  return chartData;
}

/**
 * Get chart data for "This Week" - grouped by day
 */
export async function getChartDataByWeek() {
  // Get start of current week (Monday)
  const result = await query(`
    SELECT 
      EXTRACT(DOW FROM created_at) as day_of_week,
      COUNT(*) as count
    FROM Report
    WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)
      AND created_at < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
    GROUP BY EXTRACT(DOW FROM created_at)
    ORDER BY day_of_week
  `);
  
  // Create array for all 7 days (0 = Sunday in PostgreSQL DOW)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartData = days.map((name, index) => {
    const dayData = result.rows.find(r => parseInt(r.day_of_week) === index);
    return {
      name,
      labels: parseInt(dayData?.count || 0)
    };
  });
  
  // Reorder to start from Monday
  const mondayFirst = [...chartData.slice(1), chartData[0]];
  
  return mondayFirst;
}

/**
 * Get chart data for "Today" - just returns today's count
 * (No chart needed, but included for consistency)
 */
export async function getChartDataToday() {
  const result = await query(`
    SELECT 
      EXTRACT(HOUR FROM created_at) as hour,
      COUNT(*) as count
    FROM Report
    WHERE DATE(created_at) = CURRENT_DATE
    GROUP BY EXTRACT(HOUR FROM created_at)
    ORDER BY hour
  `);
  
  // Create array for 24 hours (or return simplified data)
  const chartData = [];
  for (let i = 0; i < 24; i++) {
    const hourData = result.rows.find(r => parseInt(r.hour) === i);
    if (hourData) {
      chartData.push({
        name: `${i.toString().padStart(2, '0')}:00`,
        labels: parseInt(hourData.count)
      });
    }
  }
  
  // If no data, return empty array (frontend will show "no data" message)
  return chartData;
}

/**
 * Get chart data based on filter type
 */
export async function getChartData(filter = 'thisMonth') {
  switch (filter) {
    case 'today':
      return await getChartDataToday();
    case 'thisWeek':
      return await getChartDataByWeek();
    case 'thisMonth':
      return await getChartDataByMonth();
    case 'thisYear':
      return await getChartDataByYear();
    default:
      return await getChartDataByMonth();
  }
}