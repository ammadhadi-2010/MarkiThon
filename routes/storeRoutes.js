const express = require('express');
const router = express.Router();
const { catalog, publicShop } = require('../controllers/storeController');
const { listPublicCampaigns } = require('../controllers/storeCampaignController');
const { listManage, patchProduct, getProduct } = require('../controllers/storeManageController');

router.get('/catalog', catalog);
router.get('/campaigns', listPublicCampaigns);
router.get('/manage', listManage);
router.get('/products/:id', getProduct);
router.put('/products/:id', patchProduct);
router.get('/:shopSlug', publicShop);

module.exports = router;
