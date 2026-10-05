const VendorAccount = require('../models/VendorAccount');
const { cleanPhone, validPhone } = require('../utils/authCrypto');
const {
    publicVendor,
    safeImage,
    ensureDefaultVendor
} = require('../utils/vendorProfile');

async function loadVendor(req) {
    await ensureDefaultVendor();
    return VendorAccount.findByPk(req.auth.sub);
}

async function getProfile(req, res) {
    try {
        const vendor = await loadVendor(req);
        if (!vendor) return res.status(401).json({ message: 'Sign in as a shopkeeper to continue.' });
        return res.status(200).json({ profile: publicVendor(vendor) });
    } catch (error) {
        return res.status(500).json({ message: 'Could not load the shopkeeper profile.' });
    }
}

async function saveProfile(req, res) {
    try {
        const vendor = await loadVendor(req);
        if (!vendor) return res.status(401).json({ message: 'Sign in as a shopkeeper to continue.' });
        const ownerName = String(req.body.ownerName || '').trim();
        const shopName = String(req.body.shopName || '').trim();
        const phone = cleanPhone(req.body.phone);
        const address = String(req.body.address || '').trim();
        if (ownerName.length < 2) return res.status(400).json({ message: 'Enter your full name.' });
        if (shopName.length < 2) return res.status(400).json({ message: 'Enter the store name.' });
        if (!validPhone(phone)) return res.status(400).json({ message: 'Enter a valid phone number.' });
        if (address.length < 5) return res.status(400).json({ message: 'Enter the business address.' });
        vendor.ownerName = ownerName.slice(0, 80);
        vendor.shopName = shopName.slice(0, 80);
        vendor.phone = phone;
        vendor.address = address.slice(0, 240);
        if (req.body.imageUrl != null) {
            const image = safeImage(req.body.imageUrl);
            if (req.body.imageUrl && !image) {
                return res.status(400).json({ message: 'Choose a PNG, JPG, or WebP image under 2 MB.' });
            }
            if (image) vendor.imageUrl = image;
        }
        await vendor.save();
        return res.status(200).json({ message: 'Profile updated.', profile: publicVendor(vendor) });
    } catch (error) {
        return res.status(500).json({ message: 'Could not save the shopkeeper profile.' });
    }
}

module.exports = { getProfile, saveProfile };
