const INV_BLANKET_UNITS = ['Piece', 'Bag', 'Carton'];

function isInvBlanket() {
    const cat = document.getElementById('invCategory');
    const text = String(cat && cat.value || '').toLowerCase();
    return text.includes('blanket') || text.includes('kambal');
}

function applyInvBlanketMode() {
    const blanket = isInvBlanket();
    const wrap = document.getElementById('invBlanketWrap');
    const fabric = document.getElementById('invFabricWrap');
    const convert = document.getElementById('invConvertWrap');
    const sheet = document.getElementById('invBedsheetWrap');
    const weight = document.getElementById('invBlanketWeight');
    if (wrap) wrap.hidden = !blanket;
    if (weight) weight.required = blanket;
    if (!blanket) {
        if (weight) weight.required = false;
        return;
    }
    if (fabric) fabric.hidden = true;
    if (convert) convert.hidden = true;
    if (sheet) sheet.hidden = true;
    if (typeof fillInvSelect === 'function') {
        fillInvSelect('invUnit', ['Pcs', 'Pack', 'Piece', 'Carton', 'Bag'], 'Pcs');
    }
    const mat = document.getElementById('invBlanketMaterial');
    const type = document.getElementById('invFabricType');
    if (mat && type) type.value = mat.value;
    if (typeof paintInvConvert === 'function') paintInvConvert();
}

function fillInvBlanketFields(product) {
    const ply = document.getElementById('invBlanketPly');
    const size = document.getElementById('invBlanketSize');
    const weight = document.getElementById('invBlanketWeight');
    const mat = document.getElementById('invBlanketMaterial');
    if (ply) ply.value = product.blanketPly || 'Double Ply';
    if (size) size.value = product.blanketSize || 'King Size';
    if (weight) weight.value = Number(product.blanketWeight) > 0 ? product.blanketWeight : '';
    if (mat) mat.value = product.blanketMaterial || product.fabricType || 'Mink Blanket';
}

function invBlanketPayload() {
    if (!isInvBlanket()) {
        return { blanketPly: '', blanketSize: '', blanketWeight: '', blanketMaterial: '' };
    }
    const mat = document.getElementById('invBlanketMaterial');
    if (mat) document.getElementById('invFabricType').value = mat.value;
    return {
        blanketPly: document.getElementById('invBlanketPly').value,
        blanketSize: document.getElementById('invBlanketSize').value,
        blanketWeight: document.getElementById('invBlanketWeight').value,
        blanketMaterial: mat ? mat.value : '',
        fabricType: mat ? mat.value : document.getElementById('invFabricType').value
    };
}

function bindInvBlanket() {
    const cat = document.getElementById('invCategory');
    if (cat && !cat.dataset.blanketBound) {
        cat.dataset.blanketBound = '1';
        cat.addEventListener('change', applyInvBlanketMode);
    }
    const unit = document.getElementById('invUnit');
    if (unit && !unit.dataset.blanketBound) {
        unit.dataset.blanketBound = '1';
        unit.addEventListener('change', () => {
            if (!isInvBlanket() || typeof fillInvSelect !== 'function') return;
            fillInvSelect('invSellUnit', INV_BLANKET_UNITS, unit.value);
        });
    }
    const mat = document.getElementById('invBlanketMaterial');
    if (mat && !mat.dataset.blanketBound) {
        mat.dataset.blanketBound = '1';
        mat.addEventListener('change', () => {
            const type = document.getElementById('invFabricType');
            if (type) type.value = mat.value;
        });
    }
    applyInvBlanketMode();
}
