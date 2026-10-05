const FALLBACK_POINTS = [
    { title: 'Quality Checked', detail: 'Inspected before it leaves the shop' },
    { title: 'Long Lasting', detail: 'Made for everyday use' },
    { title: 'Easy Care', detail: 'Follow the care label on the pack' },
    { title: 'Ready to Ship', detail: 'Packed for delivery across Pakistan' }
];

function parsePoints(raw) {
    try {
        const list = JSON.parse(raw || '[]');
        if (!Array.isArray(list)) return [];
        return list.map((item) => ({
            title: String((item && item.title) || '').trim().slice(0, 80),
            detail: String((item && item.detail) || '').trim().slice(0, 160)
        })).filter((item) => item.title || item.detail).slice(0, 4);
    } catch (error) {
        return [];
    }
}

function pickText(productValue, shopValue, fallback) {
    const product = String(productValue || '').trim();
    if (product) return product;
    const shop = String(shopValue || '').trim();
    if (shop) return shop;
    return fallback;
}

function resolvePolicy(product, shop) {
    const own = parsePoints(product && product.storeHighlights);
    const shared = parsePoints(shop && shop.policyHighlights);
    const profile = shop || {};
    return {
        highlights: own.length ? own : (shared.length ? shared : FALLBACK_POINTS),
        deliveryTime: pickText(product.storeDeliveryTime, profile.policyDeliveryTime, '2 - 4 Working Days'),
        deliveryCharges: pickText(
            product.storeDeliveryCharge,
            profile.policyDeliveryCharge,
            'Free delivery on orders above Rs. 5,000'
        ),
        deliveryDetails: pickText(product.storeDeliveryDetail, profile.policyDeliveryDetail, ''),
        returnPolicy: pickText(
            product.storeReturnPolicy,
            profile.policyReturn,
            '7 Days Easy Return. Hassle-free returns and exchanges.'
        )
    };
}

module.exports = { parsePoints, resolvePolicy, FALLBACK_POINTS };
