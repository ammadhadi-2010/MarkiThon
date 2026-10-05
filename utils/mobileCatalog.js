const MOBILE_CATEGORIES = [
    'mobile accessories',
    'chargers',
    'cases & covers',
    'earphones',
    'power banks',
    'cables'
];

function cleanText(value) {
    const text = String(value == null ? '' : value).trim();
    return text || null;
}

function hardwareUnit(value, fallback) {
    const raw = String(value || '').trim();
    if (/^box$/i.test(raw)) return 'Box';
    if (/^pack$/i.test(raw)) return 'Pack';
    if (/^(pcs|piece|pieces)$/i.test(raw)) return 'Pcs';
    return fallback || '';
}

function isMobileHardware(body) {
    const category = String(body.category || '').trim().toLowerCase();
    if (MOBILE_CATEGORIES.includes(category)) return true;
    return Boolean(hardwareUnit(body.stockUnit) || hardwareUnit(body.sellUnit));
}

function applyMobileFields(data, body) {
    const hardware = isMobileHardware(body || {});
    data.compatibility = hardware ? cleanText(body.compatibility) : null;
    data.warrantyType = hardware ? cleanText(body.warrantyType) : null;
    if (!hardware) return data;
    data.subCategory = null;
    data.fabricType = null;
    data.stockUnit = hardwareUnit(body.stockUnit, 'Pcs');
    data.sellUnit = hardwareUnit(body.sellUnit, data.stockUnit);
    data.metersPerSellUnit = 1;
    return data;
}

module.exports = { applyMobileFields, isMobileHardware, hardwareUnit };
