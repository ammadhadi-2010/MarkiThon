const { toNum } = require('./profit');

const GAZ_TO_METER = 0.9144;

function sellUnitOf(product) {
    const unit = String((product && product.sellUnit) || 'Gaz').trim();
    return unit || 'Gaz';
}

function metersPerSellUnit(product) {
    const saved = toNum(product && product.metersPerSellUnit);
    if (saved > 0) return saved;
    const sell = sellUnitOf(product);
    if (/^meter/i.test(sell)) return 1;
    if (/gaz|yard/i.test(sell)) return GAZ_TO_METER;
    return 1;
}

function sellQtyToMeters(qty, product) {
    return toNum(qty) * metersPerSellUnit(product);
}

function receiveQtyToMeters(qty, unit, product) {
    const n = toNum(qty);
    const buy = String(unit || 'Meter');
    const sell = sellUnitOf(product);
    if (/gaz/i.test(buy) && /gaz/i.test(sell)) return n;
    if (/gaz|yard/i.test(buy)) return sellQtyToMeters(n, product || { sellUnit: 'Gaz' });
    return n;
}

function metersToGaz(meters, product, unit) {
    const buy = String(unit || '');
    if (/gaz/i.test(buy) && /gaz/i.test(sellUnitOf(product))) return toNum(meters);
    const factor = metersPerSellUnit(product || { sellUnit: 'Gaz' });
    return factor ? toNum(meters) / factor : 0;
}

function hardwareBillUnit(unit) {
    const raw = String(unit || '').trim();
    if (/^box$/i.test(raw)) return 'Box';
    if (/^pack$/i.test(raw)) return 'Pack';
    if (/^pcs$/i.test(raw)) return 'Pcs';
    return '';
}

function saleFromLine(line, product) {
    const sold = line.quantitySold !== undefined && line.quantitySold !== null && line.quantitySold !== ''
        ? toNum(line.quantitySold)
        : toNum(line.quantityMeters);
    const hardware = hardwareBillUnit(line.sellUnit);
    const meters = hardware
        ? sold
        : (line.quantitySold !== undefined && line.quantitySold !== null && line.quantitySold !== ''
            ? sellQtyToMeters(sold, product)
            : toNum(line.quantityMeters));
    const rate = toNum(line.rate);
    return {
        sold,
        meters,
        rate,
        total: sold * rate,
        sellUnit: hardware || sellUnitOf(product)
    };
}

module.exports = {
    GAZ_TO_METER,
    sellUnitOf,
    metersPerSellUnit,
    sellQtyToMeters,
    receiveQtyToMeters,
    metersToGaz,
    saleFromLine
};
