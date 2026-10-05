const INV_FABRIC_UNITS = ['Meter', 'Thaan', 'Yard', 'Unit', 'Suit'];
const INV_FABRIC_SELL = ['Gaz', 'Meter', 'Yard', 'Thaan', 'Unit', 'Suit'];
const INV_SHEET_UNITS = ['Pieces', 'Set'];
const INV_SHEET_DIM = {
    'Single (60 x 95 in)': '60 x 95 in',
    'King (95 x 99 in)': '95 x 99 in'
};

function isInvBedsheet() {
    const cat = document.getElementById('invCategory');
    return String(cat && cat.value || '').toLowerCase() === 'bedsheet';
}

function fillInvSelect(id, names, selected) {
    const el = document.getElementById(id);
    if (!el) return;
    const keep = selected || el.value || names[0];
    el.innerHTML = names.map((name) => `<option>${name}</option>`).join('');
    el.value = names.includes(keep) ? keep : names[0];
}

function applyInvSheetPreset() {
    const size = document.getElementById('invSheetSize');
    const dim = document.getElementById('invSheetDim');
    if (!size || !dim) return;
    const locked = INV_SHEET_DIM[size.value];
    if (locked) {
        dim.value = locked;
        dim.readOnly = true;
        return;
    }
    dim.readOnly = false;
}

function applyInvBedsheetMode() {
    const sheet = isInvBedsheet();
    const blanket = typeof isInvBlanket === 'function' && isInvBlanket();
    const wrap = document.getElementById('invBedsheetWrap');
    const fabric = document.getElementById('invFabricWrap');
    const convert = document.getElementById('invConvertWrap');
    if (wrap) wrap.hidden = !sheet;
    if (fabric) fabric.hidden = sheet || blanket;
    if (convert) convert.hidden = sheet || blanket;
    if (sheet) {
        fillInvSelect('invUnit', INV_SHEET_UNITS, document.getElementById('invUnit').value);
        fillInvSelect('invSellUnit', INV_SHEET_UNITS, document.getElementById('invSellUnit').value);
        const conv = document.getElementById('invConvert');
        if (conv) conv.value = '1';
        const mat = document.getElementById('invSheetMaterial');
        const type = document.getElementById('invFabricType');
        if (mat && type) type.value = mat.value;
        const pillow = document.getElementById('invPillowSize');
        if (pillow && !pillow.value) pillow.value = '19 x 29 in';
        applyInvSheetPreset();
        paintInvConvert();
        return;
    }
    if (blanket) return;
    fillInvSelect('invUnit', INV_FABRIC_UNITS, 'Meter');
    fillInvSelect('invSellUnit', INV_FABRIC_SELL, 'Gaz');
    const conv = document.getElementById('invConvert');
    if (conv && typeof defaultMetersForSell === 'function') {
        conv.value = defaultMetersForSell(document.getElementById('invSellUnit').value);
    }
    paintInvConvert();
}

function invSheetSizeFromProduct(product) {
    const text = String(product.bedsheetSize || '').trim();
    if (INV_SHEET_DIM[text] || text === 'Super King' || text === 'Custom') return text;
    if (/super\s*king/i.test(text)) return 'Super King';
    if (/king/i.test(text)) return 'King (95 x 99 in)';
    if (/single/i.test(text)) return 'Single (60 x 95 in)';
    return text ? 'Custom' : 'Single (60 x 95 in)';
}

function invPillowFromProduct(product) {
    const n = Number(product.pillowCoverCount);
    if ([0, 1, 2, 4].includes(n)) return String(n);
    const set = String(product.bedsheetSetType || '');
    if (/4/.test(set)) return '4';
    if (/2/.test(set)) return '2';
    if (/1 Pillow/i.test(set)) return '1';
    return '0';
}

function fillInvBedsheetFields(product) {
    const size = document.getElementById('invSheetSize');
    const dim = document.getElementById('invSheetDim');
    const pillow = document.getElementById('invPillowSize');
    const count = document.getElementById('invPillowCount');
    const weight = document.getElementById('invSheetWeight');
    const unit = document.getElementById('invSheetWeightUnit');
    const mat = document.getElementById('invSheetMaterial');
    if (size) size.value = invSheetSizeFromProduct(product);
    applyInvSheetPreset();
    if (dim && product.bedsheetDimensions) dim.value = product.bedsheetDimensions;
    if (pillow) pillow.value = product.pillowCoverSize || '19 x 29 in';
    if (count) count.value = invPillowFromProduct(product);
    if (weight) weight.value = Number(product.bedsheetWeight) > 0 ? product.bedsheetWeight : '';
    if (unit) unit.value = /kg/i.test(String(product.bedsheetWeightUnit || '')) ? 'kg' : 'gm';
    if (mat) mat.value = product.fabricType || 'Cotton';
}

function invBedsheetPayload() {
    if (!isInvBedsheet()) {
        return {
            bedsheetSize: '',
            bedsheetSetType: '',
            bedsheetDimensions: '',
            pillowCoverSize: '',
            pillowCoverCount: '',
            bedsheetWeight: '',
            bedsheetWeightUnit: ''
        };
    }
    const mat = document.getElementById('invSheetMaterial');
    if (mat) document.getElementById('invFabricType').value = mat.value;
    const count = document.getElementById('invPillowCount').value;
    const setMap = { 0: '0 (Sheet Only)', 1: '1 Pillow Cover', 2: '2 Pillow Covers', 4: '4 Pillow Covers' };
    return {
        bedsheetSize: document.getElementById('invSheetSize').value,
        bedsheetSetType: setMap[count] || '0 (Sheet Only)',
        bedsheetDimensions: document.getElementById('invSheetDim').value,
        pillowCoverSize: document.getElementById('invPillowSize').value,
        pillowCoverCount: count,
        bedsheetWeight: document.getElementById('invSheetWeight').value,
        bedsheetWeightUnit: document.getElementById('invSheetWeightUnit').value,
        fabricType: mat ? mat.value : document.getElementById('invFabricType').value
    };
}

function bindInvBedsheet() {
    const cat = document.getElementById('invCategory');
    if (cat && !cat.dataset.sheetBound) {
        cat.dataset.sheetBound = '1';
        cat.addEventListener('change', applyInvBedsheetMode);
    }
    const size = document.getElementById('invSheetSize');
    if (size && !size.dataset.sheetBound) {
        size.dataset.sheetBound = '1';
        size.addEventListener('change', applyInvSheetPreset);
    }
    const unit = document.getElementById('invUnit');
    if (unit && !unit.dataset.sheetBound) {
        unit.dataset.sheetBound = '1';
        unit.addEventListener('change', () => {
            if (!isInvBedsheet()) return;
            fillInvSelect('invSellUnit', INV_SHEET_UNITS, unit.value);
        });
    }
    const mat = document.getElementById('invSheetMaterial');
    if (mat && !mat.dataset.sheetBound) {
        mat.dataset.sheetBound = '1';
        mat.addEventListener('change', () => {
            const type = document.getElementById('invFabricType');
            if (type) type.value = mat.value;
        });
    }
    applyInvBedsheetMode();
}
