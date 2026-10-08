const { Op } = require('sequelize');
const Product = require('../models/Product');
const ShopProfile = require('../models/ShopProfile');
const ShopDigitalSetup = require('../models/ShopDigitalSetup');
const { withProductMargins } = require('../utils/profit');
const { packBanner } = require('./storeBannerController');
const { packStoreTheme } = require('../utils/storeThemes');
const { navCategories } = require('../utils/shopCatalog');
const { activeShopId } = require('../utils/shopScope');
const { dedupeProducts } = require('../utils/productDedupe');

function shopSlug(name) {
    return String(name || 'Ammad Hadi Stor').toLowerCase().replace(/[^a-z0-9]+/g, '') || 'ammadhadistor';
}

function shopPayload(profile, digital) {
    const p = profile ? profile.toJSON() : {};
    const d = digital ? digital.toJSON() : {};
    const theme = packStoreTheme(digital);
    return {
        shopName: p.shopName || 'Ammad Hadi Stor',
        slug: shopSlug(p.shopName),
        imageUrl: theme.assets.logo || p.imageUrl || null,
        shopAddress: p.shopAddress || '',
        marketName: p.marketName || '',
        phoneNumber: p.phoneNumber || d.whatsappNumber || '',
        websiteUrl: d.websiteUrl || p.websiteUrl || null,
        whatsappNumber: d.whatsappNumber || p.whatsappNumber || p.phoneNumber || '',
        facebookPage: d.facebookPage || p.facebookPage || null,
        instagramHandle: d.instagramHandle || p.instagramHandle || null,
        youtubeChannel: d.youtubeChannel || p.youtubeChannel || null,
        storeLocation: d.storeLocation || p.storeLocation || null,
        latitude: d.latitude || p.latitude || null,
        longitude: d.longitude || p.longitude || null,
        banner: packBanner(digital),
        coverBanner: theme.assets.hero || String(d.coverBanner || ''),
        heroBanners: Array.isArray(d.heroBanners) ? d.heroBanners : [],
        shopDescription: String(d.shopDescription || ''),
        isApproved: Boolean(d.isApproved),
        themeId: theme.themeId,
        themeAssets: theme.assets
    };
}

exports.catalog = async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { ShopId: await activeShopId() },
            order: [['title', 'ASC']]
        });
        res.status(200).json(products.map(withProductMargins));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching store catalog', error: error.message });
    }
};

exports.publicShop = async (req, res) => {
    try {
        const profile = await ShopProfile.findOne({ where: { ShopId: 1 } });
        if (!profile) return res.status(404).json({ message: 'Shop not found.' });
        const slug = shopSlug(profile.shopName);
        const asked = String(req.params.shopSlug || '').toLowerCase();
        if (asked !== slug && asked !== 'ammadhadistor') {
            return res.status(404).json({ message: 'Shop not found.' });
        }
        const digital = await ShopDigitalSetup.findOne({ where: { ShopId: 1 } });
        const products = await Product.findAll({
            where: {
                ShopId: profile.ShopId || 1,
                storePublished: { [Op.not]: false }
            },
            order: [['storeSortOrder', 'ASC'], ['title', 'ASC']]
        });
        const listed = products.map((row) => {
                const p = row.toJSON();
                const retail = Number(p.storeOnlinePrice) > 0 ? p.storeOnlinePrice : p.retailPrice;
                const was = Number(p.storeDiscountPrice) || 0;
                let gallery = [];
                try {
                    gallery = typeof p.storeImages === 'string'
                        ? JSON.parse(p.storeImages || '[]')
                        : (Array.isArray(p.storeImages) ? p.storeImages : []);
                } catch (error) {
                    gallery = [];
                }
                const imageUrl = gallery[0] || p.storeStickerImage || p.imageUrl || '';
                return {
                    id: p.id,
                    title: p.storeTitle || p.title,
                    imageUrl,
                    images: gallery.length ? gallery : (imageUrl ? [imageUrl] : []),
                    retailPrice: retail,
                    wasPrice: was,
                    stockUnit: p.stockUnit,
                    category: p.category,
                    storeSale: Boolean(p.storeSale) || was > Number(retail),
                    storeFeatured: Boolean(p.storeFeatured),
                    storeNewArrival: Boolean(p.storeNewArrival)
                };
            });
        const unique = dedupeProducts(listed);
        res.status(200).json({
            shop: shopPayload(profile, digital),
            products: unique,
            navCategories: navCategories(profile.shopType, profile.productTypes, unique)
        });
    } catch (error) {
        res.status(500).json({ message: 'Error loading public store', error: error.message });
    }
};
