const MOBILE_CATEGORIES = [
    'mobile accessories',
    'chargers',
    'cases & covers',
    'earphones',
    'power banks',
    'cables'
];

function isMobileShop() {
    const type = typeof catalogScope !== 'undefined' ? catalogScope.shopType : '';
    const value = String(type || '');
    return value === 'Electronics & Mobile' || value === 'Mobile Accessories';
}

function isMobileCategory(name) {
    return MOBILE_CATEGORIES.includes(String(name || '').trim().toLowerCase());
}

function isMobileProduct(product) {
    if (isMobileShop()) return true;
    return isMobileCategory(product && product.category);
}

function hardwareUnitName(unit) {
    const raw = String(unit || '').trim();
    if (/^box$/i.test(raw)) return 'Box';
    if (/^pack$/i.test(raw)) return 'Pack';
    if (/^(pcs|piece|pieces)$/i.test(raw)) return 'Pcs';
    return '';
}

function posHardwareUnit(product) {
    if (!isMobileProduct(product)) {
        return String((product && product.sellUnit) || 'Gaz').trim() || 'Gaz';
    }
    return hardwareUnitName(product && product.sellUnit)
        || hardwareUnitName(product && product.stockUnit)
        || 'Pcs';
}
