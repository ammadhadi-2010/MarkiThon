const { OAuth2Client } = require('google-auth-library');
const BuyerAccount = require('../models/BuyerAccount');
const { signBuyer, publicBuyer } = require('../utils/buyerToken');

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

async function upsertGoogleBuyer(payload) {
    const email = String(payload.email || '').trim().toLowerCase();
    const name = String(payload.name || email.split('@')[0] || 'Customer').trim().slice(0, 80);
    const picture = String(payload.picture || '').trim();
    let buyer = await BuyerAccount.findOne({ where: { googleSub: payload.sub } });
    if (!buyer) buyer = await BuyerAccount.findOne({ where: { email } });
    if (buyer && buyer.authProvider !== 'google' && buyer.password) {
        const err = new Error('This email already uses password sign-in.');
        err.status = 409;
        throw err;
    }
    const prefs = Object.assign(
        { notifyOrders: true, wishlist: [], deliveryNote: '', verified: true },
        (buyer && buyer.preferences) || {},
        { avatar: picture || ((buyer && buyer.preferences && buyer.preferences.avatar) || ''), verified: true }
    );
    if (!buyer) {
        return BuyerAccount.create({
            name,
            email,
            authProvider: 'google',
            googleSub: payload.sub,
            role: 'buyer',
            preferences: prefs
        });
    }
    buyer.name = name || buyer.name;
    buyer.email = email || buyer.email;
    buyer.authProvider = 'google';
    buyer.googleSub = payload.sub;
    buyer.preferences = prefs;
    buyer.changed('preferences', true);
    await buyer.save();
    return buyer;
}

async function googleSignIn(req, res) {
    try {
        const credential = String(req.body.credential || req.body.idToken || '').trim();
        if (!credential) return res.status(400).json({ message: 'Missing Google credential token.' });
        const payload = await verifyGoogleCredential(credential);
        const buyer = await upsertGoogleBuyer(payload);
        return res.status(200).json({ token: signBuyer(buyer), buyer: publicBuyer(buyer) });
    } catch (error) {
        const status = error.status || (String(error.message || '').includes('not configured') ? 503 : 401);
        return res.status(status).json({ message: error.message || 'Could not continue with Google.' });
    }
}

module.exports = { googleConfig, googleSignIn };
