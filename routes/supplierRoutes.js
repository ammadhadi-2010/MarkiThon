const express = require('express');
const router = express.Router();
const {
    addSupplier,
    getSuppliers,
    toggleSupplierStatus,
    updateSupplier,
    deleteSupplier
} = require('../controllers/supplierController');
const ledger = require('../controllers/supplierLedgerController');

router.post('/add', addSupplier);
router.get('/list', getSuppliers);
router.get('/:id/ledger', ledger.listLedger);
router.post('/:id/payments', ledger.addPayment);
router.put('/:id/status', toggleSupplierStatus);
router.put('/:id', updateSupplier);
router.delete('/:id', deleteSupplier);

module.exports = router;
