const express = require('express');
const { list, save, remove } = require('../controllers/catalogTermController');
const { requireVendorShop } = require('../middleware/requireVendorShop');

const router = express.Router();

router.use(requireVendorShop);
router.get('/terms', list);
router.post('/terms', save);
router.put('/terms', save);
router.delete('/terms', remove);

module.exports = router;
