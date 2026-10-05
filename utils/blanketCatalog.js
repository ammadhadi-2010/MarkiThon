const BLANKET_PLY = ['Single Ply', 'Double Ply', 'Heavy Double Ply'];
const BLANKET_SIZES = ['Single Bed', 'Double Bed', 'King Size', 'Baby Blanket'];
const BLANKET_MATERIALS = ['Mink Blanket', 'Fleece', 'Microfiber', 'Woolen'];
const BLANKET_UNITS = ['Piece', 'Bag', 'Carton'];

function isBlanketCategory(category) {
    const text = String(category || '').trim().toLowerCase();
    return text.includes('blanket') || text.includes('kambal');
}

function pickList(list, value, fallback) {
    return list.includes(value) ? value : fallback;
}

function pickUnit(value) {
    const text = String(value || '');
    if (/carton/i.test(text)) return 'Carton';
    if (/bag/i.test(text)) return 'Bag';
    return 'Piece';
}

function shortMaterial(name) {
    const text = String(name || '').trim();
    if (/mink/i.test(text)) return 'Mink';
    return text;
}

function formatBlanketSpec(product) {
    if (!product) return '';
    if (!isBlanketCategory(product.category) && !product.blanketPly && !product.blanketSize) {
        return '';
    }
    const ply = product.blanketPly || 'Double Ply';
    const size = product.blanketSize || 'King Size';
    const weight = Number(product.blanketWeight);
    const material = shortMaterial(product.blanketMaterial || product.fabricType);
    const kg = weight > 0 ? `${weight} kg` : '';
    return [`${ply} - ${size}`, kg, material].filter(Boolean).join(' | ');
}

function clearBlanketFields(data) {
    return {
        ...data,
        blanketPly: null,
        blanketSize: null,
        blanketWeight: null,
        blanketMaterial: null
    };
}

function applyBlanketFields(data, body) {
    const src = body || {};
    if (!isBlanketCategory(data.category || src.category)) return clearBlanketFields(data);
    const weight = Number(src.blanketWeight);
    const unit = pickUnit(src.stockUnit || src.sellUnit || data.stockUnit);
    const material = pickList(
        BLANKET_MATERIALS,
        src.blanketMaterial || src.fabricType,
        data.blanketMaterial || data.fabricType || 'Mink Blanket'
    );
    return {
        ...data,
        fabricType: material,
        blanketPly: pickList(BLANKET_PLY, src.blanketPly || data.blanketPly, 'Double Ply'),
        blanketSize: pickList(BLANKET_SIZES, src.blanketSize || data.blanketSize, 'King Size'),
        blanketWeight: Number.isFinite(weight) && weight > 0 ? weight : null,
        blanketMaterial: material,
        stockUnit: unit,
        sellUnit: unit,
        metersPerSellUnit: 1
    };
}

module.exports = {
    BLANKET_PLY,
    BLANKET_SIZES,
    BLANKET_MATERIALS,
    BLANKET_UNITS,
    isBlanketCategory,
    formatBlanketSpec,
    applyBlanketFields
};
