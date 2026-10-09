const ShopProfile = require('../models/ShopProfile');
const ShopDigitalSetup = require('../models/ShopDigitalSetup');
const Setting = require('../models/Setting');
const { SHOP_TYPES, BUSINESS_TYPES } = ShopProfile;
const { categoriesForShop } = require('../utils/shopCatalog');
const { resolveShopType } = require('../utils/shopTypeCatalog');

function pickShopType(raw, fallback) {
    if (SHOP_TYPES.includes(raw)) return raw;
    const resolved = resolveShopType(raw);
    return SHOP_TYPES.includes(resolved) ? resolved : fallback;
}

async function getOrCreateProfile() {
    let row = await ShopProfile.findOne({ where: { ShopId: 1 } });
    if (!row) {
        row = await ShopProfile.create({
            shopName: 'Ammad Hadi Stor',
            ownerName: 'Ammad Hadi',
            phoneNumber: '0300-1234567',
            emailAddress: 'ammad@hadistor.pk',
            marketName: 'Central Market',
            shopNumber: '12-B',
            shopAddress: 'Main Market, Punjab',
            shopType: 'Clothing & Fashion',
            businessType: 'Both',
            ShopId: 1
        });
    }
    return row;
}

async function getOrCreateDigital() {
    let row = await ShopDigitalSetup.findOne({ where: { ShopId: 1 } });
    if (!row) row = await ShopDigitalSetup.create({ ShopId: 1 });
    return row;
}

async function mergedProfile() {
    const profile = await getOrCreateProfile();
    const digital = await getOrCreateDigital();
    const data = { ...profile.toJSON(), ...digital.toJSON(), shopName: profile.shopName, ownerName: profile.ownerName };
    data.catalogCategories = categoriesForShop(profile.shopType, profile.productTypes);
    return data;
}

async function syncSetting(profile) {
    let setting = await Setting.findOne({ where: { ShopId: 1 } });
    const data = {
        shopName: profile.shopName,
        ownerName: profile.ownerName,
        phone: profile.phoneNumber,
        address: profile.shopAddress,
        ShopId: 1
    };
    if (!setting) await Setting.create(data);
    else await setting.update(data);
}

exports.getProfile = async (req, res) => {
    try {
        const profile = await mergedProfile();
        await syncSetting(profile);
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching shop profile', error: error.message });
    }
};

exports.saveProfile = async (req, res) => {
    try {
        const body = req.body || {};
        const row = await getOrCreateProfile();
        await row.update({
            shopName: String(body.shopName || row.shopName).trim() || 'Ammad Hadi Stor',
            ownerName: String(body.ownerName || row.ownerName).trim(),
            ownerCnic: body.ownerCnic !== undefined
                ? (String(body.ownerCnic || '').trim().slice(0, 20) || null)
                : row.ownerCnic,
            shopSku: body.shopSku !== undefined
                ? (String(body.shopSku || '').trim().slice(0, 40) || null)
                : row.shopSku,
            phoneNumber: String(body.phoneNumber || row.phoneNumber).trim(),
            emailAddress: String(body.emailAddress || row.emailAddress).trim(),
            marketName: String(body.marketName || row.marketName).trim(),
            shopNumber: String(body.shopNumber || row.shopNumber).trim(),
            shopAddress: String(body.shopAddress || row.shopAddress).trim(),
            imageUrl: body.imageUrl === undefined ? row.imageUrl : body.imageUrl,
            shopType: pickShopType(body.shopType, row.shopType),
            businessType: BUSINESS_TYPES.includes(body.businessType) ? body.businessType : row.businessType
        });
        const digital = await getOrCreateDigital();
        await digital.update({
            websiteUrl: body.websiteUrl !== undefined ? body.websiteUrl : digital.websiteUrl,
            whatsappNumber: body.whatsappNumber !== undefined ? body.whatsappNumber : digital.whatsappNumber,
            facebookPage: body.facebookPage !== undefined ? body.facebookPage : digital.facebookPage,
            instagramHandle: body.instagramHandle !== undefined ? body.instagramHandle : digital.instagramHandle,
            youtubeChannel: body.youtubeChannel !== undefined ? body.youtubeChannel : digital.youtubeChannel,
            storeLocation: body.storeLocation !== undefined ? body.storeLocation : digital.storeLocation
        });
        const profile = await mergedProfile();
        await syncSetting(profile);
        res.status(200).json({ message: 'Shop profile saved.', profile });
    } catch (error) {
        res.status(500).json({ message: 'Error saving shop profile', error: error.message });
    }
};
