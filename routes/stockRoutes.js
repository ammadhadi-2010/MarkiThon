const express = require('express');
const router = express.Router();
const { getProductStockHistory, getStockMovement } = require('../controllers/stockController');
const { receiveStock } = require('../controllers/receiveController');
const { listVouchers, getVoucher } = require('../controllers/voucherList');
const { updateVoucher, deleteVoucher } = require('../controllers/voucherMutate');

router.post('/receive', receiveStock);
router.get('/vouchers', listVouchers);
router.get('/vouchers/:id', getVoucher);
router.put('/vouchers/:id', updateVoucher);
router.delete('/vouchers/:id', deleteVoucher);
router.get('/stock-movement', getStockMovement);
router.get('/:productId/stock-history', getProductStockHistory);

module.exports = router;
