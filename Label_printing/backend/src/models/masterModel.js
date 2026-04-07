import { query } from '../config/database.js';

// ============================================
// PRODUCT OPERATIONS
// ============================================

// Returns ALL products (active + inactive) for Master Management
export async function getProducts() {
  const result = await query('SELECT * FROM Product ORDER BY created_at DESC');
  return result.rows;
}

// Returns ONLY ACTIVE products for dropdowns
export async function getActiveProducts() {
  const result = await query('SELECT * FROM Product WHERE is_active = true ORDER BY created_at DESC');
  return result.rows;
}

export async function getProductById(productId) {
  const result = await query(
    'SELECT * FROM Product WHERE product_id = $1',
    [productId]
  );
  return result.rows[0];
}

export async function getProductByName(productName) {
  const result = await query(
    'SELECT * FROM Product WHERE product_name = $1',
    [productName]
  );
  return result.rows[0];
}

export async function createProduct(productName) {
  const result = await query(
    'INSERT INTO Product (product_name, is_active) VALUES ($1, true) RETURNING *',
    [productName]
  );
  return result.rows[0];
}

export async function updateProduct(productId, productName, isActive) {
  const result = await query(
    'UPDATE Product SET product_name = $1, is_active = $2, updated_at = CURRENT_TIMESTAMP WHERE product_id = $3 RETURNING *',
    [productName, isActive, productId]
  );
  return result.rows[0];
}

export async function toggleProductActive(productId) {
  const product = await getProductById(productId);
  const result = await query(
    'UPDATE Product SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE product_id = $2 RETURNING *',
    [!product.is_active, productId]
  );
  return result.rows[0];
}

export async function deleteProduct(productId) {
  const result = await query(
    'DELETE FROM Product WHERE product_id = $1 RETURNING *',
    [productId]
  );
  return result.rows[0];
}

// ============================================
// CAPACITIES OPERATIONS
// ============================================

// Returns ALL capacities (active + inactive) for Master Management
export async function getCapacities() {
  const result = await query('SELECT * FROM Capacities ORDER BY created_at DESC');
  return result.rows;
}

// Returns ONLY ACTIVE capacities for dropdowns
export async function getActiveCapacities() {
  const result = await query('SELECT * FROM Capacities WHERE is_active = true ORDER BY created_at DESC');
  return result.rows;
}

export async function getCapacityById(capacityId) {
  const result = await query(
    'SELECT * FROM Capacities WHERE capacity_id = $1',
    [capacityId]
  );
  return result.rows[0];
}

export async function getCapacityByValue(capacityValue) {
  const result = await query(
    'SELECT * FROM Capacities WHERE capacity_value = $1',
    [capacityValue]
  );
  return result.rows[0];
}

export async function createCapacity(capacityValue) {
  const result = await query(
    'INSERT INTO Capacities (capacity_value, is_active) VALUES ($1, true) RETURNING *',
    [capacityValue]
  );
  return result.rows[0];
}

export async function updateCapacity(capacityId, capacityValue, isActive) {
  const result = await query(
    'UPDATE Capacities SET capacity_value = $1, is_active = $2, updated_at = CURRENT_TIMESTAMP WHERE capacity_id = $3 RETURNING *',
    [capacityValue, isActive, capacityId]
  );
  return result.rows[0];
}

export async function toggleCapacityActive(capacityId) {
  const capacity = await getCapacityById(capacityId);
  const result = await query(
    'UPDATE Capacities SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE capacity_id = $2 RETURNING *',
    [!capacity.is_active, capacityId]
  );
  return result.rows[0];
}

export async function deleteCapacity(capacityId) {
  const result = await query(
    'DELETE FROM Capacities WHERE capacity_id = $1 RETURNING *',
    [capacityId]
  );
  return result.rows[0];
}

// ============================================
// MODEL_NUMBER OPERATIONS
// ============================================

// Returns ALL models (active + inactive) for Master Management
export async function getModels() {
  const result = await query('SELECT * FROM Model_Number ORDER BY created_at DESC');
  return result.rows;
}

// Returns ONLY ACTIVE models for dropdowns
export async function getActiveModels() {
  const result = await query('SELECT * FROM Model_Number WHERE is_active = true ORDER BY created_at DESC');
  return result.rows;
}

export async function getModelById(modelId) {
  const result = await query(
    'SELECT * FROM Model_Number WHERE model_id = $1',
    [modelId]
  );
  return result.rows[0];
}

export async function getModelByName(modelName) {
  const result = await query(
    'SELECT * FROM Model_Number WHERE model_name = $1',
    [modelName]
  );
  return result.rows[0];
}

export async function createModel(modelName) {
  const result = await query(
    'INSERT INTO Model_Number (model_name, is_active) VALUES ($1, true) RETURNING *',
    [modelName]
  );
  return result.rows[0];
}

export async function updateModel(modelId, modelName, isActive) {
  const result = await query(
    'UPDATE Model_Number SET model_name = $1, is_active = $2, updated_at = CURRENT_TIMESTAMP WHERE model_id = $3 RETURNING *',
    [modelName, isActive, modelId]
  );
  return result.rows[0];
}

export async function toggleModelActive(modelId) {
  const model = await getModelById(modelId);
  const result = await query(
    'UPDATE Model_Number SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE model_id = $2 RETURNING *',
    [!model.is_active, modelId]
  );
  return result.rows[0];
}

export async function deleteModel(modelId) {
  const result = await query(
    'DELETE FROM Model_Number WHERE model_id = $1 RETURNING *',
    [modelId]
  );
  return result.rows[0];
}