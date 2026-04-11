
import * as masterModel from '../models/masterModel.js';

// ============================================
// PRODUCT ENDPOINTS
// ============================================

// GET ALL products (for Master Management)
export async function getProducts(req, res) {
  try {
    const products = await masterModel.getProducts();
    res.json({
      success: true,
      data: products,
      message: 'Products retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve products',
      details: error.message
    });
  }
}

// GET ACTIVE products only (for dropdowns)
export async function getActiveProducts(req, res) {
  try {
    const products = await masterModel.getActiveProducts();
    res.json({
      success: true,
      data: products,
      message: 'Active products retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching active products:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve active products',
      details: error.message
    });
  }
}

export async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await masterModel.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product,
      message: 'Product retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve product',
      details: error.message
    });
  }
}

export async function createProduct(req, res) {
  try {
    const { productName } = req.body;

    // Validation
    if (!productName || productName.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Product name is required'
      });
    }

    const product = await masterModel.createProduct(productName);

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Error creating product:', error);

    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'DUPLICATE_ENTRY',
        message: 'Product name already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to create product',
      details: error.message
    });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { productName, isActive } = req.body;

    // Validation
    if (!productName || productName.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Product name is required'
      });
    }

    const product = await masterModel.updateProduct(id, productName, isActive);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to update product',
      details: error.message
    });
  }
}

export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await masterModel.deleteProduct(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to delete product',
      details: error.message
    });
  }
}

export async function toggleProductActive(req, res) {
  try {
    const { id } = req.params;
    const product = await masterModel.toggleProductActive(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product,
      message: `Product ${product.is_active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling product active:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to toggle product active status',
      details: error.message
    });
  }
}

// ============================================
// CAPACITIES ENDPOINTS
// ============================================

// GET ALL capacities (for Master Management)
export async function getCapacities(req, res) {
  try {
    const capacities = await masterModel.getCapacities();
    res.json({
      success: true,
      data: capacities,
      message: 'Capacities retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching capacities:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve capacities',
      details: error.message
    });
  }
}

// GET ACTIVE capacities only (for dropdowns)
export async function getActiveCapacities(req, res) {
  try {
    const capacities = await masterModel.getActiveCapacities();
    res.json({
      success: true,
      data: capacities,
      message: 'Active capacities retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching active capacities:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve active capacities',
      details: error.message
    });
  }
}

export async function createCapacity(req, res) {
  try {
    const { capacityValue } = req.body;

    if (!capacityValue || capacityValue.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Capacity value is required'
      });
    }

    const capacity = await masterModel.createCapacity(capacityValue);

    res.status(201).json({
      success: true,
      data: capacity,
      message: 'Capacity created successfully'
    });
  } catch (error) {
    console.error('Error creating capacity:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'DUPLICATE_ENTRY',
        message: 'Capacity value already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to create capacity',
      details: error.message
    });
  }
}

export async function updateCapacity(req, res) {
  try {
    const { id } = req.params;
    const { capacityValue, isActive } = req.body;

    if (!capacityValue || capacityValue.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Capacity value is required'
      });
    }

    const capacity = await masterModel.updateCapacity(id, capacityValue, isActive);

    if (!capacity) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Capacity not found'
      });
    }

    res.json({
      success: true,
      data: capacity,
      message: 'Capacity updated successfully'
    });
  } catch (error) {
    console.error('Error updating capacity:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to update capacity',
      details: error.message
    });
  }
}

export async function deleteCapacity(req, res) {
  try {
    const { id } = req.params;
    const capacity = await masterModel.deleteCapacity(id);

    if (!capacity) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Capacity not found'
      });
    }

    res.json({
      success: true,
      data: capacity,
      message: 'Capacity deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting capacity:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to delete capacity',
      details: error.message
    });
  }
}

// ============================================
// MODEL_NUMBER ENDPOINTS
// ============================================

// GET ALL models (for Master Management)
export async function getModels(req, res) {
  try {
    const models = await masterModel.getModels();
    res.json({
      success: true,
      data: models,
      message: 'Models retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve models',
      details: error.message
    });
  }
}

// GET ACTIVE models only (for dropdowns)
export async function getActiveModels(req, res) {
  try {
    const models = await masterModel.getActiveModels();
    res.json({
      success: true,
      data: models,
      message: 'Active models retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching active models:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve active models',
      details: error.message
    });
  }
}

export async function createModel(req, res) {
  try {
    const { modelName } = req.body;

    if (!modelName || modelName.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Model name is required'
      });
    }

    const model = await masterModel.createModel(modelName);

    res.status(201).json({
      success: true,
      data: model,
      message: 'Model created successfully'
    });
  } catch (error) {
    console.error('Error creating model:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'DUPLICATE_ENTRY',
        message: 'Model name already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to create model',
      details: error.message
    });
  }
}

export async function updateModel(req, res) {
  try {
    const { id } = req.params;
    const { modelName, isActive } = req.body;

    if (!modelName || modelName.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Model name is required'
      });
    }

    const model = await masterModel.updateModel(id, modelName, isActive);

    if (!model) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Model not found'
      });
    }

    res.json({
      success: true,
      data: model,
      message: 'Model updated successfully'
    });
  } catch (error) {
    console.error('Error updating model:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to update model',
      details: error.message
    });
  }
}

export async function deleteModel(req, res) {
  try {
    const { id } = req.params;
    const model = await masterModel.deleteModel(id);

    if (!model) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Model not found'
      });
    }

    res.json({
      success: true,
      data: model,
      message: 'Model deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting model:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to delete model',
      details: error.message
    });
  }
}