const { Op } = require('sequelize');
const ShopProfile = require('../models/ShopProfile');

async function nextShopId() {
    const max = await ShopProfile.max('ShopId');
    const n = Number(max) || 0;
    return n >= 1 ? n + 1 : 1;
}

async function findProfileForVendor(vendor) {
    const email = String(vendor.email || '').trim().toLowerCase();
    if (email === 'shopkeeper@markithon.com' || email === 'ammad@hadistor.pk') {
        const primary = await ShopProfile.findOne({ where: { ShopId: 1 } });
        if (primary) return primary;
    }
    if (email) {
        const byEmail = await ShopProfile.findOne({
            where: { emailAddress: { [Op.iLike]: email } }
        });
        if (byEmail) return byEmail;
    }
    if (vendor.shopId) {
        const byId = await ShopProfile.findOne({ where: { ShopId: Number(vendor.shopId) } });
        if (byId) return byId;
    }
    return null;
}

async function createProfileForVendor(vendor) {
    const shopId = await nextShopId();
    return ShopProfile.create({
        ShopId: shopId,
        shopName: vendor.shopName || 'New Shop',
        ownerName: vendor.ownerName || 'Owner',
        phoneNumber: vendor.phone || '0000000000',
        emailAddress: vendor.email || ('shop' + shopId + '@markithon.com'),
        marketName: 'Local Market',
        shopNumber: '1',
        shopAddress: vendor.address || 'Pakistan',
        shopType: 'General / Multi-Category',
        businessType: 'Both'
    });
}

/** Bind vendor.shopId to a ShopProfile tenant id (creates profile when needed). */
async function ensureVendorShopBound(vendor) {
    if (!vendor) return 0;
    let shopId = Number(vendor.shopId) || 0;
    if (shopId > 0) {
        const exists = await ShopProfile.findOne({ where: { ShopId: shopId } });
        if (exists) return shopId;
    }
    let profile = await findProfileForVendor(vendor);
    if (!profile) profile = await createProfileForVendor(vendor);
    shopId = Number(profile.ShopId) || 1;
    if (Number(vendor.shopId) !== shopId) {
        vendor.shopId = shopId;
        await vendor.save();
    }
    return shopId;
}

module.exports = { ensureVendorShopBound, nextShopId };
