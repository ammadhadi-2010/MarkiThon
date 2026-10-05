let rpSupCache = [];
let rpSupFilter = 'all';

function moneyRs(n) {
    return 'Rs. ' + Number(n || 0).toLocaleString();
}

function rpSupQuery() {
    const from = document.getElementById('rpSupFrom').value;
    const to = document.getElementById('rpSupTo').value;
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString();
    return qs ? '?' + qs : '';
}

function matchRpSupplier(row, q) {
    if (!q) return true;
    const blob = [row.name, row.phone, row.email]
        .concat(row.refs || []).concat(row.brands || []).join(' ').toLowerCase();
    return blob.includes(q);
}

function filteredRpSuppliers() {
    const q = (document.getElementById('rpSupSearch').value || '').toLowerCase().trim();
    let rows = rpSupCache.filter((s) => matchRpSupplier(s, q));
    if (rpSupFilter === 'pending') rows = rows.filter((s) => Number(s.payable) > 0);
    if (rpSupFilter === 'zero') rows = rows.filter((s) => Number(s.payable) <= 0);
    return rows;
}

function renderRpSupplierTable() {
    const rows = filteredRpSuppliers();
    document.getElementById('rpHead').innerHTML =
        '<tr><th>Supplier Name &amp; Phone</th><th>Total Purchases (Rs.)</th><th>Total Amount Paid (Rs.)</th><th>Balance Payable (Rs.)</th><th>Actions</th></tr>';
    document.getElementById('rpBody').innerHTML = rows.map((s) => {
        const due = Number(s.payable || 0);
        return `<tr>
            <td>${escapeHtml(s.name)}<span class="sku">${escapeHtml(s.phone || '')}</span></td>
            <td>${moneyRs(s.totalPurchases)}</td>
            <td>${moneyRs(s.totalPaid)}</td>
            <td class="${due > 0 ? 'sup-due' : ''}">${moneyRs(due)}</td>
            <td>
                <button type="button" class="primary" data-rppay="${s.id}">Record Payment</button>
                <button type="button" class="ghost" data-rpled="${s.id}">View Ledger History</button>
            </td>
        </tr>`;
    }).join('') || '<tr><td colspan="5" class="empty">No suppliers match these filters.</td></tr>';
}

async function loadRpSuppliers() {
    rpSupCache = await api.get('/api/suppliers/list' + rpSupQuery());
    if (!Array.isArray(rpSupCache)) rpSupCache = [];
    renderRpSupplierTable();
}

function exportSupplierReportCsv() {
    const rows = filteredRpSuppliers();
    const lines = [['Supplier', 'Phone', 'Purchases', 'Paid', 'Payable'].join(',')];
    rows.forEach((s) => {
        lines.push([s.name, s.phone, s.totalPurchases, s.totalPaid, s.payable]
            .map((v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`).join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'supplier-report.csv';
    a.click();
}

function closeRpNested(id) {
    document.getElementById(id).hidden = true;
}

function openRpPayModal(id) {
    const sup = id ? rpSupCache.find((s) => String(s.id) === String(id)) : null;
    const options = rpSupCache.map((s) =>
        `<option value="${s.id}" ${sup && String(sup.id) === String(s.id) ? 'selected' : ''}>${escapeHtml(s.name)}</option>`
    ).join('');
    const modal = document.getElementById('rpPayModal');
    modal.hidden = false;
    modal.innerHTML = `
        <form class="share-card" id="rpPayForm" autocomplete="off">
            <h3>Record Payment</h3>
            <div class="field"><label>Supplier</label>
                <select id="rpPaySupplier" name="rpPaySupplier" required autocomplete="off">${options}</select></div>
            <div class="field"><label>Amount</label>
                <input id="rpPayAmt" name="rpPayAmt" type="number" step="0.01" required autocomplete="off"></div>
            <div class="field"><label>Method</label>
                <select id="rpPayMethod" name="rpPayMethod" autocomplete="off">
                    <option>Cash</option><option>Bank</option>
                </select></div>
            <div class="field"><label>Note</label>
                <input id="rpPayNote" name="rpPayNote" placeholder="Payment note" autocomplete="off"></div>
            <button type="submit" class="primary">Save Payment</button>
            <button type="button" class="ghost" id="rpPayClose">Close</button>
        </form>`;
    document.getElementById('rpPayClose').addEventListener('click', () => closeRpNested('rpPayModal'));
    document.getElementById('rpPayForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const sid = document.getElementById('rpPaySupplier').value;
        api.post(`/api/suppliers/${sid}/payments`, {
            amount: document.getElementById('rpPayAmt').value,
            method: document.getElementById('rpPayMethod').value,
            note: document.getElementById('rpPayNote').value
        }).then(async (data) => {
            showToast(data.message);
            closeRpNested('rpPayModal');
            await loadRpSuppliers();
            if (typeof loadSuppliers === 'function') await loadSuppliers();
        }).catch((err) => showToast(err.message));
    });
}

async function openRpLedger(id) {
    const sup = rpSupCache.find((s) => String(s.id) === String(id));
    let rows = await api.get(`/api/suppliers/${id}/ledger`);
    if (!Array.isArray(rows)) rows = [];
    const from = document.getElementById('rpSupFrom').value;
    const to = document.getElementById('rpSupTo').value;
    if (from) rows = rows.filter((e) => new Date(e.entryDate || e.createdAt) >= new Date(from));
    if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        rows = rows.filter((e) => new Date(e.entryDate || e.createdAt) <= end);
    }
    const modal = document.getElementById('rpLedModal');
    modal.hidden = false;
    modal.innerHTML = `
        <div class="share-card" style="width:min(640px,100%)">
            <h3>Supplier Ledger History</h3>
            <p class="share-sub">${escapeHtml(sup && sup.name)} · Payable ${moneyRs(sup && sup.payable)}</p>
            <div class="table-wrap"><table>
                <thead><tr><th>Type</th><th>Amount</th><th>Ref / Method</th><th>Note</th></tr></thead>
                <tbody>${rows.map((e) => `<tr>
                    <td>${e.type === 'PURCHASE' ? 'Purchase' : 'Payment'}</td>
                    <td>${moneyRs(e.amount)}</td>
                    <td>${escapeHtml(e.method || e.ref || '-')}</td>
                    <td>${escapeHtml(e.note || '')}<span class="sku">${escapeHtml(new Date(e.entryDate || e.createdAt).toLocaleString())}</span></td>
                </tr>`).join('') || '<tr><td colspan="4" class="empty">No ledger entries yet.</td></tr>'}</tbody>
            </table></div>
            <button type="button" class="ghost" id="rpLedClose">Close</button>
        </div>`;
    document.getElementById('rpLedClose').addEventListener('click', () => closeRpNested('rpLedModal'));
}

async function openSupplierReport() {
    document.getElementById('rpSupplierTools').hidden = false;
    document.getElementById('rpModalTitle').textContent = 'Supplier Report';
    showReportPage(true);
    await loadRpSuppliers();
}

function bindSupplierReport() {
    const tools = document.getElementById('rpSupplierTools');
    if (!tools || tools.dataset.bound) return;
    tools.dataset.bound = '1';
    document.getElementById('rpSupSearch').addEventListener('input', renderRpSupplierTable);
    tools.querySelectorAll('[data-rpfilter]').forEach((btn) => {
        btn.addEventListener('click', () => {
            rpSupFilter = btn.dataset.rpfilter;
            tools.querySelectorAll('[data-rpfilter]').forEach((b) => b.classList.toggle('active', b === btn));
            renderRpSupplierTable();
        });
    });
    ['rpSupFrom', 'rpSupTo'].forEach((id) => {
        document.getElementById(id).addEventListener('change', () => {
            loadRpSuppliers().catch((err) => showToast(err.message));
        });
    });
    document.getElementById('rpRecordPay').addEventListener('click', () => openRpPayModal());
    document.getElementById('rpBody').addEventListener('click', (e) => {
        const pay = e.target.closest('[data-rppay]');
        const led = e.target.closest('[data-rpled]');
        if (pay) openRpPayModal(pay.dataset.rppay);
        if (led) openRpLedger(led.dataset.rpled).catch((err) => showToast(err.message));
    });
}
