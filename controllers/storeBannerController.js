const ShopDigitalSetup = require('../models/ShopDigitalSetup');

const defaults = {
    enabled: false,
    imageUrl: '',
    sub: 'LIMITED TIME OFFER',
    headline: 'Save Up to 30%',
    description: 'On Selected Bedding & Towels',
    ctaText: 'Shop Sale',
    ctaLink: 'sale'
};

function packBanner(row) {
    if (!row) return { ...defaults };
    return {
        enabled: Boolean(row.bannerEnabled),
        imageUrl: String(row.bannerImage || ''),
        sub: String(row.bannerSub || defaults.sub),
        headline: String(row.bannerHeadline || defaults.headline),
        description: String(row.bannerDescription || defaults.description),
        ctaText: String(row.bannerCtaText || defaults.ctaText),
        ctaLink: String(row.bannerCtaLink || defaults.ctaLink)
    };
}

async function getRow() {
    const [row] = await ShopDigitalSetup.findOrCreate({
        where: { ShopId: 1 },
        defaults: { ShopId: 1 }
    });
    return row;
}

async function getBanner(req, res) {
    try {
        const row = await getRow();
        res.json(packBanner(row));
    } catch (error) {
        res.status(500).json({ message: 'Could not load banner settings.' });
    }
}

async function putBanner(req, res) {
    try {
        const body = req.body || {};
        const row = await getRow();
        row.bannerEnabled = Boolean(body.enabled);
        row.bannerImage = String(body.imageUrl || '').trim() || null;
        row.bannerSub = String(body.sub || '').trim() || defaults.sub;
        row.bannerHeadline = String(body.headline || '').trim() || defaults.headline;
        row.bannerDescription = String(body.description || '').trim() || defaults.description;
        row.bannerCtaText = String(body.ctaText || '').trim() || defaults.ctaText;
        row.bannerCtaLink = String(body.ctaLink || '').trim() || defaults.ctaLink;
        await row.save();
        res.json(packBanner(row));
    } catch (error) {
        res.status(500).json({ message: 'Could not save banner settings.' });
    }
}

module.exports = { getBanner, putBanner, packBanner, getRow, defaults };
