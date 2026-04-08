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

// ============================================
// Get UNIQUE reports by event
// Now uses duplicate_count column directly (no DISTINCT ON needed)
// ============================================

export async function getUniqueReportsByEvent(eventId) {
  try {
    const result = await query(
      `SELECT 
        report_id,
        overall_report_id,
        product_name,
        capacity_name,
        model_name,
        serial_number,
        manufacturing_code,
        ssn,
        qr_data,
        duplicate_count,
        COALESCE(is_reprinted, false) as is_reprinted,
        created_at
      FROM Report
      WHERE overall_report_id = $1
      ORDER BY created_at DESC`,
      [eventId]
    );

    return result.rows;
  } catch (error) {
    console.error("DB ERROR (unique reports):", error);
    throw error;
  }
}

// ============================================
// SEARCH EVENTS WITH LABELS
// Searches events that contain matching labels
// Supports time filter and field-based search
// ============================================

export async function searchEventsWithLabels(filters) {
  try {
    let whereConditions = [];
    let params = [];
    let paramCount = 1;

    // Field mapping for search
    const fieldMapping = {
      'product': 'r.product_name',
      'capacity': 'r.capacity_name',
      'model': 'r.model_name',
      'serial': 'r.serial_number',
      'mfgCode': 'r.manufacturing_code',
      'ssn': 'r.ssn'
    };

    // ============================================
    // TIME FILTER - Applied to Overall_Event_Report.created_at
    // ============================================
    if (filters.timeFilter && filters.timeFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      let startDate;
      let endDate = new Date();
      
      switch (filters.timeFilter) {
        case 'today':
          startDate = today;
          break;
        case 'yesterday':
          startDate = new Date(today);
          startDate.setDate(startDate.getDate() - 1);
          endDate = today;
          break;
        case 'week':
          startDate = new Date(today);
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(today);
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate = new Date(today);
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        whereConditions.push(`oer.created_at >= $${paramCount}`);
        params.push(startDate.toISOString());
        paramCount++;
        
        if (filters.timeFilter === 'yesterday') {
          whereConditions.push(`oer.created_at < $${paramCount}`);
          params.push(endDate.toISOString());
          paramCount++;
        }
      }
    }

    // ============================================
    // FIELD SEARCH - Applied to Report table
    // ============================================
    let hasFieldSearch = filters.searchField && filters.searchValue && filters.searchValue.trim() !== '';
    
    if (hasFieldSearch) {
      const dbField = fieldMapping[filters.searchField];
      if (dbField) {
        whereConditions.push(`${dbField} ILIKE $${paramCount}`);
        params.push(`%${filters.searchValue.trim()}%`);
        paramCount++;
      }
    }

    // ============================================
    // BUILD QUERY
    // ============================================
    
    let sql;
    
    if (hasFieldSearch) {
      // Join with Report table for field search
      sql = `
        SELECT 
          oer.overall_report_id,
          oer.event_number,
          oer.number_of_label_printed,
          oer.created_at,
          COUNT(DISTINCT r.serial_number) as matching_labels
        FROM Overall_Event_Report oer
        INNER JOIN Report r ON oer.overall_report_id = r.overall_report_id
        ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''}
        GROUP BY oer.overall_report_id, oer.event_number, oer.number_of_label_printed, oer.created_at
        ORDER BY oer.created_at DESC
      `;
    } else {
      // No field search, just time filter on events
      sql = `
        SELECT 
          oer.overall_report_id,
          oer.event_number,
          oer.number_of_label_printed,
          oer.created_at,
          NULL as matching_labels
        FROM Overall_Event_Report oer
        ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''}
        ORDER BY oer.created_at DESC
      `;
    }

    const result = await query(sql, params);
    return result.rows;
    
  } catch (error) {
    console.error("DB ERROR (searchEventsWithLabels):", error);
    throw error;
  }
}

// ============================================
// Get filtered labels for an event
// Returns labels that match the search criteria within an event
// Now uses duplicate_count column directly
// ============================================

export async function getFilteredLabelsByEvent(eventId, searchField, searchValue) {
  try {
    let whereConditions = [`overall_report_id = $1`];
    let params = [eventId];
    let paramCount = 2;

    if (searchField && searchValue && searchValue.trim() !== '') {
      const fieldMapping = {
        'product': 'product_name',
        'capacity': 'capacity_name',
        'model': 'model_name',
        'serial': 'serial_number',
        'mfgCode': 'manufacturing_code',
        'ssn': 'ssn'
      };
      
      const dbField = fieldMapping[searchField];
      
      if (dbField) {
        whereConditions.push(`${dbField} ILIKE $${paramCount}`);
        params.push(`%${searchValue.trim()}%`);
        paramCount++;
      }
    }

    const result = await query(
      `SELECT 
        report_id,
        overall_report_id,
        product_name,
        capacity_name,
        model_name,
        serial_number,
        manufacturing_code,
        ssn,
        qr_data,
        duplicate_count,
        COALESCE(is_reprinted, false) as is_reprinted,
        created_at
      FROM Report
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY created_at DESC`,
      params
    );

    return result.rows;
  } catch (error) {
    console.error("DB ERROR (getFilteredLabelsByEvent):", error);
    throw error;
  }
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

// ============================================
// ✅ FIXED: CREATE REPORT WITH UPSERT LOGIC
// ============================================
// - First print: INSERT with duplicate_count = 1
// - Repeated print (same event + serial): UPDATE duplicate_count + 1
// - Requires UNIQUE constraint on (overall_report_id, serial_number)
// ============================================

export async function createReport(eventId, productName, capacityName, modelName, serialNumber, manufacturingCode, ssn, qrData, isReprinted = false) {
  const result = await query(
    `INSERT INTO Report (
      overall_report_id, 
      product_name, 
      capacity_name, 
      model_name, 
      serial_number, 
      manufacturing_code, 
      ssn, 
      qr_data, 
      is_reprinted, 
      duplicate_count
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1)
    ON CONFLICT (overall_report_id, serial_number) 
    DO UPDATE SET 
      duplicate_count = Report.duplicate_count + 1,
      is_reprinted = true
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
    `UPDATE Report SET 
      is_reprinted = true,
      duplicate_count = duplicate_count + 1
     WHERE report_id = $1 
     RETURNING *`,
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
      SUM(duplicate_count) as total_prints,
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
      SUM(r.duplicate_count) as total_prints,
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