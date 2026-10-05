const express = require('express');
const { requireRole } = require('../middleware/authGuard');
const { getProfile, saveProfile } = require('../controllers/vendorProfileController');
const { saveSecurity, changePassword, webauthnBegin, webauthnFinish } = require('../controllers/vendorSecurityController');

const router = express.Router();
const vendorOnly = requireRole('vendor');

router.get('/profile', vendorOnly, getProfile);
router.put('/profile', vendorOnly, saveProfile);
router.post('/profile', vendorOnly, saveProfile);
router.put('/security', vendorOnly, saveSecurity);
router.post('/security', vendorOnly, saveSecurity);
router.put('/change-password', vendorOnly, changePassword);
router.post('/change-password', vendorOnly, changePassword);
router.post('/security/webauthn/begin', vendorOnly, webauthnBegin);
router.post('/security/webauthn/finish', vendorOnly, webauthnFinish);

module.exports = router;
