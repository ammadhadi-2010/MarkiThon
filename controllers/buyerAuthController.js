const bcrypt = require('bcryptjs');
const BuyerAccount = require('../models/BuyerAccount');
const { signBuyer, publicBuyer } = require('../utils/buyerToken');

function cleanEmail(value) {
    return String(value || '').trim().toLowerCase();
}

function cleanPhone(value) {
    return String(value || '').replace(/[^\d+]/g, '');
}

function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validPhone(phone) {
    return /^\+?\d{10,15}$/.test(phone);
}

function sendBuyer(res, buyer, status) {
    res.status(status || 200).json({ token: signBuyer(buyer), buyer: publicBuyer(buyer) });
}

async function register(req, res) {
    try {
        const channel = req.body.channel === 'phone' ? 'phone' : 'email';
        const name = String(req.body.name || '').trim();
        const password = String(req.body.password || '');
        const email = cleanEmail(req.body.email);
        const phone = cleanPhone(req.body.phone);
        if (name.length < 2) return res.status(400).json({ message: 'Enter your name.' });
        if (password.length < 6) return res.status(400).json({ message: 'Use a password of at least 6 characters.' });
        if (channel === 'email' && !validEmail(email)) {
            return res.status(400).json({ message: 'Enter a valid email address.' });
        }
        if (channel === 'phone' && !validPhone(phone)) {
            return res.status(400).json({ message: 'Enter a valid phone number.' });
        }
        const existing = channel === 'email'
            ? await BuyerAccount.findOne({ where: { email } })
            : await BuyerAccount.findOne({ where: { phone } });
        if (existing) return res.status(409).json({ message: 'An account already exists for these details.' });
        const buyer = await BuyerAccount.create({
            name,
            email: channel === 'email' ? email : null,
            phone: channel === 'phone' ? phone : null,
            password: await bcrypt.hash(password, 10),
            authProvider: channel,
            role: 'buyer',
            preferences: { notifyOrders: true, wishlist: [], deliveryNote: '' }
        });
        return sendBuyer(res, buyer, 201);
    } catch (error) {
        return res.status(500).json({ message: 'Could not create the customer account.' });
    }
}

async function login(req, res) {
    try {
        const channel = req.body.channel === 'phone' ? 'phone' : 'email';
        const password = String(req.body.password || '');
        const email = cleanEmail(req.body.email);
        const phone = cleanPhone(req.body.phone);
        const buyer = channel === 'email'
            ? await BuyerAccount.findOne({ where: { email } })
            : await BuyerAccount.findOne({ where: { phone } });
        if (!buyer || buyer.role !== 'buyer') {
            return res.status(404).json({ message: 'No customer account matches these details.' });
        }
        if (buyer.authProvider === 'google' || !buyer.password) {
            return res.status(400).json({ message: 'Use Continue with Google for this account.' });
        }
        const match = await bcrypt.compare(password, buyer.password);
        if (!match) return res.status(400).json({ message: 'Incorrect password.' });
        return sendBuyer(res, buyer);
    } catch (error) {
        return res.status(500).json({ message: 'Could not sign in.' });
    }
}

async function google(req, res) {
    if (req.body && (req.body.credential || req.body.idToken)) {
        return require('./googleAuthController').googleSignIn(req, res);
    }
    try {
        const email = cleanEmail(req.body.email);
        const name = String(req.body.name || '').trim() || email.split('@')[0];
        if (!validEmail(email)) return res.status(400).json({ message: 'Enter the Google account email.' });
        let buyer = await BuyerAccount.findOne({ where: { email } });
        if (buyer && buyer.authProvider !== 'google') {
            return res.status(409).json({ message: 'This email already uses password sign-in.' });
        }
        if (!buyer) {
            buyer = await BuyerAccount.create({
                name,
                email,
                authProvider: 'google',
                googleSub: email,
                role: 'buyer',
                preferences: { notifyOrders: true, wishlist: [], deliveryNote: '', verified: true }
            });
            return sendBuyer(res, buyer, 201);
        }
        if (name && buyer.name !== name) {
            buyer.name = name;
            await buyer.save();
        }
        return sendBuyer(res, buyer);
    } catch (error) {
        return res.status(500).json({ message: 'Could not continue with Google.' });
    }
}

module.exports = { register, login, google };
