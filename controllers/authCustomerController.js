const crypto = require('crypto');
const BuyerAccount = require('../models/BuyerAccount');
const { hashPassword, matchPassword, cleanEmail, validEmail } = require('../utils/authCrypto');
const { signAuth, setAuthCookie } = require('../utils/authToken');

function publicCustomer(row) {
    const buyer = row.toJSON ? row.toJSON() : row;
    return {
        id: buyer.id,
        role: 'customer',
        name: buyer.name,
        email: buyer.email || '',
        phone: buyer.phone || '',
        authProvider: buyer.authProvider
    };
}

function sendCustomer(res, buyer, status) {
    const token = signAuth({ sub: buyer.id, role: 'customer', provider: buyer.authProvider }, '30d');
    setAuthCookie(res, token);
    res.status(status || 200).json({ token, user: publicCustomer(buyer) });
}

async function customerRegister(req, res) {
    try {
        const name = String(req.body.name || '').trim();
        const email = cleanEmail(req.body.email);
        const password = String(req.body.password || '');
        if (name.length < 2) return res.status(400).json({ message: 'Enter your name.' });
        if (!validEmail(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
        if (password.length < 6) return res.status(400).json({ message: 'Use a password of at least 6 characters.' });
        const existing = await BuyerAccount.findOne({ where: { email } });
        if (existing) return res.status(409).json({ message: 'An account already exists for this email.' });
        const buyer = await BuyerAccount.create({
            name,
            email,
            password: await hashPassword(password),
            authProvider: 'email',
            role: 'buyer',
            preferences: { notifyOrders: true, wishlist: [], deliveryNote: '' }
        });
        return sendCustomer(res, buyer, 201);
    } catch (error) {
        return res.status(500).json({ message: 'Could not create the customer account.' });
    }
}

async function customerLogin(req, res) {
    try {
        const email = cleanEmail(req.body.email);
        const password = String(req.body.password || '');
        const buyer = await BuyerAccount.findOne({ where: { email } });
        if (!buyer || buyer.role !== 'buyer') {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        if (buyer.authProvider === 'google' || !buyer.password) {
            return res.status(400).json({ message: 'Use Continue with Google for this account.' });
        }
        const ok = await matchPassword(password, buyer.password);
        if (!ok) return res.status(401).json({ message: 'Invalid email or password.' });
        return sendCustomer(res, buyer);
    } catch (error) {
        return res.status(500).json({ message: 'Could not sign in.' });
    }
}

async function customerForgot(req, res) {
    try {
        const email = cleanEmail(req.body.email);
        if (!validEmail(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
        const buyer = await BuyerAccount.findOne({ where: { email } });
        if (!buyer || !buyer.password) {
            return res.status(200).json({ message: 'If an account exists, a reset code is ready.' });
        }
        const resetToken = crypto.randomBytes(16).toString('hex');
        const preferences = Object.assign({}, buyer.preferences || {}, {
            resetToken,
            resetExpires: Date.now() + (60 * 60 * 1000)
        });
        buyer.preferences = preferences;
        await buyer.save();
        try {
            const { sendPasswordResetEmail } = require('../services/emailService');
            await sendPasswordResetEmail(email, resetToken);
        } catch (mailError) {
            console.error('[email] password reset:', mailError.message || mailError);
        }
        return res.status(200).json({
            message: 'If an account exists, a reset email has been sent.',
            resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
        });
    } catch (error) {
        return res.status(500).json({ message: 'Could not start password reset.' });
    }
}

async function customerReset(req, res) {
    try {
        const email = cleanEmail(req.body.email);
        const resetToken = String(req.body.resetToken || '').trim();
        const password = String(req.body.password || '');
        if (!validEmail(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
        if (password.length < 6) return res.status(400).json({ message: 'Use a password of at least 6 characters.' });
        const buyer = await BuyerAccount.findOne({ where: { email } });
        const prefs = (buyer && buyer.preferences) || {};
        if (!buyer || prefs.resetToken !== resetToken || Number(prefs.resetExpires || 0) < Date.now()) {
            return res.status(400).json({ message: 'This reset code is invalid or expired.' });
        }
        buyer.password = await hashPassword(password);
        buyer.preferences = Object.assign({}, prefs, { resetToken: '', resetExpires: 0 });
        await buyer.save();
        return sendCustomer(res, buyer);
    } catch (error) {
        return res.status(500).json({ message: 'Could not reset the password.' });
    }
}

async function customerMe(req, res) {
    try {
        if (!req.auth || req.auth.role !== 'customer') {
            return res.status(401).json({ message: 'Sign in as a customer to continue.' });
        }
        const buyer = await BuyerAccount.findByPk(req.auth.sub);
        if (!buyer || buyer.role !== 'buyer') {
            return res.status(401).json({ message: 'Sign in as a customer to continue.' });
        }
        return res.status(200).json({ user: publicCustomer(buyer) });
    } catch (error) {
        return res.status(401).json({ message: 'Sign in as a customer to continue.' });
    }
}

module.exports = {
    customerRegister,
    customerLogin,
    customerForgot,
    customerReset,
    customerMe
};
