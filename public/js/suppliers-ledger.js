let supLedgerId = '';
let supLedgerRows = [];

function hideSupLedger() {
    const card = document.getElementById('supLedgerCard');
    if (card) card.hidden = true;
    supLedgerId = '';
    supLedgerRows = [];
}

function groupSupplierBills(rows) {
    const map = {};
    (rows || []).forEach((e) => {
        const ref = e.ref || 'NO-REF';
        if (!map[ref]) map[ref] = { ref, purchase: 0, paid: 0 };
        if (e.type === 'PURCHASE') map[ref].purchase += Number(e.amount || 0);
        if (e.type === 'PAYMENT') map[ref].paid += Number(e.amount || 0);
    });
    return Object.values(map).map((b) => ({ ...b, due: b.purchase - b.paid }));
}

function isInstallmentNote(note) {
    return /installment/i.test(String(note || ''));
}

function paintSupSummary(rows, payable) {
    const list = rows || [];
    const purchase = list.filter((e) => e.type === 'PURCHASE')
        .reduce((s, e) => s + Number(e.amount || 0), 0);
    const payments = list.filter((e) => e.type === 'PAYMENT');
    const initial = payments.filter((e) => !isInstallmentNote(e.note))
        .reduce((s, e) => s + Number(e.amount || 0), 0);
    const install = payments.filter((e) => isInstallmentNote(e.note))
        .reduce((s, e) => s + Number(e.amount || 0), 0);
    const due = payable != null ? Number(payable) : purchase - initial - install;
    const set = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = `Rs. ${Number(value || 0).toLocaleString()}`;
    };
    set('supStatPurchase', purchase);
    set('supStatInitial', initial);
    set('supStatInstall', install);
    set('supStatDue', Math.max(due, 0));
}

function paintSupBills(bills) {
    document.getElementById('supBillRows').innerHTML = bills.map((b) => `<tr>
        <td>${escapeHtml(b.ref)}</td>
        <td>Rs. ${b.purchase.toLocaleString()}</td>
        <td>Rs. ${b.paid.toLocaleString()}</td>
        <td class="${b.due > 0 ? 'sup-due' : ''}">Rs. ${b.due.toLocaleString()}</td>
    </tr>`).join('') || '<tr><td colspan="4" class="empty">No purchase bills yet.</td></tr>';
}

function paintSupLedgerRows(rows) {
    document.getElementById('supLedgerRows').innerHTML = (rows || []).map((e) => {
        const debit = e.type === 'PURCHASE' ? Number(e.amount || 0) : 0;
        const credit = e.type === 'PAYMENT' ? Number(e.amount || 0) : 0;
        const label = e.type === 'PURCHASE'
            ? 'Stock purchase'
            : (isInstallmentNote(e.note) ? 'Installment' : 'Stock In payment');
        const txn = [e.method, e.txnId, e.hasSlip ? 'Slip' : '']
            .filter(Boolean).join(' · ') || '-';
        const when = e.entryDate || e.createdAt || '';
        return `<tr>
            <td>${escapeHtml(label)}</td>
            <td>${debit ? `Rs. ${debit.toLocaleString()}` : '-'}</td>
            <td>${credit ? `Rs. ${credit.toLocaleString()}` : '-'}</td>
            <td>${escapeHtml(e.ref || '-')}</td>
            <td>${escapeHtml(txn)}</td>
            <td>${escapeHtml(String(when).slice(0, 10))}</td>
        </tr>`;
    }).join('') || '<tr><td colspan="6" class="empty">No ledger rows.</td></tr>';
}

async function openSupplierLedger(id) {
    showView('suppliers', { skipRefresh: true });
    await loadSuppliers();
    supLedgerId = String(id);
    const card = document.getElementById('supLedgerCard');
    if (!card) return;
    const row = suppliersCache.find((s) => String(s.id) === String(id));
    document.getElementById('supLedgerName').textContent = row
        ? `${row.name} · Due Amount Rs. ${Number(row.payable || 0).toLocaleString()}`
        : 'Supplier ledger';
    card.hidden = false;
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    supLedgerRows = await api.get(`/api/suppliers/${id}/ledger`);
    const list = Array.isArray(supLedgerRows) ? supLedgerRows : [];
    paintSupSummary(list, row && row.payable);
    paintSupBills(groupSupplierBills(list));
    paintSupLedgerRows(list);
}

function bindSupplierLedger() {
    const close = document.getElementById('supLedgerClose');
    if (!close || close.dataset.bound) return;
    close.dataset.bound = '1';
    close.addEventListener('click', hideSupLedger);
}
