const INV_SIZE_PRESETS = ['S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40'];
const INV_FABRIC_LENGTHS = [
    '3 Meters', '3.5 Meters', '4 Meters', '4.5 Meters',
    '5 Meters', '5.5 Meters', '6 Meters', 'Custom Cutting'
];
const INV_GARMENT_CATS = [
    'men', 'women', "men's clothing", "women's clothing", 'kids wear', 'kids',
    'garments', 'ready-made suits', 'ready made suits', 'kids fashion',
    'shirts', 't-shirts', 'shalwar kameez'
];
const INV_FABRIC_CATS = [
    'lawn', 'cotton', 'silk', 'khaddar', 'linen', 'fabric', 'kapra',
    'unstitched', 'unstitched fabric', 'than', 'thaan'
];
let invSelectedSizes = [];
let invSizeModeValue = 'hidden';

function invSizeNormalize(value) {
    return String(value || '').trim().slice(0, 24);
}

function invCatKey() {
    return String(document.getElementById('invCategory')?.value || '').trim().toLowerCase();
}

function invShopTypeKey() {
    const type = typeof catalogScope !== 'undefined' ? catalogScope.shopType : '';
    return String(type || '').trim();
}

function isInvGarmentCategory(name) {
    const key = String(name || '').trim().toLowerCase();
    return INV_GARMENT_CATS.some((row) => key === row || key.includes(row));
}

function isInvFabricCategory(name) {
    const key = String(name || '').trim().toLowerCase();
    return INV_FABRIC_CATS.some((row) => key === row || key.includes(row));
}

function invSizeMode() {
    if (typeof isInvMobile === 'function' && isInvMobile()) return 'hidden';
    if (typeof isMobileShop === 'function' && isMobileShop()) return 'hidden';
    if (invShopTypeKey() === 'Electronics & Mobile') return 'hidden';
    const cat = invCatKey();
    if (!cat) {
        return invShopTypeKey() === 'Clothing & Fashion' ? 'fabric' : 'hidden';
    }
    if (isInvGarmentCategory(cat)) return 'garment';
    if (isInvFabricCategory(cat)) return 'fabric';
    if (invShopTypeKey() === 'Clothing & Fashion') return 'fabric';
    return 'hidden';
}

function paintInvSizePresets() {
    const root = document.getElementById('invSizePresets');
    if (!root) return;
    if (invSizeModeValue !== 'garment') {
        root.innerHTML = '';
        return;
    }
    root.innerHTML = INV_SIZE_PRESETS.map((size) => {
        const on = invSelectedSizes.some((row) => row.toLowerCase() === size.toLowerCase());
        return `<button type="button" class="inv-size-chip${on ? ' on' : ''}" data-inv-size="${size}">${size}</button>`;
    }).join('');
}

function paintInvSizeTags() {
    const root = document.getElementById('invSizeTags');
    if (!root) return;
    if (invSizeModeValue !== 'garment') {
        root.innerHTML = '';
        return;
    }
    const customs = invSelectedSizes.filter((size) =>
        !INV_SIZE_PRESETS.some((row) => row.toLowerCase() === size.toLowerCase()));
    root.innerHTML = customs.map((size, index) => `
        <span class="inv-size-tag">
            <em>${escapeHtml(size)}</em>
            <button type="button" data-inv-size-x="${index}" aria-label="Remove">×</button>
        </span>`).join('');
}

function paintInvFabricLength() {
    const select = document.getElementById('invFabricLength');
    if (!select) return;
    const current = invSelectedSizes[0] || '';
    select.innerHTML = '<option value="">Select fabric length</option>'
        + INV_FABRIC_LENGTHS.map((item) =>
            `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join('');
    if (current && INV_FABRIC_LENGTHS.includes(current)) select.value = current;
    else select.value = '';
}

function paintInvSizes() {
    paintInvSizePresets();
    paintInvSizeTags();
    paintInvFabricLength();
}

function applyInvSizeMode() {
    const mode = invSizeMode();
    const prev = invSizeModeValue;
    invSizeModeValue = mode;
    const wrap = document.getElementById('invSizesWrap');
    const fabricWrap = document.getElementById('invFabricLengthWrap');
    const sizeBox = document.getElementById('invSizeBox');
    const hint = document.getElementById('invSizeHint');
    const label = document.getElementById('invSizeLabel');
    if (wrap) wrap.hidden = mode === 'hidden';
    if (fabricWrap) fabricWrap.hidden = mode !== 'fabric';
    if (sizeBox) sizeBox.hidden = mode !== 'garment';
    if (label) {
        label.innerHTML = mode === 'fabric'
            ? 'Fabric Cutting / Length <span class="wl-hint">(Optional)</span>'
            : 'Sizes / Variants <span class="wl-hint">(Optional)</span>';
    }
    if (hint) {
        hint.textContent = mode === 'fabric'
            ? 'Choose a standard cutting length, or Custom Cutting.'
            : 'Leave blank for products that do not need sizing.';
    }
    if (mode === 'hidden') {
        invSelectedSizes = [];
    } else if (mode === 'fabric' && prev !== 'fabric') {
        invSelectedSizes = invSelectedSizes.filter((row) => INV_FABRIC_LENGTHS.includes(row)).slice(0, 1);
    } else if (mode === 'garment' && prev === 'fabric') {
        invSelectedSizes = [];
    }
    paintInvSizes();
}

function setInvSizes(list) {
    const next = [];
    (Array.isArray(list) ? list : []).forEach((item) => {
        const size = invSizeNormalize(item);
        if (!size) return;
        if (!next.some((row) => row.toLowerCase() === size.toLowerCase())) next.push(size);
    });
    invSelectedSizes = next;
    applyInvSizeMode();
}

function toggleInvSize(size) {
    if (invSizeModeValue !== 'garment') return;
    const value = invSizeNormalize(size);
    if (!value) return;
    const idx = invSelectedSizes.findIndex((row) => row.toLowerCase() === value.toLowerCase());
    if (idx >= 0) invSelectedSizes.splice(idx, 1);
    else invSelectedSizes.push(value);
    paintInvSizes();
}

function addInvCustomSize(raw) {
    if (invSizeModeValue !== 'garment') return;
    String(raw || '').split(',').forEach((part) => {
        const size = invSizeNormalize(part);
        if (!size) return;
        if (!invSelectedSizes.some((row) => row.toLowerCase() === size.toLowerCase())) {
            invSelectedSizes.push(size);
        }
    });
    paintInvSizes();
}

function invSizesPayload() {
    if (invSizeModeValue === 'hidden') return [];
    if (invSizeModeValue === 'fabric') {
        const select = document.getElementById('invFabricLength');
        const value = invSizeNormalize(select && select.value);
        return value ? [value] : [];
    }
    return invSelectedSizes.slice();
}

function bindInvSizes() {
    const box = document.getElementById('invSizeBox');
    const input = document.getElementById('invSizeInput');
    const select = document.getElementById('invFabricLength');
    const cat = document.getElementById('invCategory');
    if (cat && !cat.dataset.sizeBound) {
        cat.dataset.sizeBound = '1';
        cat.addEventListener('change', applyInvSizeMode);
    }
    if (select && !select.dataset.bound) {
        select.dataset.bound = '1';
        select.addEventListener('change', () => {
            const value = invSizeNormalize(select.value);
            invSelectedSizes = value ? [value] : [];
        });
    }
    if (box && box.dataset.bound !== '1') {
        box.dataset.bound = '1';
        box.addEventListener('click', (event) => {
            const chip = event.target.closest('[data-inv-size]');
            if (chip) {
                event.preventDefault();
                toggleInvSize(chip.getAttribute('data-inv-size'));
                return;
            }
            const remove = event.target.closest('[data-inv-size-x]');
            if (!remove) return;
            const customs = invSelectedSizes.filter((size) =>
                !INV_SIZE_PRESETS.some((row) => row.toLowerCase() === size.toLowerCase()));
            const name = customs[Number(remove.getAttribute('data-inv-size-x'))];
            if (!name) return;
            invSelectedSizes = invSelectedSizes.filter((row) => row.toLowerCase() !== name.toLowerCase());
            paintInvSizes();
        });
    }
    if (input && !input.dataset.bound) {
        input.dataset.bound = '1';
        input.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ',') return;
            event.preventDefault();
            addInvCustomSize(input.value.replace(/,/g, ''));
            input.value = '';
        });
    }
    applyInvSizeMode();
}
