const express = require('express');
const { listByShopType, listSubcategories } = require('../controllers/publicCategoryController');

const router = express.Router();
router.get('/', listByShopType);
router.get('/subcategories', listSubcategories);

module.exports = router;
