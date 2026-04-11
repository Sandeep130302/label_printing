
import { query } from '../config/database.js';

// ============================================
// LABEL_CONFIG OPERATIONS
// ============================================

export async function getConfigs() {
  const result = await query('SELECT * FROM Label_Config WHERE is_active = true ORDER BY created_at DESC');
  return result.rows;
}

export async function getConfigById(configId) {
  const result = await query(
    'SELECT * FROM Label_Config WHERE config_id = $1',
    [configId]
  );
  return result.rows[0];
}

export async function getConfigByCompany(companyName) {
  const result = await query(
    'SELECT * FROM Label_Config WHERE company_name = $1 AND is_active = true',
    [companyName]
  );
  return result.rows[0];
}

// ✅ Get the first active config (for label printing)
export async function getActiveConfig() {
  const result = await query(
    'SELECT * FROM Label_Config WHERE is_active = true ORDER BY created_at DESC LIMIT 1'
  );
  return result.rows[0] || null;
}

// ✅ UPDATED: Create config with new fields
export async function createConfig(companyName, companySubtitle, callAssistantNo, madeInValue, companyLogo) {
  const result = await query(
    `INSERT INTO Label_Config 
     (company_name, company_subtitle, call_assistant_no, made_in_value, company_logo, is_active) 
     VALUES ($1, $2, $3, $4, $5, true) 
     RETURNING *`,
    [companyName, companySubtitle, callAssistantNo, madeInValue, companyLogo]
  );
  return result.rows[0];
}

// ✅ UPDATED: Update config with new fields
export async function updateConfig(configId, companyName, companySubtitle, callAssistantNo, madeInValue, companyLogo, isActive) {
  const result = await query(
    `UPDATE Label_Config 
     SET company_name = $1, 
         company_subtitle = $2, 
         call_assistant_no = $3, 
         made_in_value = $4, 
         company_logo = $5, 
         is_active = $6, 
         updated_at = CURRENT_TIMESTAMP 
     WHERE config_id = $7 
     RETURNING *`,
    [companyName, companySubtitle, callAssistantNo, madeInValue, companyLogo, isActive, configId]
  );
  return result.rows[0];
}

// ✅ NEW: Save config (create or update) - for Settings page
export async function saveConfig(data) {
  const {
    company_name,
    company_subtitle,
    call_assistant_no,
    made_in_value,
    company_logo
  } = data;

  // Check if config already exists
  const existingConfig = await getActiveConfig();

  if (existingConfig) {
    // Update existing config
    return await updateConfig(
      existingConfig.config_id,
      company_name,
      company_subtitle,
      call_assistant_no,
      made_in_value,
      company_logo,
      true
    );
  } else {
    // Create new config
    return await createConfig(
      company_name,
      company_subtitle,
      call_assistant_no,
      made_in_value,
      company_logo
    );
  }
}

export async function toggleConfigActive(configId) {
  const config = await getConfigById(configId);
  const result = await query(
    'UPDATE Label_Config SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE config_id = $2 RETURNING *',
    [!config.is_active, configId]
  );
  return result.rows[0];
}

export async function deleteConfig(configId) {
  const result = await query(
    'DELETE FROM Label_Config WHERE config_id = $1 RETURNING *',
    [configId]
  );
  return result.rows[0];
}

// ============================================
// PRINT_FORMAT OPERATIONS
// ============================================

export async function getFormats() {
  const result = await query('SELECT * FROM Print_Format ORDER BY created_at DESC');
  return result.rows;
}

export async function getFormatById(formatId) {
  const result = await query(
    'SELECT * FROM Print_Format WHERE format_id = $1',
    [formatId]
  );
  return result.rows[0];
}

export async function getFormatByName(formatName) {
  const result = await query(
    'SELECT * FROM Print_Format WHERE format_name = $1',
    [formatName]
  );
  return result.rows[0];
}

export async function createFormat(formatName, dimension, labelPerPage) {
  const result = await query(
    'INSERT INTO Print_Format (format_name, dimension, label_per_page) VALUES ($1, $2, $3) RETURNING *',
    [formatName, dimension, labelPerPage]
  );
  return result.rows[0];
}

export async function updateFormat(formatId, formatName, dimension, labelPerPage) {
  const result = await query(
    'UPDATE Print_Format SET format_name = $1, dimension = $2, label_per_page = $3, updated_at = CURRENT_TIMESTAMP WHERE format_id = $4 RETURNING *',
    [formatName, dimension, labelPerPage, formatId]
  );
  return result.rows[0];
}

export async function deleteFormat(formatId) {
  const result = await query(
    'DELETE FROM Print_Format WHERE format_id = $1 RETURNING *',
    [formatId]
  );
  return result.rows[0];
}