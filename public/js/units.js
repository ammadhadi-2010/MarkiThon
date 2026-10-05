const GAZ_TO_METER = 0.9144;

function sellUnitOf(product) {
    if (typeof posHardwareUnit === 'function' && typeof isMobileProduct === 'function' && isMobileProduct(product)) {
        return posHardwareUnit(product);
    }
    const unit = String((product && product.sellUnit) || 'Gaz').trim();
    return unit || 'Gaz';
}

function metersPerSellUnit(product) {
    const saved = Number(product && product.metersPerSellUnit) || 0;
    if (saved > 0) return saved;
    const sell = sellUnitOf(product);
    if (/^meter/i.test(sell)) return 1;
    if (/gaz|yard/i.test(sell)) return GAZ_TO_METER;
    return 1;
}

function sellQtyToMeters(qty, product) {
    return (Number(qty) || 0) * metersPerSellUnit(product);
}

function receiveQtyToMeters(qty, unit, product) {
    const n = Number(qty) || 0;
    const buy = String(unit || 'Meter');
    const sell = sellUnitOf(product);
    if (/gaz/i.test(buy) && /gaz/i.test(sell)) return n;
    if (/gaz|yard/i.test(buy)) return sellQtyToMeters(n, product || { sellUnit: 'Gaz' });
    return n;
}

function metersToGaz(meters, product, unit) {
    const buy = String(unit || '');
    if (/gaz/i.test(buy) && /gaz/i.test(sellUnitOf(product))) return Number(meters) || 0;
    const factor = metersPerSellUnit(product || { sellUnit: 'Gaz' });
    return factor ? (Number(meters) || 0) / factor : 0;
}

function defaultMetersForSell(sellUnit) {
    if (/^meter/i.test(String(sellUnit || ''))) return 1;
    if (/gaz|yard/i.test(String(sellUnit || ''))) return GAZ_TO_METER;
    return 1;
}

function posSaleItem(line) {
    return {
        productId: line.productId,
        quantitySold: line.qty,
        rate: line.rate,
        sellUnit: line.sellUnit
    };
}
