const BEDSHEET_PRESETS = [
    'Single (60 x 95 in)',
    'King (95 x 99 in)',
    'Super King',
    'Custom'
];
const PRESET_DIM = {
    'Single (60 x 95 in)': '60 x 95 in',
    'King (95 x 99 in)': '95 x 99 in'
};
const BEDSHEET_MATERIALS = ['Cotton', 'Lawn', 'Velvet', 'Satin', 'Linen'];
const PILLOW_COUNTS = [0, 1, 2, 4];
const SET_FROM_PILLOWS = {
    0: '0 (Sheet Only)',
    1: '1 Pillow Cover',
    2: '2 Pillow Covers',
    4: '4 Pillow Covers'
};

function isBedsheetCategory(category) {
    return String(category || '').trim().toLowerCase() === 'bedsheet';
}

function pickList(list, value, fallback) {
    return list.includes(value) ? value : fallback;
}

function migrateSize(value) {
    const text = String(value || '').trim();
    if (BEDSHEET_PRESETS.includes(text)) return text;
    if (/super\s*king/i.test(text)) return 'Super King';
    if (/king/i.test(text)) return 'King (95 x 99 in)';
    if (/single/i.test(text)) return 'Single (60 x 95 in)';
    return text ? 'Custom' : 'Single (60 x 95 in)';
}

function migratePillows(count, setType) {
    const n = Number(count);
    if (PILLOW_COUNTS.includes(n)) return n;
    const text = String(setType || '');
    if (/4/.test(text)) return 4;
    if (/2/.test(text)) return 2;
    if (/1 Pillow/i.test(text)) return 1;
    return 0;
}

function normalizeInches(value, fallback) {
    const text = String(value || '').trim();
    if (!text) return fallback || '';
    return text.replace(/\s*[x×]\s*/gi, ' x ').replace(/\s*in\.?$/i, ' in');
}

function compactDim(value) {
    return String(value || '').replace(/\s*[x×]\s*/gi, 'x').replace(/\s+/g, ' ').trim();
}

function shortSizeName(size) {
    const text = String(size || '').trim();
    const cut = text.indexOf(' (');
    return cut > 0 ? text.slice(0, cut) : text;
}

function weightLabel(weight, unit) {
    const n = Number(weight);
    if (!(n > 0)) return '';
    return `${n}${/kg/i.test(String(unit || 'gm')) ? 'kg' : 'gm'}`;
}

function pillowLabel(count) {
    const n = Number(count);
    if (!(n > 0)) return 'Sheet Only';
    return n === 1 ? '1 Pillow' : `${n} Pillows`;
}

function formatBedsheetSpec(product) {
    if (!product) return '';
    if (!isBedsheetCategory(product.category) && !product.bedsheetSize && !product.bedsheetDimensions) {
        return '';
    }
    const size = migrateSize(product.bedsheetSize);
    const dim = compactDim(product.bedsheetDimensions || PRESET_DIM[size] || '');
    const short = shortSizeName(size);
    const head = dim ? `${short} - ${dim}` : short;
    const pillows = migratePillows(product.pillowCoverCount, product.bedsheetSetType);
    return [head, pillowLabel(pillows), weightLabel(product.bedsheetWeight, product.bedsheetWeightUnit)]
        .filter(Boolean)
        .join(' | ');
}

function clearBedsheetFields(data) {
    return {
        ...data,
        bedsheetSize: null,
        bedsheetSetType: null,
        bedsheetDimensions: null,
        pillowCoverSize: null,
        pillowCoverCount: null,
        bedsheetWeight: null,
        bedsheetWeightUnit: null
    };
}

function applyBedsheetFields(data, body) {
    const src = body || {};
    if (!isBedsheetCategory(data.category || src.category)) return clearBedsheetFields(data);
    const unit = /set/i.test(String(src.stockUnit || src.sellUnit || data.stockUnit || ''))
        ? 'Set'
        : 'Pieces';
    const size = migrateSize(src.bedsheetSize || data.bedsheetSize);
    const pillows = migratePillows(src.pillowCoverCount, src.bedsheetSetType || data.bedsheetSetType);
    const weight = Number(src.bedsheetWeight);
    const wUnit = /kg/i.test(String(src.bedsheetWeightUnit || 'gm')) ? 'kg' : 'gm';
    return {
        ...data,
        fabricType: pickList(BEDSHEET_MATERIALS, src.fabricType, data.fabricType || 'Cotton'),
        bedsheetSize: size,
        bedsheetSetType: SET_FROM_PILLOWS[pillows],
        bedsheetDimensions: normalizeInches(src.bedsheetDimensions, PRESET_DIM[size] || ''),
        pillowCoverSize: normalizeInches(src.pillowCoverSize, '19 x 29 in') || '19 x 29 in',
        pillowCoverCount: pillows,
        bedsheetWeight: Number.isFinite(weight) && weight > 0 ? weight : null,
        bedsheetWeightUnit: wUnit,
        stockUnit: unit,
        sellUnit: unit,
        metersPerSellUnit: 1
    };
}

module.exports = {
    BEDSHEET_PRESETS,
    BEDSHEET_MATERIALS,
    isBedsheetCategory,
    formatBedsheetSpec,
    applyBedsheetFields
};
