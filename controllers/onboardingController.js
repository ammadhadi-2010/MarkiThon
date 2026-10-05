const ShopProfile = require('../models/ShopProfile');
const ShopSubscription = require('../models/ShopSubscription');
const ShopDigitalSetup = require('../models/ShopDigitalSetup');
const { SHOP_TYPES, BUSINESS_TYPES } = ShopProfile;
const { categoriesForShop } = require('../utils/shopCatalog');
const Setting = require('../models/Setting');

function payloadFromBody(body) {
    return {
        shopName: String(body.shopName || '').trim(),
        ownerName: String(body.ownerName || '').trim(),
        ownerCnic: String(body.ownerCnic || '').trim().slice(0, 20) || null,
        shopSku: String(body.shopSku || '').trim().slice(0, 40) || null,
        phoneNumber: String(body.phoneNumber || '').trim(),
        emailAddress: String(body.emailAddress || '').trim(),
        marketName: String(body.marketName || '').trim(),
        shopNumber: String(body.shopNumber || '').trim(),
        shopAddress: String(body.shopAddress || '').trim(),
        imageUrl: body.imageUrl || null,
        shopType: SHOP_TYPES.includes(body.shopType) ? body.shopType : 'Fabric Shop',
        businessType: BUSINESS_TYPES.includes(body.businessType) ? body.businessType : 'Both',
        ShopId: body.ShopId || 1
    };
}

function missingField(data) {
    const required = ['shopName', 'ownerName', 'phoneNumber', 'emailAddress', 'marketName', 'shopNumber', 'shopAddress'];
    return required.find((key) => !data[key]);
}

async function getOrCreate() {
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
            shopType: 'Fabric Shop',
            businessType: 'Both',
            ShopId: 1
        });
    }
    return row;
}

async function syncSettings(data) {
    const setting = await Setting.findOne({ where: { ShopId: 1 } });
    if (!setting) return;
    await setting.update({
        shopName: data.shopName,
        ownerName: data.ownerName,
        phone: data.phoneNumber,
        address: data.shopAddress
    });
}

async function getOrCreateSub() {
    let row = await ShopSubscription.findOne({ where: { ShopId: 1 } });
    if (!row) {
        row = await ShopSubscription.create({
            selectedPackage: 'Basic',
            monthlyPrice: 0,
            yearlyPrice: 0,
            billingCycle: 'monthly',
            productLimit: 50,
            orderLimit: 100,
            paymentStatus: 'free',
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

function parseHeroBanners(body) {
    const raw = Array.isArray(body.heroBanners)
        ? body.heroBanners
        : [body.banner1, body.banner2, body.banner3];
    const list = [0, 1, 2].map((i) => String(raw[i] || '').trim() || null);
    const cover = String(body.coverBanner || '').trim() || list.find(Boolean) || null;
    if (!list[0] && cover) list[0] = cover;
    return { heroBanners: list, coverBanner: list.find(Boolean) || null };
}

exports.getStep1 = async (req, res) => {
    try {
        const profile = await getOrCreate();
        const sub = await getOrCreateSub();
        const digital = await getOrCreateDigital();
        const data = {
            ...profile.toJSON(),
            ...sub.toJSON(),
            ...digital.toJSON()
        };
        data.catalogCategories = categoriesForShop(profile.shopType, profile.productTypes);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching shop profile', error: error.message });
    }
};

exports.saveStep1 = async (req, res) => {
    try {
        const data = payloadFromBody(req.body);
        const missing = missingField(data);
        if (missing) {
            return res.status(400).json({ message: 'Please fill all required shop fields.' });
        }
        const row = await getOrCreate();
        const whatsappNumber = String(req.body.whatsappNumber || '').trim() || null;
        const shopDescription = String(req.body.shopDescription || '').trim().slice(0, 500) || null;
        const { heroBanners, coverBanner } = parseHeroBanners(req.body);
        await row.update({ ...data, whatsappNumber });
        const digital = await getOrCreateDigital();
        await digital.update({ coverBanner, heroBanners, whatsappNumber, shopDescription });
        await syncSettings(data);
        await row.reload();
        await digital.reload();
        const profile = { ...row.toJSON(), ...digital.toJSON() };
        profile.catalogCategories = categoriesForShop(row.shopType, row.productTypes);
        res.status(200).json({
            message: 'Shop basic information saved.',
            profile
        });
    } catch (error) {
        res.status(500).json({ message: 'Error saving shop profile', error: error.message });
    }
};

exports.saveStep2 = async (req, res) => {
    try {
        const allowed = ShopProfile.PRODUCT_TYPES;
        const incoming = Array.isArray(req.body.productTypes) ? req.body.productTypes : [];
        const productTypes = incoming.filter((name) => allowed.includes(name));
        const row = await getOrCreate();
        await row.update({ productTypes });
        res.status(200).json({
            message: 'Product types saved.',
            profile: row
        });
    } catch (error) {
        res.status(500).json({ message: 'Error saving product types', error: error.message });
    }
};

exports.saveStep5 = async (req, res) => {
    try {
        const { findPlan, limitsForShop } = require('../utils/subscriptionPlans');
        const plan = findPlan(req.body.selectedPackage);
        const row = await getOrCreateSub();
        const billingCycle = req.body.billingCycle === 'yearly' ? 'yearly' : 'monthly';
        const limits = limitsForShop(plan, row);
        await row.update({
            selectedPackage: plan?.id || 'Basic',
            monthlyPrice: plan?.monthlyPrice || 0,
            yearlyPrice: plan?.yearlyPrice || 0,
            billingCycle,
            productLimit: limits.productLimit,
            orderLimit: limits.orderLimit
        });
        res.status(200).json({ message: 'Package plan saved.', profile: row });
    } catch (error) {
        res.status(500).json({ message: 'Error saving package', error: error.message });
    }
};

exports.saveStep6 = async (req, res) => {
    try {
        if (!req.body.acceptedTerms) {
            return res.status(400).json({ message: 'Please agree to the Terms and Privacy Policy.' });
        }
        const spots = ['Market Entrance/Front', 'Middle Corridor', 'End of Market/Back Gate', 'Basement'];
        const row = await getOrCreateDigital();
        const whatsappNumber = String(req.body.whatsappNumber || '').trim() || row.whatsappNumber || null;
        const digital = {
            websiteUrl: req.body.websiteUrl || null,
            whatsappNumber,
            facebookPage: req.body.facebookPage || null,
            instagramHandle: req.body.instagramHandle || null,
            youtubeChannel: req.body.youtubeChannel || null,
            storeLocation: req.body.storeLocation || null,
            latitude: req.body.latitude == null || req.body.latitude === '' ? null : Number(req.body.latitude),
            longitude: req.body.longitude == null || req.body.longitude === '' ? null : Number(req.body.longitude),
            marketPosition: spots.includes(req.body.marketPosition) ? req.body.marketPosition : null,
            landmarkNote: req.body.landmarkNote || null,
            isSetupCompleted: req.body.finishSetup === true,
            ShopId: 1
        };
        await row.update(digital);
        const profile = await getOrCreate();
        await profile.update(digital);
        res.status(200).json({
            message: req.body.finishSetup === true
                ? 'Shop setup completed.'
                : 'Digital presence saved.',
            profile: { ...profile.toJSON(), ...row.toJSON() }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error completing setup', error: error.message });
    }
};
