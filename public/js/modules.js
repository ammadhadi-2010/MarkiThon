async function addLedgerEntry() {
    const data = await offlineSaveLedger({
        customerName: document.getElementById('ledgerCustName').value,
        transactionType: document.getElementById('transType').value,
        amount: document.getElementById('ledgerAmt').value,
        description: document.getElementById('ledgerDesc').value
    });
    showToast(data.message);
    await loadCustomerHub();
}

function paintLedgerRows(rows) {
    const tbody = document.getElementById('ledgerTable');
    tbody.innerHTML = (rows || []).map((row) => {
        const color = row.transactionType === 'PAYMENT' ? '#4ade80' : '#f87171';
        return `<tr><td style="color:${color}">${row.transactionType}</td><td>${row.amount}</td><td>${escapeHtml(row.description || '-')}</td></tr>`;
    }).join('') || '<tr><td colspan="3" class="empty">No ledger rows.</td></tr>';
}

async function searchLedger() {
    const name = document.getElementById('searchCust').value.trim();
    if (!name) {
        paintLedgerRows(await offlineLoadLedger());
        return;
    }
    paintLedgerRows(await offlineLoadLedger(name));
}

async function loadCustomerHub() {
    if (typeof loadCustDash === 'function') await loadCustDash();
    const search = document.getElementById('searchCust');
    const name = search ? search.value.trim() : '';
    if (!document.getElementById('ledgerTable')) return;
    if (name) paintLedgerRows(await offlineLoadLedger(name));
    else paintLedgerRows(await offlineLoadLedger());
}

document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('addLedgerBtn');
    const searchBtn = document.getElementById('searchLedgerBtn');
    if (addBtn) addBtn.addEventListener('click', () =>
        addLedgerEntry().catch((e) => showToast(e.message)));
    if (searchBtn) searchBtn.addEventListener('click', () =>
        searchLedger().catch((e) => showToast(e.message)));
});
