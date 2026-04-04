// import express from 'express';
// import * as masterController from '../controllers/masterController.js';

// const router = express.Router();

// // ============================================
// // PRODUCT ROUTES
// // ============================================
// router.get('/products', masterController.getProducts);
// router.get('/products/:id', masterController.getProductById);
// router.post('/products', masterController.createProduct);
// router.put('/products/:id', masterController.updateProduct);
// router.delete('/products/:id', masterController.deleteProduct);
// router.patch('/products/:id/toggle', masterController.toggleProductActive);

// // ============================================
// // CAPACITIES ROUTES
// // ============================================
// router.get('/capacities', masterController.getCapacities);
// router.post('/capacities', masterController.createCapacity);
// router.put('/capacities/:id', masterController.updateCapacity);
// router.delete('/capacities/:id', masterController.deleteCapacity);

// // ============================================
// // MODEL_NUMBER ROUTES
// // ============================================
// router.get('/models', masterController.getModels);
// router.post('/models', masterController.createModel);
// router.put('/models/:id', masterController.updateModel);
// router.delete('/models/:id', masterController.deleteModel);

// export default router;


import express from 'express';
import * as masterController from '../controllers/masterController.js';

const router = express.Router();

// ============================================
// PRODUCT ROUTES
// ============================================
router.get('/products', masterController.getProducts);                    // ALL products (Master Management)
router.get('/products/active', masterController.getActiveProducts);       // ACTIVE only (Dropdowns)
router.get('/products/:id', masterController.getProductById);
router.post('/products', masterController.createProduct);
router.put('/products/:id', masterController.updateProduct);
router.delete('/products/:id', masterController.deleteProduct);
router.patch('/products/:id/toggle', masterController.toggleProductActive);

// ============================================
// CAPACITIES ROUTES
// ============================================
router.get('/capacities', masterController.getCapacities);                // ALL capacities (Master Management)
router.get('/capacities/active', masterController.getActiveCapacities);   // ACTIVE only (Dropdowns)
router.post('/capacities', masterController.createCapacity);
router.put('/capacities/:id', masterController.updateCapacity);
router.delete('/capacities/:id', masterController.deleteCapacity);

// ============================================
// MODEL_NUMBER ROUTES
// ============================================
router.get('/models', masterController.getModels);                        // ALL models (Master Management)
router.get('/models/active', masterController.getActiveModels);           // ACTIVE only (Dropdowns)
router.post('/models', masterController.createModel);
router.put('/models/:id', masterController.updateModel);
router.delete('/models/:id', masterController.deleteModel);

export default router;