const express = require('express');
const router = express.Router();
const { addExpense, listExpenses } = require('../controllers/expenseController');
const { staffLedger } = require('../controllers/expenseLedgerController');

router.post('/add', addExpense);
router.get('/list', listExpenses);
router.get('/staff-ledger', staffLedger);

module.exports = router;
