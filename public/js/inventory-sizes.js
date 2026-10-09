const INV_SIZE_PRESETS = ['S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40'];
let invSelectedSizes = [];

function invSizeNormalize(value) {
    return String(value || '').trim().slice(0, 24);
}

function paintInvSizePresets() {
    const root = document.getElementById('invSizePresets');
    if (!root) return;
    root.innerHTML = INV_SIZE_PRESETS.map((size) => {
        const on = invSelectedSizes.some((row) => row.toLowerCase() === size.toLowerCase());
        return `<button type="button" class="inv-size-chip${on ? ' on' : ''}" data-inv-size="${size}">${size}</button>`;
    }).join('');
}

function paintInvSizeTags() {
    const root = document.getElementById('invSizeTags');
    if (!root) return;
    const customs = invSelectedSizes.filter((size) =>
        !INV_SIZE_PRESETS.some((row) => row.toLowerCase() === size.toLowerCase()));
    root.innerHTML = customs.map((size, index) => `
        <span class="inv-size-tag">
            <em>${escapeHtml(size)}</em>
            <button type="button" data-inv-size-x="${index}" aria-label="Remove">×</button>
        </span>`).join('');
}

function paintInvSizes() {
    paintInvSizePresets();
    paintInvSizeTags();
}

function setInvSizes(list) {
    const next = [];
    (Array.isArray(list) ? list : []).forEach((item) => {
        const size = invSizeNormalize(item);
        if (!size) return;
        if (!next.some((row) => row.toLowerCase() === size.toLowerCase())) next.push(size);
    });
    invSelectedSizes = next;
    paintInvSizes();
}

function toggleInvSize(size) {
    const value = invSizeNormalize(size);
    if (!value) return;
    const idx = invSelectedSizes.findIndex((row) => row.toLowerCase() === value.toLowerCase());
    if (idx >= 0) invSelectedSizes.splice(idx, 1);
    else invSelectedSizes.push(value);
    paintInvSizes();
}

function addInvCustomSize(raw) {
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
    return invSelectedSizes.slice();
}

function bindInvSizes() {
    const box = document.getElementById('invSizeBox');
    const input = document.getElementById('invSizeInput');
    if (!box || box.dataset.bound === '1') return;
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
    if (!input) return;
    input.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ',') return;
        event.preventDefault();
        addInvCustomSize(input.value.replace(/,/g, ''));
        input.value = '';
    });
}
