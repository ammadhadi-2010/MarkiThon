const { OAuth2Client } = require('google-auth-library');
const BuyerAccount = require('../models/BuyerAccount');
const VendorAccount = require('../models/VendorAccount');
const { signBuyer, publicBuyer } = require('../utils/buyerToken');
const { signAuth, setAuthCookie } = require('../utils/authToken');
const { publicVendor } = require('../utils/vendorProfile');
const { cleanEmail } = require('../utils/authCrypto');

function clientId() {
    return String(process.env.GOOGLE_CLIENT_ID || '').trim();
}

function googleConfig(req, res) {
    const id = clientId();
    if (!id) {
        return res.status(200).json({
            enabled: false,
            clientId: '',
            message: 'Google Sign-In is not configured.'
        });
    }
    return res.status(200).json({ enabled: true, clientId: id });
}

async function verifyGoogleCredential(credential) {
    const id = clientId();
    if (!id) throw new Error('Google Sign-In is not configured on the server.');
    const ticket = await new OAuth2Client(id).verifyIdToken({
        idToken: credential,
        audience: id
    });
    const payload = ticket.getPayload() || {};
    if (!payload.email || !payload.sub) throw new Error('Google did not return a valid account.');
    if (payload.email_verified === false) throw new Error('Verify your Google email, then try again.');
    return payload;
}

function sendVendorSession(res, vendor) {
    const token = signAuth({ sub: vendor.id, role: 'vendor', status: vendor.status }, '30d');
    setAuthCookie(res, token);
    const user = publicVendor(vendor);
    return res.status(200).json({
        token,
        role: 'shopkeeper',
        redirect: '/app',
        user,
        shopName: user.shopName,
        fullName: user.ownerName || user.shopName
    });
}

async function findVendorByGoogleEmail(email) {
    return VendorAccount.findOne({ where: { email: cleanEmail(email) } });
}

async function upsertGoogleBuyer(payload) {
    const email = String(payload.email || '').trim().toLowerCase();
    const googleName = String(payload.name || email.split('@')[0] || 'Customer').trim().slice(0, 80);
    const picture = String(payload.picture || '').trim();
    let buyer = await BuyerAccount.findOne({ where: { googleSub: payload.sub } });
    if (!buyer) buyer = await BuyerAccount.findOne({ where: { email } });

    const prefs = Object.assign(
        { notifyOrders: true, wishlist: [], deliveryNote: '', verified: true },
        (buyer && buyer.preferences) || {},
        {
            avatar: picture || ((buyer && buyer.preferences && buyer.preferences.avatar) || ''),
            verified: true
        }
    );

    if (!buyer) {
        return BuyerAccount.create({
            name: googleName,
            email,
            authProvider: 'google',
            googleSub: payload.sub,
            role: 'buyer',
            preferences: prefs
        });
    }

    /* Existing account: link Google and keep saved display name. */
    if (!String(buyer.name || '').trim()) buyer.name = googleName;
    buyer.email = email || buyer.email;
    if (!buyer.password) buyer.authProvider = 'google';
    buyer.googleSub = payload.sub;
    buyer.preferences = prefs;
    buyer.changed('preferences', true);
    await buyer.save();
    return buyer;
}

function sendBuyerSession(res, buyer) {
    const token = signBuyer(buyer);
    const publicRow = publicBuyer(buyer);
    return res.status(200).json({
        token,
        role: 'customer',
        buyer: publicRow,
        user: publicRow,
        fullName: publicRow.name,
        shopName: publicRow.shopName || ''
    });
}

async function googleSignIn(req, res) {
    try {
        const credential = String(req.body.credential || req.body.idToken || '').trim();
        if (!credential) return res.status(400).json({ message: 'Missing Google credential token.' });
        const payload = await verifyGoogleCredential(credential);
        const email = String(payload.email || '').trim().toLowerCase();

        const vendor = await findVendorByGoogleEmail(email);
        if (vendor) return sendVendorSession(res, vendor);

        const buyer = await upsertGoogleBuyer(payload);
        return sendBuyerSession(res, buyer);
    } catch (error) {
        const status = error.status || (String(error.message || '').includes('not configured') ? 503 : 401);
        return res.status(status).json({ message: error.message || 'Could not continue with Google.' });
    }
}

module.exports = { googleConfig, googleSignIn };
