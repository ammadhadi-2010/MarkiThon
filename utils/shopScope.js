const { AsyncLocalStorage } = require('async_hooks');
const ShopProfile = require('../models/ShopProfile');

const shopStore = new AsyncLocalStorage();

function runWithShopContext(shopId, role, next) {
    shopStore.run({ shopId: Number(shopId) || 0, role: role || '' }, next);
}

function currentShopContext() {
    return shopStore.getStore() || null;
}

async function activeShopId() {
    const ctx = currentShopContext();
    if (ctx && ctx.shopId > 0) return ctx.shopId;
    const profile = await ShopProfile.findOne({ where: { ShopId: 1 } });
    const id = profile ? Number(profile.ShopId) : 1;
    return id > 0 ? id : 1;
}

function sameShop(row, shopId) {
    return Number(row && row.ShopId) === Number(shopId);
}

function foreignProductError() {
    const error = new Error('You can only use products from this shop.');
    error.status = 403;
    return error;
}

function rejectCrossTenant() {
    const error = new Error('You do not have access to another shop\'s data.');
    error.status = 403;
    return error;
}

module.exports = {
    activeShopId,
    sameShop,
    foreignProductError,
    rejectCrossTenant,
    runWithShopContext,
    currentShopContext
};
