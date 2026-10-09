const BuyerAccount = require('../models/BuyerAccount');
const RetailCustomer = require('../models/RetailCustomer');
const { sendOrderConfirmation, queueEmail } = require('../services/emailService');

function digits(value) {
    return String(value || '').replace(/\D/g, '');
}

function looksEmail(value) {
    const email = String(value || '').trim();
    return email.includes('@') && email.includes('.');
}

async function resolveCustomerEmail(opts) {
    const input = opts || {};
    if (looksEmail(input.email)) return String(input.email).trim();
    if (looksEmail(input.customerEmail)) return String(input.customerEmail).trim();
    const details = input.details || {};
    if (looksEmail(details.email)) return String(details.email).trim();
    if (input.buyerId) {
        const buyer = await BuyerAccount.findByPk(input.buyerId);
        if (buyer && looksEmail(buyer.email)) return buyer.email;
    }
    const phone = digits(input.phone || input.customerPhone);
    if (phone) {
        const buyers = await BuyerAccount.findAll({ attributes: ['email', 'phone'], limit: 200 });
        const buyer = buyers.find((row) => digits(row.phone) === phone && looksEmail(row.email));
        if (buyer) return buyer.email;
        const retail = await RetailCustomer.findAll({
            attributes: ['email', 'phone', 'whatsapp'],
            limit: 400
        });
        const match = retail.find((row) =>
            (digits(row.phone) === phone || digits(row.whatsapp) === phone) && looksEmail(row.email));
        if (match) return match.email;
    }
    return '';
}

function queueOrderEmail(email, orderDetails) {
    if (!email) return;
    queueEmail(() => sendOrderConfirmation(email, orderDetails));
}

module.exports = { resolveCustomerEmail, queueOrderEmail };
