const express = require('express');
const router = express.Router();
const { getProduct, patchProduct, deleteProduct } = require('../controllers/storeManageController');
const { listStickers, uploadSticker, deleteSticker } = require('../controllers/storeStickerAssets');
const { getBanner, putBanner } = require('../controllers/storeBannerController');
const { getBranding, putBranding } = require('../controllers/storeBrandingController');
const { getTheme, putTheme } = require('../controllers/storeThemeController');
const { listOrders, getOrder, createOrder, patchOrder } = require('../controllers/storeOrderController');
const { requireVendorShop } = require('../middleware/requireVendorShop');

router.post('/orders', createOrder);

router.get('/products/:id', requireVendorShop, getProduct);
router.put('/products/:id', requireVendorShop, patchProduct);
router.delete('/products/:id', requireVendorShop, deleteProduct);
router.get('/stickers', requireVendorShop, listStickers);
router.post('/stickers', requireVendorShop, uploadSticker);
router.delete('/stickers/:name', requireVendorShop, deleteSticker);
router.get('/banner', requireVendorShop, getBanner);
router.put('/banner', requireVendorShop, putBanner);
router.get('/branding', requireVendorShop, getBranding);
router.put('/branding', requireVendorShop, putBranding);
router.get('/theme', requireVendorShop, getTheme);
router.put('/theme', requireVendorShop, putTheme);
router.get('/orders', requireVendorShop, listOrders);
router.get('/orders/:id', requireVendorShop, getOrder);
router.put('/orders/:id', requireVendorShop, patchOrder);

module.exports = router;
