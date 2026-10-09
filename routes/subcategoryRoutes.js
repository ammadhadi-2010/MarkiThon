const express = require('express');
const { listSubcategories } = require('../controllers/publicCategoryController');

const router = express.Router();
router.get('/', listSubcategories);

module.exports = router;
