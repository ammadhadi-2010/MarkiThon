const express = require('express');
const router = express.Router();
const { getSettings, saveSettings, getStoreQr, getStoreApproval, putStoreApproval } = require('../controllers/settingController');
const { getStep1, saveStep1 } = require('../controllers/onboardingController');
const { getStorePolicies, saveStorePolicies } = require('../controllers/storePolicyController');
const { requireVendorShop } = require('../middleware/requireVendorShop');
const { requireRole } = require('../middleware/authGuard');

router.get('/store-qr', getStoreQr);
router.put('/store-approval', requireRole('admin'), putStoreApproval);

router.use(requireVendorShop);
router.get('/store-policies', getStorePolicies);
router.put('/store-policies', saveStorePolicies);
router.get('/store-approval', getStoreApproval);
router.get('/', getSettings);
router.put('/', saveSettings);
router.get('/shop-profile', getStep1);
router.put('/shop-profile', saveStep1);
router.post('/shop-profile', saveStep1);

module.exports = router;
