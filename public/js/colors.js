const DEFAULT_INV_COLORS = ['Black', 'White', 'Off-White', 'Navy Blue', 'Red', 'Green'];

function extraInvColors() {
    try {
        const raw = JSON.parse(localStorage.getItem('invColors') || '[]');
        return Array.isArray(raw) ? raw.filter(Boolean) : [];
    } catch (error) {
        return [];
    }
}

function allInvColors() {
    return [...new Set(DEFAULT_INV_COLORS.concat(extraInvColors()))];
}

function fillInvColorOptions(selected) {
    const lists = ['invColorList', 'recvColorList']
        .map((id) => document.getElementById(id))
        .filter(Boolean);
    const names = allInvColors();
    const html = names.map((name) =>
        `<option value="${escapeHtml(name)}"></option>`
    ).join('');
    lists.forEach((list) => { list.innerHTML = html; });
    const selHtml = names.map((name) => `<option>${escapeHtml(name)}</option>`).join('');
    document.querySelectorAll('select.recv-v-color').forEach((sel) => {
        const keep = selected || sel.value;
        sel.innerHTML = selHtml;
        if (keep && ![...sel.options].some((opt) => opt.value === keep)) {
            sel.insertAdjacentHTML('beforeend', `<option>${escapeHtml(keep)}</option>`);
        }
        if (keep) sel.value = keep;
    });
    const input = document.getElementById('invColor');
    if (input && selected) input.value = selected;
}

function rememberInvColor(name) {
    const color = String(name || '').trim();
    if (!color) return;
    if (allInvColors().some((c) => c.toLowerCase() === color.toLowerCase())) return;
    const extra = extraInvColors();
    extra.push(color);
    localStorage.setItem('invColors', JSON.stringify(extra));
    fillInvColorOptions(color);
}

function renderColorPage() {
    const tbody = document.getElementById('colorTable');
    if (!tbody) return;
    const extra = extraInvColors();
    tbody.innerHTML = allInvColors().map((name) => {
        const custom = extra.includes(name) && !DEFAULT_INV_COLORS.includes(name);
        return `<tr>
            <td>${escapeHtml(name)}</td>
            <td>${custom ? 'Custom' : 'Standard'}</td>
            <td>${custom
                ? `<button type="button" class="ghost" data-colordel="${escapeHtml(name)}">Delete</button>`
                : '<span class="sku">Locked</span>'}</td>
        </tr>`;
    }).join('');
    fillInvColorOptions();
}

function saveStoreColor(event) {
    event.preventDefault();
    const name = document.getElementById('colorName').value.trim();
    if (!name) return;
    if (allInvColors().some((c) => c.toLowerCase() === name.toLowerCase())) {
        showToast('That color already exists.');
        return;
    }
    const extra = extraInvColors();
    extra.push(name);
    localStorage.setItem('invColors', JSON.stringify(extra));
    document.getElementById('colorForm').reset();
    fillInvColorOptions(name);
    renderColorPage();
    showToast('Color saved for the master catalog.');
}

function deleteStoreColor(name) {
    if (DEFAULT_INV_COLORS.includes(name)) return;
    const extra = extraInvColors().filter((c) => c !== name);
    localStorage.setItem('invColors', JSON.stringify(extra));
    fillInvColorOptions();
    renderColorPage();
    showToast('Color removed.');
}

document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('view-colors');
    if (!root) return;
    root.innerHTML = colorsMarkup();
    disableAutofill(root);
    bindCatalogPageActions(root);
    document.getElementById('colorBack').addEventListener('click', () => showView('inventory'));
    document.getElementById('colorForm').addEventListener('submit', saveStoreColor);
    document.getElementById('colorTable').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-colordel]');
        if (btn) deleteStoreColor(btn.dataset.colordel);
    });
    renderColorPage();
});
