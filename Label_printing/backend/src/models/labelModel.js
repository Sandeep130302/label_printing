import { query } from '../config/database.js';

// ============================================
// LABEL OPERATIONS
// ============================================

export async function getLabels() {
  const result = await query(
    'SELECT * FROM Label WHERE is_deleted = false ORDER BY created_at DESC'
  );
  return result.rows;
}

export async function getLabelById(labelId) {
  const result = await query(
    'SELECT * FROM Label WHERE label_id = $1 AND is_deleted = false',
    [labelId]
  );
  return result.rows[0];
}

export async function getLabelsByProduct(productId) {
  const result = await query(
    'SELECT * FROM Label WHERE product_id = $1 AND is_deleted = false ORDER BY created_at DESC',
    [productId]
  );
  return result.rows;
}

export async function getLabelsByCapacity(capacityId) {
  const result = await query(
    'SELECT * FROM Label WHERE capacity_id = $1 AND is_deleted = false ORDER BY created_at DESC',
    [capacityId]
  );
  return result.rows;
}

export async function getLabelsByModel(modelId) {
  const result = await query(
    'SELECT * FROM Label WHERE model_id = $1 AND is_deleted = false ORDER BY created_at DESC',
    [modelId]
  );
  return result.rows;
}

export async function getLabelsBySerial(serialId) {
  const result = await query(
    'SELECT * FROM Label WHERE serial_id = $1 AND is_deleted = false',
    [serialId]
  );
  return result.rows[0];
}

export async function getLabelsBySerialNumber(serialNumber) {
  const result = await query(`
    SELECT l.* FROM Label l
    JOIN Serial_Number sn ON l.serial_id = sn.serial_id
    WHERE sn.serial_number = $1 AND l.is_deleted = false
  `, [serialNumber]);
  return result.rows[0];
}

export async function getLabelsByConfig(configId) {
  const result = await query(
    'SELECT * FROM Label WHERE config_id = $1 AND is_deleted = false ORDER BY created_at DESC',
    [configId]
  );
  return result.rows;
}

export async function getLabelsByFormat(formatId) {
  const result = await query(
    'SELECT * FROM Label WHERE format_id = $1 AND is_deleted = false ORDER BY created_at DESC',
    [formatId]
  );
  return result.rows;
}

// ✅ FIXED: Added duplicateCount parameter
export async function createLabel(productId, capacityId, modelId, serialId, manufacturingCode, ssn, qrData, formatId, configId, duplicateCount = 1) {
  const result = await query(
    `INSERT INTO Label (product_id, capacity_id, model_id, serial_id, manufacturing_code, ssn, qr_data, format_id, config_id, duplicate_count, is_deleted)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false)
     RETURNING *`,
    [productId, capacityId, modelId, serialId, manufacturingCode, ssn, qrData, formatId, configId, duplicateCount]
  );
  return result.rows[0];
}

export async function updateLabel(labelId, updates) {
  const {
    productId,
    capacityId,
    modelId,
    serialId,
    manufacturingCode,
    ssn,
    qrData,
    formatId,
    configId,
    duplicateCount
  } = updates;

  const result = await query(
    `UPDATE Label SET
      product_id = COALESCE($1, product_id),
      capacity_id = COALESCE($2, capacity_id),
      model_id = COALESCE($3, model_id),
      serial_id = COALESCE($4, serial_id),
      manufacturing_code = COALESCE($5, manufacturing_code),
      ssn = COALESCE($6, ssn),
      qr_data = COALESCE($7, qr_data),
      format_id = COALESCE($8, format_id),
      config_id = COALESCE($9, config_id),
      duplicate_count = COALESCE($10, duplicate_count)
     WHERE label_id = $11 AND is_deleted = false
     RETURNING *`,
    [productId, capacityId, modelId, serialId, manufacturingCode, ssn, qrData, formatId, configId, duplicateCount, labelId]
  );
  return result.rows[0];
}

export async function softDeleteLabel(labelId) {
  const result = await query(
    'UPDATE Label SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP WHERE label_id = $1 RETURNING *',
    [labelId]
  );
  return result.rows[0];
}

export async function permanentDeleteLabel(labelId) {
  const result = await query(
    'DELETE FROM Label WHERE label_id = $1 RETURNING *',
    [labelId]
  );
  return result.rows[0];
}

export async function incrementDuplicateCount(labelId) {
  const result = await query(
    'UPDATE Label SET duplicate_count = duplicate_count + 1 WHERE label_id = $1 AND is_deleted = false RETURNING *',
    [labelId]
  );
  return result.rows[0];
}

export async function getLabelWithDetails(labelId) {
  const result = await query(`
    SELECT 
      l.*,
      p.product_name,
      c.capacity_value,
      m.model_name,
      sn.serial_number,
      pf.format_name,
      lc.company_name
    FROM Label l
    LEFT JOIN Product p ON l.product_id = p.product_id
    LEFT JOIN Capacities c ON l.capacity_id = c.capacity_id
    LEFT JOIN Model_Number m ON l.model_id = m.model_id
    LEFT JOIN Serial_Number sn ON l.serial_id = sn.serial_id
    LEFT JOIN Print_Format pf ON l.format_id = pf.format_id
    LEFT JOIN Label_Config lc ON l.config_id = lc.config_id
    WHERE l.label_id = $1 AND l.is_deleted = false
  `, [labelId]);
  return result.rows[0];
}

export async function getLabelsWithDetails() {
  const result = await query(`
    SELECT 
      l.*,
      p.product_name,
      c.capacity_value,
      m.model_name,
      sn.serial_number,
      pf.format_name,
      lc.company_name
    FROM Label l
    LEFT JOIN Product p ON l.product_id = p.product_id
    LEFT JOIN Capacities c ON l.capacity_id = c.capacity_id
    LEFT JOIN Model_Number m ON l.model_id = m.model_id
    LEFT JOIN Serial_Number sn ON l.serial_id = sn.serial_id
    LEFT JOIN Print_Format pf ON l.format_id = pf.format_id
    LEFT JOIN Label_Config lc ON l.config_id = lc.config_id
    WHERE l.is_deleted = false
    ORDER BY l.created_at DESC
  `);
  return result.rows;
}

export async function searchLabels(searchTerm) {
  const result = await query(`
    SELECT 
      l.*,
      p.product_name,
      c.capacity_value,
      m.model_name,
      sn.serial_number,
      pf.format_name,
      lc.company_name
    FROM Label l
    LEFT JOIN Product p ON l.product_id = p.product_id
    LEFT JOIN Capacities c ON l.capacity_id = c.capacity_id
    LEFT JOIN Model_Number m ON l.model_id = m.model_id
    LEFT JOIN Serial_Number sn ON l.serial_id = sn.serial_id
    LEFT JOIN Print_Format pf ON l.format_id = pf.format_id
    LEFT JOIN Label_Config lc ON l.config_id = lc.config_id
    WHERE l.is_deleted = false AND (
      sn.serial_number ILIKE $1 OR
      l.manufacturing_code ILIKE $1 OR
      l.ssn ILIKE $1 OR
      p.product_name ILIKE $1
    )
    ORDER BY l.created_at DESC
  `, [`%${searchTerm}%`]);
  return result.rows;
}

export async function getLabelStats() {
  const result = await query(`
    SELECT 
      COUNT(*) as total_labels,
      SUM(duplicate_count) as total_duplicates,
      COUNT(DISTINCT product_id) as unique_products,
      COUNT(DISTINCT format_id) as unique_formats
    FROM Label
    WHERE is_deleted = false
  `);
  return result.rows[0];
}