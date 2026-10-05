const express = require('express');
const router = express.Router();
const { getProfile, saveProfile } = require('../controllers/profileController');

router.get('/', getProfile);
router.put('/', saveProfile);

module.exports = router;
