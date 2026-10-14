const express = require('express');
const router = express.Router();
const { getBill } = require('../controllers/billController');
const { requireVendorShop } = require('../middleware/requireVendorShop');

router.use(requireVendorShop);
router.get('/:id', getBill);

module.exports = router;
