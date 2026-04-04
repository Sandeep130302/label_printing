import { query } from '../config/database.js';

// ============================================
// OVERALL_EVENT_REPORT OPERATIONS
// ============================================

export async function getEventReports() {
  const result = await query(
    'SELECT * FROM Overall_Event_Report ORDER BY created_at DESC'
  );
  return result.rows;
}

export async function getEventReportById(eventId) {
  const result = await query(
    'SELECT * FROM Overall_Event_Report WHERE overall_report_id = $1',
    [eventId]
  );
  return result.rows[0];
}

export async function getEventReportByNumber(eventNumber) {
  const result = await query(
    'SELECT * FROM Overall_Event_Report WHERE event_number = $1',
    [eventNumber]
  );
  return result.rows[0];
}

export async function createEventReport(eventNumber, numberOfLabelsPrinted) {
  const result = await query(
    'INSERT INTO Overall_Event_Report (event_number, number_of_label_printed) VALUES ($1, $2) RETURNING *',
    [eventNumber, numberOfLabelsPrinted]
  );
  return result.rows[0];
}

export async function updateEventReport(eventId, numberOfLabelsPrinted) {
  const result = await query(
    'UPDATE Overall_Event_Report SET number_of_label_printed = $1 WHERE overall_report_id = $2 RETURNING *',
    [numberOfLabelsPrinted, eventId]
  );
  return result.rows[0];
}

export async function deleteEventReport(eventId) {
  const result = await query(
    'DELETE FROM Overall_Event_Report WHERE overall_report_id = $1 RETURNING *',
    [eventId]
  );
  return result.rows[0];
}

// ============================================
// REPORT OPERATIONS
// ============================================

export async function getReports() {
  const result = await query(
    'SELECT * FROM Report ORDER BY created_at DESC'
  );
  return result.rows;
}

export async function getReportById(reportId) {
  const result = await query(
    'SELECT * FROM Report WHERE report_id = $1',
    [reportId]
  );
  return result.rows[0];
}

export async function getReportsByEvent(eventId) {
  const result = await query(
    'SELECT * FROM Report WHERE overall_report_id = $1 ORDER BY created_at DESC',
    [eventId]
  );
  return result.rows;
}

export async function getReportsByProduct(productName) {
  const result = await query(
    'SELECT * FROM Report WHERE product_name = $1 ORDER BY created_at DESC',
    [productName]
  );
  return result.rows;
}

export async function getReportsBySerialNumber(serialNumber) {
  const result = await query(
    'SELECT * FROM Report WHERE serial_number = $1 ORDER BY created_at DESC',
    [serialNumber]
  );
  return result.rows;
}

export async function createReport(eventId, productName, capacityName, modelName, serialNumber, manufacturingCode, ssn, qrData, isReprinted = false) {
  const result = await query(
    `INSERT INTO Report (overall_report_id, product_name, capacity_name, model_name, serial_number, manufacturing_code, ssn, qr_data, is_reprinted)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [eventId, productName, capacityName, modelName, serialNumber, manufacturingCode, ssn, qrData, isReprinted]
  );
  return result.rows[0];
}

export async function updateReport(reportId, updates) {
  const {
    productName,
    capacityName,
    modelName,
    serialNumber,
    manufacturingCode,
    ssn,
    qrData,
    duplicateCount,
    isReprinted
  } = updates;

  const result = await query(
    `UPDATE Report SET
      product_name = COALESCE($1, product_name),
      capacity_name = COALESCE($2, capacity_name),
      model_name = COALESCE($3, model_name),
      serial_number = COALESCE($4, serial_number),
      manufacturing_code = COALESCE($5, manufacturing_code),
      ssn = COALESCE($6, ssn),
      qr_data = COALESCE($7, qr_data),
      duplicate_count = COALESCE($8, duplicate_count),
      is_reprinted = COALESCE($9, is_reprinted)
     WHERE report_id = $10
     RETURNING *`,
    [productName, capacityName, modelName, serialNumber, manufacturingCode, ssn, qrData, duplicateCount, isReprinted, reportId]
  );
  return result.rows[0];
}

export async function markAsReprinted(reportId) {
  const result = await query(
    'UPDATE Report SET is_reprinted = true WHERE report_id = $1 RETURNING *',
    [reportId]
  );
  return result.rows[0];
}

export async function deleteReport(reportId) {
  const result = await query(
    'DELETE FROM Report WHERE report_id = $1 RETURNING *',
    [reportId]
  );
  return result.rows[0];
}

export async function getReportsByDateRange(startDate, endDate) {
  const result = await query(
    'SELECT * FROM Report WHERE created_at BETWEEN $1 AND $2 ORDER BY created_at DESC',
    [startDate, endDate]
  );
  return result.rows;
}

export async function getReportSummary() {
  const result = await query(`
    SELECT 
      COUNT(*) as total_reports,
      COUNT(DISTINCT overall_report_id) as total_events,
      SUM(CASE WHEN is_reprinted = true THEN 1 ELSE 0 END) as reprinted_count,
      COUNT(DISTINCT serial_number) as unique_serials
    FROM Report
  `);
  return result.rows[0];
}

export async function getEventSummary(eventId) {
  const result = await query(`
    SELECT 
      oer.*,
      COUNT(r.report_id) as report_count,
      SUM(CASE WHEN r.is_reprinted = true THEN 1 ELSE 0 END) as reprinted_count,
      COUNT(DISTINCT r.product_name) as unique_products
    FROM Overall_Event_Report oer
    LEFT JOIN Report r ON oer.overall_report_id = r.overall_report_id
    WHERE oer.overall_report_id = $1
    GROUP BY oer.overall_report_id
  `, [eventId]);
  return result.rows[0];
}

export async function getReportsByFilter(filters) {
  let whereConditions = [];
  let params = [];
  let paramCount = 1;

  if (filters.eventId) {
    whereConditions.push(`overall_report_id = $${paramCount}`);
    params.push(filters.eventId);
    paramCount++;
  }

  if (filters.productName) {
    whereConditions.push(`product_name ILIKE $${paramCount}`);
    params.push(`%${filters.productName}%`);
    paramCount++;
  }

  if (filters.serialNumber) {
    whereConditions.push(`serial_number ILIKE $${paramCount}`);
    params.push(`%${filters.serialNumber}%`);
    paramCount++;
  }

  if (filters.isReprinted !== undefined) {
    whereConditions.push(`is_reprinted = $${paramCount}`);
    params.push(filters.isReprinted);
    paramCount++;
  }

  let sql = 'SELECT * FROM Report';
  if (whereConditions.length > 0) {
    sql += ' WHERE ' + whereConditions.join(' AND ');
  }
  sql += ' ORDER BY created_at DESC';

  const result = await query(sql, params);
  return result.rows;
}

export async function exportReports(startDate, endDate) {
  const result = await query(`
    SELECT 
      r.*,
      oer.event_number
    FROM Report r
    LEFT JOIN Overall_Event_Report oer ON r.overall_report_id = oer.overall_report_id
    WHERE r.created_at BETWEEN $1 AND $2
    ORDER BY r.created_at DESC
  `, [startDate, endDate]);
  return result.rows;
}
