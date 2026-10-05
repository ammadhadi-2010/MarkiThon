const express = require('express');
const router = express.Router();
const { addTransaction, getCustomerLedger, listLedger } = require('../controllers/ledgerController');

router.post('/add', addTransaction);
router.get('/list', listLedger);
router.get('/:customerName', getCustomerLedger);

module.exports = router;
