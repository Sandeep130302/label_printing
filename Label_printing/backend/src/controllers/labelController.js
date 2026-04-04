import * as labelModel from '../models/labelModel.js';

export async function getLabels(req, res) {
  try {
    const labels = await labelModel.getLabelsWithDetails();
    res.json({ success: true, data: labels, message: 'Labels retrieved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to retrieve labels', details: error.message });
  }
}

export async function getLabelById(req, res) {
  try {
    const { id } = req.params;
    const label = await labelModel.getLabelWithDetails(id);
    if (!label) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Label not found' });
    res.json({ success: true, data: label, message: 'Label retrieved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to retrieve label', details: error.message });
  }
}

// ✅ FIXED: Added duplicateCount parameter
export async function createLabel(req, res) {
  try {
    const { productId, capacityId, modelId, serialId, manufacturingCode, ssn, qrData, formatId, configId, duplicateCount } = req.body;
    if (!productId || !capacityId || !modelId || !serialId) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'Missing required fields' });
    }
    const label = await labelModel.createLabel(
      productId, 
      capacityId, 
      modelId, 
      serialId, 
      manufacturingCode, 
      ssn, 
      qrData, 
      formatId, 
      configId,
      duplicateCount || 1  // ✅ Default to 1 if not provided
    );
    res.status(201).json({ success: true, data: label, message: 'Label created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to create label', details: error.message });
  }
}

export async function updateLabel(req, res) {
  try {
    const { id } = req.params;
    const label = await labelModel.updateLabel(id, req.body);
    if (!label) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Label not found' });
    res.json({ success: true, data: label, message: 'Label updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to update label', details: error.message });
  }
}

export async function deleteLabel(req, res) {
  try {
    const { id } = req.params;
    const label = await labelModel.softDeleteLabel(id);
    if (!label) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Label not found' });
    res.json({ success: true, data: label, message: 'Label deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to delete label', details: error.message });
  }
}

export async function searchLabels(req, res) {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'Search query required' });
    const labels = await labelModel.searchLabels(q);
    res.json({ success: true, data: labels, message: 'Labels found' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Search failed', details: error.message });
  }
}

export async function getLabelStats(req, res) {
  try {
    const stats = await labelModel.getLabelStats();
    res.json({ success: true, data: stats, message: 'Label statistics retrieved' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to retrieve stats', details: error.message });
  }
}