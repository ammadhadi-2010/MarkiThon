const INV_MOBILE_UNITS = ['Pcs', 'Box', 'Pack'];

function isInvMobile() {
    if (typeof isMobileShop === 'function' && isMobileShop()) return true;
    const cat = document.getElementById('invCategory');
    return typeof isMobileCategory === 'function' && isMobileCategory(cat && cat.value);
}

function setInvMobileHint(mobile) {
    const hint = document.querySelector('#catalogWrap .wl-hint');
    if (!hint) return;
    hint.textContent = mobile
        ? 'Identity only: name, brand, category, compatibility, warranty, and piece units.'
        : 'Identity only: name, brand, category, type, and units. Colors are added when you receive stock.';
}

function applyInvMobileMode() {
    const mobile = isInvMobile();
    const sub = document.getElementById('invSubWrap');
    const fabric = document.getElementById('invFabricWrap');
    const convert = document.getElementById('invConvertWrap');
    const wrap = document.getElementById('invMobileWrap');
    const sheet = document.getElementById('invBedsheetWrap');
    const blanket = document.getElementById('invBlanketWrap');
    if (sub) sub.hidden = mobile;
    if (wrap) wrap.hidden = !mobile;
    setInvMobileHint(mobile);
    const preview = document.getElementById('invPreview');
    if (preview) preview.alt = mobile ? 'Product preview' : 'Fabric preview';
    if (!mobile) return;
    if (fabric) fabric.hidden = true;
    if (convert) convert.hidden = true;
    if (sheet) sheet.hidden = true;
    if (blanket) blanket.hidden = true;
    const subInput = document.getElementById('invSubCategory');
    const fabricInput = document.getElementById('invFabricType');
    if (subInput) subInput.value = '';
    if (fabricInput) fabricInput.value = '';
    const unitEl = document.getElementById('invUnit');
    if (!unitEl || typeof fillInvSelect !== 'function') return;
    fillInvSelect('invUnit', INV_MOBILE_UNITS, unitEl.value);
    const sellEl = document.getElementById('invSellUnit');
    if (sellEl) sellEl.value = unitEl.value || 'Pcs';
    const conv = document.getElementById('invConvert');
    if (conv) conv.value = '1';
    if (typeof paintInvConvert === 'function') paintInvConvert();
}

function fillInvMobileFields(product) {
    applyInvMobileMode();
    if (!isInvMobile()) return;
    const compat = document.getElementById('invCompatibility');
    const warranty = document.getElementById('invWarranty');
    const names = ['Type-C', 'Lightning', 'Universal'];
    const warranties = ['None', '7 Days', 'Brand Warranty'];
    if (compat) compat.value = names.includes(product.compatibility) ? product.compatibility : 'Type-C';
    if (warranty) warranty.value = warranties.includes(product.warrantyType) ? product.warrantyType : 'None';
    const unit = typeof hardwareUnitName === 'function'
        ? (hardwareUnitName(product.stockUnit) || 'Pcs')
        : 'Pcs';
    const sell = typeof hardwareUnitName === 'function'
        ? (hardwareUnitName(product.sellUnit) || unit)
        : unit;
    if (typeof fillInvSelect === 'function') fillInvSelect('invUnit', INV_MOBILE_UNITS, unit);
    const sellEl = document.getElementById('invSellUnit');
    if (sellEl) sellEl.value = sell || unit;
}

function invMobilePayload() {
    if (!isInvMobile()) return { compatibility: '', warrantyType: '' };
    return {
        compatibility: document.getElementById('invCompatibility').value,
        warrantyType: document.getElementById('invWarranty').value,
        metersPerSellUnit: 1
    };
}

function bindInvMobile() {
    const cat = document.getElementById('invCategory');
    if (cat && !cat.dataset.mobileBound) {
        cat.dataset.mobileBound = '1';
        cat.addEventListener('change', applyInvMobileMode);
    }
    const unit = document.getElementById('invUnit');
    if (unit && !unit.dataset.mobileUnit) {
        unit.dataset.mobileUnit = '1';
        unit.addEventListener('change', () => {
            if (!isInvMobile()) return;
            const sellEl = document.getElementById('invSellUnit');
            if (sellEl) sellEl.value = unit.value;
        });
    }
    applyInvMobileMode();
}
