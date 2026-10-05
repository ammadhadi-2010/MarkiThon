const ShopSubscription = require('../models/ShopSubscription');
const {
    readPlans,
    writePlans,
    findPlan,
    priceForPlan,
    limitsForShop,
    cleanPlan
} = require('../utils/subscriptionPlans');

async function getOrCreateSub() {
    let row = await ShopSubscription.findOne({ where: { ShopId: 1 } });
    if (!row) {
        const basic = findPlan('Basic');
        row = await ShopSubscription.create({
            selectedPackage: basic?.id || 'Basic',
            monthlyPrice: basic?.monthlyPrice || 0,
            yearlyPrice: basic?.yearlyPrice || 0,
            billingCycle: 'monthly',
            productLimit: basic?.productLimit || 50,
            orderLimit: basic?.orderLimit || 100,
            paymentStatus: 'free',
            ShopId: 1
        });
    }
    return row;
}

exports.getPlans = (req, res) => {
    try {
        const store = readPlans();
        res.status(200).json(store);
    } catch (error) {
        res.status(500).json({ message: 'Could not load subscription plans.' });
    }
};

exports.savePlans = (req, res) => {
    try {
        const incoming = Array.isArray(req.body.plans) ? req.body.plans : [];
        const saved = writePlans({ plans: incoming.map(cleanPlan) });
        res.status(200).json({ message: 'Subscription plans saved.', ...saved });
    } catch (error) {
        res.status(500).json({ message: 'Could not save subscription plans.' });
    }
};

exports.getShopSubscription = async (req, res) => {
    try {
        const row = await getOrCreateSub();
        res.status(200).json({ subscription: row, plans: readPlans().plans });
    } catch (error) {
        res.status(500).json({ message: 'Could not load shop subscription.' });
    }
};

exports.subscribeStep4 = async (req, res) => {
    try {
        const plan = findPlan(req.body.selectedPackage);
        if (!plan) return res.status(400).json({ message: 'Select a valid subscription plan.' });
        const billingCycle = req.body.billingCycle === 'yearly' ? 'yearly' : 'monthly';
        const amount = priceForPlan(plan, billingCycle);
        const method = String(req.body.paymentMethod || '').trim();
        const trx = String(req.body.transactionReference || '').trim().slice(0, 80);
        let paymentStatus = 'free';
        if (amount > 0) {
            if (!method) return res.status(400).json({ message: 'Select a payment method.' });
            if (method !== 'Card' && !trx) {
                return res.status(400).json({ message: 'Enter the transaction reference (TRX ID).' });
            }
            paymentStatus = method === 'Card' ? 'active' : 'pending';
        }
        const row = await getOrCreateSub();
        const limits = limitsForShop(plan, row);
        await row.update({
            selectedPackage: plan.id,
            monthlyPrice: plan.monthlyPrice,
            yearlyPrice: plan.yearlyPrice,
            billingCycle,
            productLimit: limits.productLimit,
            orderLimit: limits.orderLimit,
            paymentMethod: amount > 0 ? method : 'Free',
            transactionReference: trx || null,
            paymentStatus
        });
        res.status(200).json({
            message: paymentStatus === 'pending'
                ? 'Payment submitted for admin approval.'
                : 'Subscription plan activated.',
            profile: row
        });
    } catch (error) {
        res.status(500).json({ message: 'Could not save the subscription plan.' });
    }
};

exports.overrideShopLimits = async (req, res) => {
    try {
        const row = await getOrCreateSub();
        const products = req.body.limitOverrideProducts;
        const orders = req.body.limitOverrideOrders;
        const note = String(req.body.extensionNote || '').trim().slice(0, 500) || null;
        const patch = { extensionNote: note };
        if (products !== undefined && products !== '') {
            patch.limitOverrideProducts = Math.max(0, Number(products) || 0);
        }
        if (orders !== undefined && orders !== '') {
            patch.limitOverrideOrders = Math.max(0, Number(orders) || 0);
        }
        await row.update(patch);
        await row.reload();
        const plan = findPlan(row.selectedPackage);
        const limits = limitsForShop(plan, row);
        await row.update({
            productLimit: limits.productLimit,
            orderLimit: limits.orderLimit
        });
        await row.reload();
        res.status(200).json({ message: 'Shop limits updated.', subscription: row });
    } catch (error) {
        res.status(500).json({ message: 'Could not update shop limits.' });
    }
};

exports.approvePayment = async (req, res) => {
    try {
        const row = await getOrCreateSub();
        await row.update({ paymentStatus: 'active' });
        res.status(200).json({ message: 'Payment approved and plan activated.', subscription: row });
    } catch (error) {
        res.status(500).json({ message: 'Could not approve payment.' });
    }
};

exports.listPendingPayments = async (req, res) => {
    try {
        const row = await getOrCreateSub();
        const pending = row.paymentStatus === 'pending' ? [row] : [];
        res.status(200).json({ rows: pending });
    } catch (error) {
        res.status(500).json({ message: 'Could not load pending payments.' });
    }
};
