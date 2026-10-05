const express = require('express');
const router = express.Router();
const { createSale, getSales } = require('../controllers/saleController');

router.post('/create', createSale);
router.get('/list', getSales);

module.exports = router;