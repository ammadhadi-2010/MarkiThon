const express = require('express');
const { requireRole } = require('../middleware/authGuard');
const { overview, decide, reports } = require('../controllers/platformController');
const {
    shops,
    shopOne,
    createShop,
    updateShop,
    liveProfile
} = require('../controllers/platformShopController');
const { products, createProduct, updateProduct, bulkProducts } = require('../controllers/platformProductController');
const { vendors, updateVendor } = require('../controllers/adminVendorController');

const router = express.Router();
const adminOnly = requireRole('admin');

router.use(adminOnly);

router.get('/overview', overview);
router.get('/reports', reports);
router.get('/vendors', vendors);
router.post('/vendors/:id', updateVendor);
router.get('/shops', shops);
router.get('/shop-profile', liveProfile);
router.get('/shops/:id', shopOne);
router.post('/shops', createShop);
router.post('/shops/:id', updateShop);
router.get('/products', products);
router.post('/products/bulk', bulkProducts);
router.post('/products', createProduct);
router.post('/products/:id', updateProduct);
router.post('/applications/:id', decide);

module.exports = router;
