const ShopDigitalSetup = require('../models/ShopDigitalSetup');
const ShopProfile = require('../models/ShopProfile');
const { packBanner } = require('./storeBannerController');

function shopSlug(name) {
    return String(name || 'Ammad Hadi Stor').toLowerCase().replace(/[^a-z0-9]+/g, '') || 'ammadhadistor';
}

function offerPercent(headline) {
    const match = String(headline || '').match(/(\d+)\s*%/);
    return match ? Number(match[1]) : null;
}

exports.listPublicCampaigns = async (req, res) => {
    try {
        const setups = await ShopDigitalSetup.findAll({ where: { bannerEnabled: true } });
        const profiles = await ShopProfile.findAll();
        const byId = new Map(profiles.map((row) => [Number(row.ShopId), row]));
        const campaigns = setups.map((row) => {
            const packed = packBanner(row);
            const profile = byId.get(Number(row.ShopId));
            const shopName = (profile && profile.shopName) || 'Ammad Hadi Stor';
            const slug = shopSlug(shopName);
            const percent = offerPercent(packed.headline);
            return {
                shopId: String(row.ShopId),
                shopName,
                slug,
                sub: packed.sub,
                headline: packed.headline,
                percent,
                description: packed.description,
                imageUrl: packed.imageUrl || '',
                href: '/' + slug + '?filter=sale'
            };
        });
        res.json({ campaigns });
    } catch (error) {
        res.status(500).json({ campaigns: [], message: 'Could not load shop campaigns.' });
    }
};
