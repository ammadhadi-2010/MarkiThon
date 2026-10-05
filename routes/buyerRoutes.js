const express = require('express');
const { register, login, google } = require('../controllers/buyerAuthController');
const { me, updateMe, orders } = require('../controllers/buyerAccountController');
const { requireBuyer } = require('../utils/buyerGuard');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', google);
router.get('/me', requireBuyer, me);
router.patch('/me', requireBuyer, updateMe);
router.get('/orders', requireBuyer, orders);

module.exports = router;
