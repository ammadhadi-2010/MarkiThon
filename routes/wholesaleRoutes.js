const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrder, deleteOrder } = require('../controllers/wholesaleController');
const { updateWholesale } = require('../controllers/billReviseController');
const { requireVendorShop } = require('../middleware/requireVendorShop');

router.use(requireVendorShop);
router.post('/create', createOrder);
router.get('/list', getOrders);
router.get('/:id', getOrder);
router.put('/:id', updateWholesale);
router.delete('/:id', deleteOrder);

module.exports = router;
