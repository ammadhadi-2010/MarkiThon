const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../data/subscription-plans.json');

function defaultPlans() {
    return {
        updatedAt: '',
        plans: [
            {
                id: 'Basic',
                label: 'Basic Free Plan',
                icon: '🥇',
                monthlyPrice: 0,
                yearlyPrice: 0,
                productLimit: 50,
                orderLimit: 100,
                popular: false,
                features: ['Inventory Management', 'Billing / POS', 'Customer Ledger', 'Basic Reports']
            },
            {
                id: 'Business',
                label: 'Business',
                icon: '👑',
                monthlyPrice: 3999,
                yearlyPrice: 39990,
                productLimit: 500,
                orderLimit: 2000,
                popular: true,
                features: ['All Basic Features', 'Wholesale Orders', 'Supplier Ledger', 'Multi-User (3)', 'Advanced Reports']
            },
            {
                id: 'Premium',
                label: 'Premium',
                icon: '💎',
                monthlyPrice: 6999,
                yearlyPrice: 69990,
                productLimit: 5000,
                orderLimit: 20000,
                popular: false,
                features: ['All Business Features', 'Online Store', 'Multi-Branch (Up to 5)', 'API Access', 'Priority Support']
            }
        ]
    };
}

function cleanPlan(row) {
    const base = {
        id: String(row.id || '').trim(),
        label: String(row.label || row.id || '').trim(),
        icon: String(row.icon || '📦').trim(),
        monthlyPrice: Math.max(0, Number(row.monthlyPrice) || 0),
        yearlyPrice: Math.max(0, Number(row.yearlyPrice) || 0),
        productLimit: Math.max(0, Number(row.productLimit) || 0),
        orderLimit: Math.max(0, Number(row.orderLimit) || 0),
        popular: Boolean(row.popular),
        features: Array.isArray(row.features)
            ? row.features.map((f) => String(f).trim()).filter(Boolean).slice(0, 12)
            : []
    };
    return base;
}

function readPlans() {
    try {
        const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
        const plans = (raw.plans || []).map(cleanPlan).filter((p) => p.id);
        if (plans.length) return { updatedAt: raw.updatedAt || '', plans };
    } catch (error) {
        /* seed on first use */
    }
    const seeded = defaultPlans();
    writePlans(seeded);
    return seeded;
}

function writePlans(store) {
    const plans = (store.plans || []).map(cleanPlan).filter((p) => p.id);
    const payload = { updatedAt: new Date().toISOString(), plans };
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(payload, null, 2));
    return payload;
}

function findPlan(planId) {
    const store = readPlans();
    return store.plans.find((p) => p.id === planId) || store.plans[0] || null;
}

function priceForPlan(plan, billingCycle) {
    if (!plan) return 0;
    return billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
}

function limitsForShop(plan, overrides) {
    const extraProducts = Number(overrides?.limitOverrideProducts) || 0;
    const extraOrders = Number(overrides?.limitOverrideOrders) || 0;
    return {
        productLimit: (plan?.productLimit || 0) + extraProducts,
        orderLimit: (plan?.orderLimit || 0) + extraOrders
    };
}

module.exports = {
    readPlans,
    writePlans,
    findPlan,
    priceForPlan,
    limitsForShop,
    defaultPlans,
    cleanPlan
};
