const express = require('express');
const router = express.Router();
const { getProduct, patchProduct, deleteProduct } = require('../controllers/storeManageController');
const { listStickers, uploadSticker, deleteSticker } = require('../controllers/storeStickerAssets');
const { getBanner, putBanner } = require('../controllers/storeBannerController');
const { getBranding, putBranding } = require('../controllers/storeBrandingController');
const { getTheme, putTheme } = require('../controllers/storeThemeController');
const { listOrders, getOrder, createOrder, patchOrder } = require('../controllers/storeOrderController');

router.get('/products/:id', getProduct);
router.put('/products/:id', patchProduct);
router.delete('/products/:id', deleteProduct);
router.get('/stickers', listStickers);
router.post('/stickers', uploadSticker);
router.delete('/stickers/:name', deleteSticker);
router.get('/banner', getBanner);
router.put('/banner', putBanner);
router.get('/branding', getBranding);
router.put('/branding', putBranding);
router.get('/theme', getTheme);
router.put('/theme', putTheme);
router.get('/orders', listOrders);
router.post('/orders', createOrder);
router.get('/orders/:id', getOrder);
router.put('/orders/:id', patchOrder);

module.exports = router;
