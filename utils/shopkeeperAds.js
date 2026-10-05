const ShopDigitalSetup = require('../models/ShopDigitalSetup');
const ShopProfile = require('../models/ShopProfile');
const { packBanner } = require('../controllers/storeBannerController');

function shopSlug(name) {
    return String(name || 'Ammad Hadi Stor').toLowerCase().replace(/[^a-z0-9]+/g, '') || 'ammadhadistor';
}

function uploaded(row) {
    return Boolean(row.bannerEnabled || row.bannerImage || row.bannerHeadline || row.bannerSub || row.bannerDescription);
}

async function listShopkeeperAds() {
    const setups = await ShopDigitalSetup.findAll();
    const profiles = await ShopProfile.findAll();
    const byId = new Map(profiles.map((row) => [Number(row.ShopId), row]));
    return setups.filter(uploaded).map((row) => {
        const packed = packBanner(row);
        const profile = byId.get(Number(row.ShopId));
        const shopName = (profile && profile.shopName) || 'Ammad Hadi Stor';
        return {
            id: String(row.ShopId),
            shopName,
            owner: (profile && profile.ownerName) || '',
            sub: packed.sub,
            headline: packed.headline,
            description: packed.description,
            href: '/' + shopSlug(shopName) + '?filter=sale',
            live: packed.enabled,
            hasImage: Boolean(row.bannerImage)
        };
    });
}

module.exports = { listShopkeeperAds };
