const express = require('express');
const { listByShopType, listSubcategories } = require('../controllers/publicCategoryController');
const { requireVendorShop } = require('../middleware/requireVendorShop');

const router = express.Router();
router.use(requireVendorShop);
router.get('/', listByShopType);
router.get('/subcategories', listSubcategories);

module.exports = router;
