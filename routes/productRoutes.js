const express = require('express');
const router = express.Router();
const {
    addProduct,
    getProducts,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { getPublicProduct } = require('../controllers/publicProductController');
const { listProductReviews, addProductReview } = require('../controllers/productReviewController');
const { requireVendorShop } = require('../middleware/requireVendorShop');

router.post('/add', requireVendorShop, addProduct);
router.get('/list', requireVendorShop, getProducts);
router.get('/:id/reviews', listProductReviews);
router.post('/:id/reviews', addProductReview);
router.get('/:id', getPublicProduct);
router.put('/:id', requireVendorShop, updateProduct);
router.delete('/:id', requireVendorShop, deleteProduct);

module.exports = router;
