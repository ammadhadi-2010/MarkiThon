const express = require('express');
const { requireRole } = require('../middleware/authGuard');
const { adminLogin, adminMe, adminUpdateProfile, adminUpdatePassword, logout } = require('../controllers/authAdminController');
const { vendorRegister, vendorLogin, vendorMe, vendorWebauthnBegin, vendorWebauthnFinish } = require('../controllers/authVendorController');
const {
    customerRegister,
    customerLogin,
    customerForgot,
    customerReset,
    customerMe
} = require('../controllers/authCustomerController');
const { googleConfig, googleSignIn } = require('../controllers/googleAuthController');

const router = express.Router();

router.post('/admin/login', adminLogin);
router.get('/admin/me', requireRole('admin'), adminMe);
router.put('/admin/profile', requireRole('admin'), adminUpdateProfile);
router.post('/admin/profile', requireRole('admin'), adminUpdateProfile);
router.post('/admin/password', requireRole('admin'), adminUpdatePassword);

router.post('/vendor/register', vendorRegister);
router.post('/vendor/login', vendorLogin);
router.post('/vendor/webauthn/begin', vendorWebauthnBegin);
router.post('/vendor/webauthn/finish', vendorWebauthnFinish);
router.get('/vendor/me', requireRole('vendor'), vendorMe);

router.post('/customer/register', customerRegister);
router.post('/customer/login', customerLogin);
router.post('/customer/forgot', customerForgot);
router.post('/customer/reset', customerReset);
router.get('/customer/me', requireRole('customer'), customerMe);

router.get('/google-config', googleConfig);
router.post('/google', googleSignIn);
router.post('/logout', logout);

module.exports = router;
