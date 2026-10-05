const express = require('express');
const router = express.Router();
const report = require('../controllers/reportController');

router.get('/sales', report.sales);
router.get('/purchases', report.purchases);
router.get('/stock', report.stock);
router.get('/profit', report.profit);
router.get('/low-stock', report.lowStock);
router.get('/customers', report.customers);
router.get('/suppliers', report.suppliers);
router.get('/expenses', report.expenses);
router.get('/export', report.exportReport);

module.exports = router;
