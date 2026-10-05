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

router.post('/add', addProduct);
router.get('/list', getProducts);
router.get('/:id/reviews', listProductReviews);
router.post('/:id/reviews', addProductReview);
router.get('/:id', getPublicProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
