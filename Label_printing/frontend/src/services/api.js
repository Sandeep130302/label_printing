// ============================================
// API SERVICE - CENTRALIZED API CALLS
// ============================================
// All API endpoints defined here
// Makes it easy to change URLs or add auth headers

const API_BASE_URL = 'https://label-printing-5qu6.onrender.com/api';

// ============================================
// HELPER FUNCTION - API CALL WITH ERROR HANDLING
// ============================================

async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API call failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ============================================
// MASTER ENDPOINTS
// ============================================

// PRODUCTS
// Get ALL products (for Master Management table)
export async function getProducts() {
  return apiCall('/master/products');
}

// Get ACTIVE products only (for dropdowns)
export async function getActiveProducts() {
  return apiCall('/master/products/active');
}

export async function getProductById(id) {
  return apiCall(`/master/products/${id}`);
}

export async function createProduct(productName) {
  return apiCall('/master/products', {
    method: 'POST',
    body: JSON.stringify({ productName })
  });
}

export async function updateProduct(id, productName, isActive) {
  return apiCall(`/master/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ productName, isActive })
  });
}

export async function deleteProduct(id) {
  return apiCall(`/master/products/${id}`, {
    method: 'DELETE'
  });
}

export async function toggleProductActive(id) {
  return apiCall(`/master/products/${id}/toggle`, {
    method: 'PATCH'
  });
}

// CAPACITIES
// Get ALL capacities (for Master Management table)
export async function getCapacities() {
  return apiCall('/master/capacities');
}

// Get ACTIVE capacities only (for dropdowns)
export async function getActiveCapacities() {
  return apiCall('/master/capacities/active');
}

export async function createCapacity(capacityValue) {
  return apiCall('/master/capacities', {
    method: 'POST',
    body: JSON.stringify({ capacityValue })
  });
}

export async function updateCapacity(id, capacityValue, isActive) {
  return apiCall(`/master/capacities/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ capacityValue, isActive })
  });
}

export async function deleteCapacity(id) {
  return apiCall(`/master/capacities/${id}`, {
    method: 'DELETE'
  });
}

// MODELS
// Get ALL models (for Master Management table)
export async function getModels() {
  return apiCall('/master/models');
}

// Get ACTIVE models only (for dropdowns)
export async function getActiveModels() {
  return apiCall('/master/models/active');
}

export async function createModel(modelName) {
  return apiCall('/master/models', {
    method: 'POST',
    body: JSON.stringify({ modelName })
  });
}

export async function updateModel(id, modelName, isActive) {
  return apiCall(`/master/models/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ modelName, isActive })
  });
}

export async function deleteModel(id) {
  return apiCall(`/master/models/${id}`, {
    method: 'DELETE'
  });
}

// ============================================
// CONFIG ENDPOINTS
// ============================================

export async function getConfigs() {
  return apiCall('/config');
}

// Get active config for label printing
export async function getActiveConfig() {
  return apiCall('/config/active');
}

export async function createConfig(companyName, companySubtitle, callAssistantNo, madeInValue, companyLogo) {
  return apiCall('/config', {
    method: 'POST',
    body: JSON.stringify({ companyName, companySubtitle, callAssistantNo, madeInValue, companyLogo })
  });
}

export async function updateConfig(id, companyName, companySubtitle, callAssistantNo, madeInValue, companyLogo, isActive) {
  return apiCall(`/config/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ companyName, companySubtitle, callAssistantNo, madeInValue, companyLogo, isActive })
  });
}

// Save config (create or update) - for Settings page
export async function saveConfig(data) {
  return apiCall('/config/save', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function getFormats() {
  return apiCall('/config/formats/all');
}

export async function createFormat(formatName, dimension, labelPerPage) {
  return apiCall('/config/formats', {
    method: 'POST',
    body: JSON.stringify({ formatName, dimension, labelPerPage })
  });
}

export async function updateFormat(id, formatName, dimension, labelPerPage) {
  return apiCall(`/config/formats/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ formatName, dimension, labelPerPage })
  });
}

// ============================================
// SERIAL ENDPOINTS
// ============================================

export async function getCounters() {
  return apiCall('/serials/counters');
}

// Get current financial year counter
export async function getCurrentCounter() {
  return apiCall('/serials/counters/current');
}

export async function createCounter(financialYearStart, nextReset) {
  return apiCall('/serials/counters', {
    method: 'POST',
    body: JSON.stringify({ financialYearStart, nextReset })
  });
}

export async function generateSerialNumber(counterId) {
  return apiCall('/serials/generate', {
    method: 'POST',
    body: JSON.stringify({ counterId })
  });
}

// Auto-generate serial number (uses current financial year counter automatically)
export async function autoGenerateSerialNumber() {
  return apiCall('/serials/auto-generate', {
    method: 'POST'
  });
}

// Batch generate multiple serial numbers in ONE transaction (prevents race conditions)
export async function batchGenerateSerialNumbers(count) {
  return apiCall('/serials/batch-generate', {
    method: 'POST',
    body: JSON.stringify({ count })
  });
}

// ============================================
// ✅ NEW: VOID BATCH SERIALS
// Called when user cancels from PrintPreview
// This deletes the pending serial numbers and decrements the counter
// Ensures serial numbers are not wasted when print is cancelled
// ============================================
export async function voidBatchSerials(serialIds) {
  return apiCall('/serials/void-batch', {
    method: 'POST',
    body: JSON.stringify({ serialIds })
  });
}

export async function validateSerial(serialNumber) {
  return apiCall(`/serials/validate/${serialNumber}`);
}

export async function getSerialStats() {
  return apiCall('/serials/stats');
}

// ============================================
// LABEL ENDPOINTS
// ============================================

export async function getLabels() {
  return apiCall('/labels');
}

export async function getLabelById(id) {
  return apiCall(`/labels/${id}`);
}

// Added duplicateCount parameter
export async function createLabel(productId, capacityId, modelId, serialId, manufacturingCode, ssn, qrData, formatId, configId, duplicateCount = 1) {
  return apiCall('/labels', {
    method: 'POST',
    body: JSON.stringify({
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
    })
  });
}

export async function updateLabel(id, updates) {
  return apiCall(`/labels/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
}

export async function deleteLabel(id) {
  return apiCall(`/labels/${id}`, {
    method: 'DELETE'
  });
}

export async function searchLabels(query) {
  return apiCall(`/labels/search/query?q=${encodeURIComponent(query)}`);
}

export async function getLabelStats() {
  return apiCall('/labels/stats/all');
}

// ============================================
// REPORT ENDPOINTS
// ============================================

export async function getEventReports() {
  return apiCall('/reports/events');
}

export async function getEventReportById(id) {
  return apiCall(`/reports/events/${id}`);
}

export async function createEventReport(eventNumber, numberOfLabelsPrinted) {
  return apiCall('/reports/events', {
    method: 'POST',
    body: JSON.stringify({ eventNumber, numberOfLabelsPrinted })
  });
}

export async function getReports() {
  return apiCall('/reports');
}

export async function getReportsByEvent(eventId) {
  return apiCall(`/reports/events/${eventId}/reports`);
}

export async function createReport(eventId, productName, capacityName, modelName, serialNumber, manufacturingCode, ssn, qrData) {
  return apiCall('/reports', {
    method: 'POST',
    body: JSON.stringify({
      eventId,
      productName,
      capacityName,
      modelName,
      serialNumber,
      manufacturingCode,
      ssn,
      qrData
    })
  });
}

export async function markAsReprinted(id) {
  return apiCall(`/reports/${id}/mark-reprinted`, {
    method: 'POST'
  });
}

export async function getReportSummary() {
  return apiCall('/reports/summary');
}

export async function getReportsByFilter(filters) {
  const queryString = new URLSearchParams(filters).toString();
  return apiCall(`/reports/filter?${queryString}`);
}

// ============================================
// EXPORT BASE URL FOR REFERENCE
// ============================================

export { API_BASE_URL };