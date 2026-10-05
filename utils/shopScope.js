const ShopProfile = require('../models/ShopProfile');

async function activeShopId() {
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

module.exports = { activeShopId, sameShop, foreignProductError };
