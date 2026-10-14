const express = require('express');
const { listSubcategories } = require('../controllers/publicCategoryController');
const { requireVendorShop } = require('../middleware/requireVendorShop');

const router = express.Router();
router.use(requireVendorShop);
router.get('/', listSubcategories);

module.exports = router;
