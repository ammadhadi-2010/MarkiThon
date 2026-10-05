let wholesalersCache = [];
let wlLedgerId = '';

function resetWholesalerForm() {
    const form = document.getElementById('wlForm');
    if (!form) return;
    form.reset();
    document.getElementById('wlEditId').value = '';
    document.getElementById('wlCredit').value = '0';
}

function fillWholesalerForm(row) {
    document.getElementById('wlEditId').value = row.id;
    document.getElementById('wlName').value = row.name || '';
    document.getElementById('wlShop').value = row.shopName || '';
    document.getElementById('wlPhone').value = row.phone || '';
    document.getElementById('wlEmail').value = row.email || '';
    document.getElementById('wlCity').value = row.city || '';
    document.getElementById('wlCredit').value = Number(row.creditLimit) || 0;
    document.getElementById('wlNotes').value = row.notes || '';
    showView('wholesalers');
}

function wlSearchQuery() {
    return (document.getElementById('wlListSearch')?.value || '').toLowerCase().trim();
}

function renderWholesalers() {
    const q = wlSearchQuery();
    const rows = wholesalersCache.filter((w) => {
        if (!q) return true;
        return [w.name, w.shopName, w.phone, w.city, w.email]
            .some((v) => String(v || '').toLowerCase().includes(q));
    });
    const empty = document.getElementById('wlEmpty');
    if (empty) empty.style.display = rows.length ? 'none' : 'block';
    document.getElementById('wlTable').innerHTML = rows.map((w) => {
        const due = Number(w.creditBalance) || 0;
        const limit = Number(w.creditLimit) || 0;
        const over = limit > 0 && due > limit;
        return `<tr>
            <td>
                <strong>${escapeHtml(w.name)}</strong>
                <span class="wl-sub">${escapeHtml(w.shopName || w.city || w.phone || '')}</span>
            </td>
            <td>${Number(w.orderCount) || 0}</td>
            <td class="${over ? 'wl-over' : ''}">Rs. ${due.toLocaleString()}
                <span class="wl-sub">Limit Rs. ${limit.toLocaleString()}</span></td>
            <td class="col-actions">${actionMenuHtml(w.id, `<button type="button" data-id="${w.id}" data-act="ledger">View Ledger</button>`, {
                editLabel: 'Edit Wholesaler',
                deleteLabel: 'Delete Wholesaler'
            })}</td>
        </tr>`;
    }).join('');
}

async function loadWholesalers() {
    wholesalersCache = await api.get('/api/wholesalers/list');
    if (!Array.isArray(wholesalersCache)) wholesalersCache = [];
    if (document.getElementById('wlTable')) renderWholesalers();
}

async function saveWholesaler(event) {
    event.preventDefault();
    const id = document.getElementById('wlEditId').value;
    const payload = {
        name: document.getElementById('wlName').value,
        shopName: document.getElementById('wlShop').value,
        phone: document.getElementById('wlPhone').value,
        email: document.getElementById('wlEmail').value,
        city: document.getElementById('wlCity').value,
        creditLimit: document.getElementById('wlCredit').value,
        notes: document.getElementById('wlNotes').value
    };
    const data = id
        ? await api.put(`/api/wholesalers/${id}`, payload)
        : await api.post('/api/wholesalers/add', payload);
    resetWholesalerForm();
    showToast(data.message);
    await loadWholesalers();
}

async function removeWholesaler(id) {
    if (!confirm('Delete this wholesaler?')) return;
    const data = await api.del(`/api/wholesalers/${id}`);
    showToast(data.message);
    hideWlLedger();
    await loadWholesalers();
}

function hideWlLedger() {
    const card = document.getElementById('wlLedgerCard');
    if (card) card.hidden = true;
    wlLedgerId = '';
}

async function openWholesalerLedger(id) {
    showView('wholesalers', { skipRefresh: true });
    await loadWholesalers();
    wlLedgerId = String(id);
    const card = document.getElementById('wlLedgerCard');
    if (!card) return;
    const row = wholesalersCache.find((w) => String(w.id) === String(id));
    document.getElementById('wlLedgerName').textContent = row
        ? `${row.name} — ${row.shopName || row.phone || ''}`
        : 'Wholesaler ledger';
    card.hidden = false;
    const data = await api.get(`/api/wholesalers/${id}/ledger`);
    const rows = data.rows || data || [];
    document.getElementById('wlLedgerRows').innerHTML = rows.map((e) => {
        const color = e.type === 'PAYMENT' ? '#4ade80' : '#f87171';
        const when = e.entryDate || e.createdAt || '';
        return `<tr><td style="color:${color}">${escapeHtml(e.type)}</td>
            <td>${Number(e.amount).toLocaleString()}</td>
            <td>${escapeHtml(e.note || e.ref || '-')}</td>
            <td>${escapeHtml(String(when).slice(0, 10))}</td></tr>`;
    }).join('') || '<tr><td colspan="4" class="empty">No ledger rows.</td></tr>';
}

async function saveWlPayment(event) {
    event.preventDefault();
    if (!wlLedgerId) return showToast('Open a wholesaler ledger first.');
    const amount = document.getElementById('wlPayAmt').value;
    const note = document.getElementById('wlPayNote').value;
    const data = await api.post(`/api/wholesalers/${wlLedgerId}/payments`, { amount, note });
    showToast(data.message);
    document.getElementById('wlPayForm').reset();
    await loadWholesalers();
    await openWholesalerLedger(wlLedgerId);
}

document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('view-wholesalers');
    if (!root) return;
    root.innerHTML = wholesalersMarkup();
    disableAutofill(root);
    document.getElementById('wlForm').addEventListener('submit', (e) => {
        saveWholesaler(e).catch((err) => showToast(err.message));
    });
    document.getElementById('cancelWl').addEventListener('click', resetWholesalerForm);
    document.getElementById('wlListSearch').addEventListener('input', renderWholesalers);
    document.getElementById('globalSearch').addEventListener('input', (e) => {
        const view = document.getElementById('view-wholesalers');
        const box = document.getElementById('wlListSearch');
        if (!view?.classList.contains('active') || !box) return;
        box.value = e.target.value;
        renderWholesalers();
    });
    document.getElementById('wlLedgerClose').addEventListener('click', hideWlLedger);
    document.getElementById('wlPayForm').addEventListener('submit', (e) => {
        saveWlPayment(e).catch((err) => showToast(err.message));
    });
    document.getElementById('wlTable').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-act]');
        if (!btn) return;
        const row = wholesalersCache.find((w) => String(w.id) === String(btn.dataset.id));
        if (btn.dataset.act === 'edit' && row) fillWholesalerForm(row);
        if (btn.dataset.act === 'delete') removeWholesaler(btn.dataset.id).catch((err) => showToast(err.message));
        if (btn.dataset.act === 'ledger') openWholesalerLedger(btn.dataset.id).catch((err) => showToast(err.message));
    });
    loadWholesalers().catch((error) => showToast(error.message));
});
