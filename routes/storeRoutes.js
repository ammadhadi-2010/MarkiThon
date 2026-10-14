const express = require('express');
const router = express.Router();
const { catalog, publicShop } = require('../controllers/storeController');
const { listPublicCampaigns } = require('../controllers/storeCampaignController');
const { listManage, patchProduct, getProduct } = require('../controllers/storeManageController');
const { requireVendorShop } = require('../middleware/requireVendorShop');

router.get('/catalog', catalog);
router.get('/campaigns', listPublicCampaigns);
router.get('/manage', requireVendorShop, listManage);
router.get('/products/:id', getProduct);
router.put('/products/:id', requireVendorShop, patchProduct);
router.get('/:shopSlug', publicShop);

module.exports = router;
