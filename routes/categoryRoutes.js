const express = require('express');
const { listByShopType } = require('../controllers/publicCategoryController');

const router = express.Router();
router.get('/', listByShopType);

module.exports = router;
