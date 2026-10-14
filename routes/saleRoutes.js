const express = require('express');
const router = express.Router();
const { createSale, getSales } = require('../controllers/saleController');
const { requireVendorShop } = require('../middleware/requireVendorShop');

router.use(requireVendorShop);
router.post('/create', createSale);
router.get('/list', getSales);

module.exports = router;
