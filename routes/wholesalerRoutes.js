const express = require('express');
const router = express.Router();
const {
    addWholesaler,
    getWholesalers,
    updateWholesaler,
    deleteWholesaler
} = require('../controllers/wholesalerController');
const ledger = require('../controllers/wholesalerLedgerController');

router.post('/add', addWholesaler);
router.get('/list', getWholesalers);
router.get('/:id/ledger', ledger.listLedger);
router.post('/:id/payments', ledger.addPayment);
router.put('/:id', updateWholesaler);
router.delete('/:id', deleteWholesaler);

module.exports = router;
