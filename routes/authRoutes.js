const express = require('express');
const router = express.Router();
const { registerShop, loginShop } = require('../controllers/authController');

router.post('/register', registerShop);
router.post('/login', loginShop);

module.exports = router;