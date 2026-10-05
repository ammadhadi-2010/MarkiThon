const VendorAccount = require('../models/VendorAccount');
const { hashPassword, matchPassword, cleanEmail, cleanPhone, validEmail, validPhone } = require('../utils/authCrypto');
const { signAuth, setAuthCookie } = require('../utils/authToken');
const {
    publicVendor,
    nextShopkeeperId,
    putChallenge,
    takeChallenge,
    randomChallenge,
    ensureDefaultVendor
} = require('../utils/vendorProfile');

const PENDING = 'Pending Admin Approval';

function sendVendor(res, vendor, status) {
    const token = signAuth({ sub: vendor.id, role: 'vendor', status: vendor.status }, '7d');
    setAuthCookie(res, token);
    res.status(status || 200).json({ token, user: publicVendor(vendor) });
}

async function vendorRegister(req, res) {
    try {
        const shopName = String(req.body.shopName || '').trim();
        const ownerName = String(req.body.ownerName || '').trim();
        const email = cleanEmail(req.body.email);
        const phone = cleanPhone(req.body.phone);
        const address = String(req.body.address || '').trim();
        const password = String(req.body.password || '');
        if (shopName.length < 2) return res.status(400).json({ message: 'Enter the shop name.' });
        if (ownerName.length < 2) return res.status(400).json({ message: 'Enter the owner name.' });
        if (!validEmail(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
        if (!validPhone(phone)) return res.status(400).json({ message: 'Enter a valid phone number.' });
        if (address.length < 5) return res.status(400).json({ message: 'Enter the shop address.' });
        if (password.length < 6) return res.status(400).json({ message: 'Use a password of at least 6 characters.' });
        const existing = await VendorAccount.findOne({ where: { email } });
        if (existing) return res.status(409).json({ message: 'A shopkeeper account already uses this email.' });
        const vendor = await VendorAccount.create({
            shopkeeperId: await nextShopkeeperId(),
            shopName,
            ownerName,
            email,
            phone,
            address,
            password: await hashPassword(password),
            status: PENDING
        });
        return res.status(201).json({
            message: 'Registration submitted. Your account is Pending Admin Approval.',
            user: publicVendor(vendor)
        });
    } catch (error) {
        return res.status(500).json({ message: 'Could not register the shopkeeper account.' });
    }
}

async function vendorLogin(req, res) {
    try {
        await ensureDefaultVendor();
        const email = cleanEmail(req.body.email);
        const password = String(req.body.password || '');
        const vendor = await VendorAccount.findOne({ where: { email } });
        if (!vendor) return res.status(401).json({ message: 'Invalid shopkeeper email or password.' });
        const ok = await matchPassword(password, vendor.password);
        if (!ok) return res.status(401).json({ message: 'Invalid shopkeeper email or password.' });
        if (vendor.status !== 'Active') {
            return res.status(403).json({
                message: 'Your account is Pending Admin Approval. You can sign in after an admin approves it.',
                user: publicVendor(vendor)
            });
        }
        return sendVendor(res, vendor);
    } catch (error) {
        return res.status(500).json({ message: 'Could not sign in as a shopkeeper.' });
    }
}

async function vendorMe(req, res) {
    try {
        const vendor = await VendorAccount.findByPk(req.auth.sub);
        if (!vendor) return res.status(401).json({ message: 'Sign in as a shopkeeper to continue.' });
        return res.status(200).json({ user: publicVendor(vendor) });
    } catch (error) {
        return res.status(401).json({ message: 'Sign in as a shopkeeper to continue.' });
    }
}

async function vendorWebauthnBegin(req, res) {
    try {
        await ensureDefaultVendor();
        const email = cleanEmail(req.body.email);
        const vendor = await VendorAccount.findOne({ where: { email } });
        if (!vendor || !vendor.biometricEnabled || !vendor.webauthnCredId || vendor.status !== 'Active') {
            return res.status(400).json({ message: 'Thumb scan login is not enabled for this account.' });
        }
        const challenge = randomChallenge();
        putChallenge('login:' + vendor.id, challenge);
        return res.status(200).json({
            challenge,
            rpId: req.hostname === 'localhost' ? 'localhost' : req.hostname,
            allowCredentials: [{ type: 'public-key', id: vendor.webauthnCredId }],
            userVerification: 'required',
            timeout: 60000,
            vendorId: vendor.id
        });
    } catch (error) {
        return res.status(500).json({ message: 'Could not start thumb scan login.' });
    }
}

async function vendorWebauthnFinish(req, res) {
    try {
        const vendorId = String(req.body.vendorId || '').trim();
        const credId = String(req.body.id || '').trim();
        const expected = takeChallenge('login:' + vendorId);
        if (!expected) return res.status(400).json({ message: 'Thumb scan challenge expired. Try again.' });
        const vendor = await VendorAccount.findByPk(vendorId);
        if (!vendor || vendor.webauthnCredId !== credId || !vendor.biometricEnabled || vendor.status !== 'Active') {
            return res.status(401).json({ message: 'Thumb scan login failed.' });
        }
        return sendVendor(res, vendor);
    } catch (error) {
        return res.status(500).json({ message: 'Could not finish thumb scan login.' });
    }
}

module.exports = {
    vendorRegister,
    vendorLogin,
    vendorMe,
    vendorWebauthnBegin,
    vendorWebauthnFinish
};
