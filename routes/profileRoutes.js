const express = require('express');
const router = express.Router();
const { getProfile, saveProfile } = require('../controllers/profileController');
const { requireVendorShop } = require('../middleware/requireVendorShop');

router.use(requireVendorShop);
router.get('/', getProfile);
router.put('/', saveProfile);

module.exports = router;
