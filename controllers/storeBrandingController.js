const ShopProfile = require('../models/ShopProfile');
const ShopDigitalSetup = require('../models/ShopDigitalSetup');

function packBranding(profile, digital) {
    const p = profile ? (profile.toJSON ? profile.toJSON() : profile) : {};
    const d = digital ? (digital.toJSON ? digital.toJSON() : digital) : {};
    return {
        logoUrl: String(p.imageUrl || ''),
        coverUrl: String(d.coverBanner || ''),
        whatsappNumber: String(d.whatsappNumber || p.whatsappNumber || ''),
        shopDescription: String(d.shopDescription || '')
    };
}

async function loadRows() {
    const [profile] = await ShopProfile.findOrCreate({
        where: { ShopId: 1 },
        defaults: {
            shopName: 'Ammad Hadi Stor',
            ownerName: 'Ammad Hadi',
            phoneNumber: '0300-1234567',
            emailAddress: 'ammad@hadistor.pk',
            marketName: 'Central Market',
            shopNumber: '12-B',
            shopAddress: 'Main Market, Punjab',
            ShopId: 1
        }
    });
    const [digital] = await ShopDigitalSetup.findOrCreate({
        where: { ShopId: 1 },
        defaults: { ShopId: 1 }
    });
    return { profile, digital };
}

async function getBranding(req, res) {
    try {
        const { profile, digital } = await loadRows();
        res.json(packBranding(profile, digital));
    } catch (error) {
        res.status(500).json({ message: 'Could not load store branding.' });
    }
}

async function putBranding(req, res) {
    try {
        const body = req.body || {};
        const { profile, digital } = await loadRows();
        const logo = String(body.logoUrl || '').trim();
        const cover = String(body.coverUrl || '').trim();
        if (logo.length > 900000 || cover.length > 900000) {
            return res.status(400).json({ message: 'Image is too large. Upload a smaller photo.' });
        }
        profile.imageUrl = logo || null;
        await profile.save();
        digital.coverBanner = cover || null;
        digital.whatsappNumber = String(body.whatsappNumber || '').trim() || null;
        digital.shopDescription = String(body.shopDescription || '').trim().slice(0, 500) || null;
        await digital.save();
        res.json({
            message: 'Store branding saved.',
            branding: packBranding(profile, digital)
        });
    } catch (error) {
        res.status(500).json({ message: 'Could not save store branding.' });
    }
}

module.exports = { getBranding, putBranding, packBranding };
