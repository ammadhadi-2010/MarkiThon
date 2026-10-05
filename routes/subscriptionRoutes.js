const express = require('express');
const { requireRole } = require('../middleware/authGuard');
const {
    getPlans,
    savePlans,
    getShopSubscription,
    subscribeStep4,
    overrideShopLimits,
    approvePayment,
    listPendingPayments
} = require('../controllers/subscriptionController');

const router = express.Router();
const adminOnly = requireRole('admin');

router.get('/plans', getPlans);
router.get('/shop', getShopSubscription);
router.post('/subscribe', subscribeStep4);
router.get('/pending-payments', adminOnly, listPendingPayments);
router.post('/approve-payment', adminOnly, approvePayment);
router.put('/plans', adminOnly, savePlans);
router.post('/plans', adminOnly, savePlans);
router.put('/shop-limits', adminOnly, overrideShopLimits);
router.post('/shop-limits', adminOnly, overrideShopLimits);

module.exports = router;
