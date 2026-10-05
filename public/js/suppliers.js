const SHOP_NAME = 'Ammad Hadi Stor';
let suppliersCache = [];

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderSuppliers() {
    const q = (document.getElementById('listSearch').value || '').toLowerCase().trim();
    const rows = suppliersCache.filter((s) => {
        if (!q) return true;
        return [s.name, s.phone, s.email, s.contactPerson]
            .some((v) => String(v || '').toLowerCase().includes(q));
    });
    const empty = document.getElementById('supplierEmpty');
    empty.style.display = rows.length ? 'none' : 'block';
    document.getElementById('supplierTable').innerHTML = rows.map((s) => {
        const due = Number(s.payable || 0);
        return `<tr>
            <td>${escapeHtml(s.name)}</td>
            <td>${escapeHtml(s.phone)}</td>
            <td class="${due > 0 ? 'sup-due' : ''}">Rs. ${due.toLocaleString()}</td>
            <td><button type="button" class="ghost" data-id="${s.id}" data-act="ledger">View Ledger</button></td>
        </tr>`;
    }).join('');
}

function syncListSearch(value) {
    const el = document.getElementById('listSearch');
    if (el) el.value = value;
    renderSuppliers();
}

async function loadSuppliers() {
    suppliersCache = await api.get('/api/suppliers/list');
    if (!Array.isArray(suppliersCache)) suppliersCache = [];
    renderSuppliers();
    if (typeof renderInvSupplierList === 'function') renderInvSupplierList();
    if (typeof fillQuickPaySuppliers === 'function') fillQuickPaySuppliers();
    if (typeof fillInvSupplierOptions === 'function') fillInvSupplierOptions();
}

document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('view-suppliers');
    root.innerHTML = suppliersMarkup();
    disableAutofill(root);
    document.getElementById('shopName').textContent = SHOP_NAME;
    document.getElementById('globalSearch').addEventListener('input', (e) => syncListSearch(e.target.value));
    document.getElementById('listSearch').addEventListener('input', renderSuppliers);
    document.getElementById('supplierTable').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-act]');
        if (!btn || btn.dataset.act !== 'ledger') return;
        if (typeof fillQuickPaySuppliers === 'function') fillQuickPaySuppliers(btn.dataset.id);
        if (typeof loadQuickPayBills === 'function') {
            loadQuickPayBills().catch((err) => showToast(err.message));
        }
        if (typeof openSupplierLedger === 'function') {
            openSupplierLedger(btn.dataset.id).catch((err) => showToast(err.message));
        }
    });
    if (typeof bindSupplierLedger === 'function') bindSupplierLedger();
    if (typeof bindQuickSupplierPay === 'function') bindQuickSupplierPay();
    loadSuppliers().catch((error) => showToast(error.message));
});
