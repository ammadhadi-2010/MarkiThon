const express = require('express');
const router = express.Router();
const { getSettings, saveSettings, getStoreQr, getStoreApproval, putStoreApproval } = require('../controllers/settingController');
const { getStep1, saveStep1 } = require('../controllers/onboardingController');
const { getStorePolicies, saveStorePolicies } = require('../controllers/storePolicyController');

router.get('/store-policies', getStorePolicies);
router.put('/store-policies', saveStorePolicies);
router.get('/store-qr', getStoreQr);
router.get('/store-approval', getStoreApproval);
router.put('/store-approval', putStoreApproval);
router.get('/', getSettings);
router.put('/', saveSettings);
router.get('/shop-profile', getStep1);
router.put('/shop-profile', saveStep1);
router.post('/shop-profile', saveStep1);

module.exports = router;
