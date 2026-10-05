const BuyerAccount = require('../models/BuyerAccount');
const { readBuyerToken } = require('./buyerToken');

async function requireBuyer(req, res, next) {
    try {
        const payload = readBuyerToken(req.headers.authorization);
        if (!payload) {
            return res.status(401).json({ message: 'Sign in as a customer to continue.' });
        }
        const buyer = await BuyerAccount.findByPk(payload.sub);
        if (!buyer || buyer.role !== 'buyer') {
            return res.status(403).json({ message: 'This account is not a customer profile.' });
        }
        req.buyer = buyer;
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Sign in as a customer to continue.' });
    }
}

module.exports = { requireBuyer };
