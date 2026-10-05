const express = require('express');
const router = express.Router();
const { createBill, listBills, getBill, deleteBill, addCustomer, listCustomers } = require('../controllers/retailController');
const { listCustomerHub, updateCustomer, destroyCustomer } = require('../controllers/customerHubController');
const { updateRetail } = require('../controllers/billReviseController');

router.post('/create', createBill);
router.get('/list', listBills);
router.get('/customers/hub', listCustomerHub);
router.put('/customers/:id', updateCustomer);
router.delete('/customers/:id', destroyCustomer);
router.post('/customers', addCustomer);
router.get('/customers', listCustomers);
router.get('/:id', getBill);
router.put('/:id', updateRetail);
router.delete('/:id', deleteBill);

module.exports = router;
