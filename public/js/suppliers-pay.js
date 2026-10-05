function todayInputDateValue() {
    return new Date().toISOString().slice(0, 10);
}

function paySupplierRows() {
    return (suppliersCache || []).filter((s) => s.status !== 'Inactive');
}

function selectedQuickSupplier() {
    const id = document.getElementById('supQuickSupplier')?.value;
    return (suppliersCache || []).find((s) => String(s.id) === String(id)) || null;
}

function remainingPayCap() {
    const due = Number((selectedQuickSupplier() || {}).payable || 0);
    const billDue = Number(document.getElementById('supQuickRef')?.dataset.due || due);
    return Math.min(due, billDue);
}

function paintQuickPayDue() {
    const el = document.getElementById('supQuickDue');
    if (!el) return;
    const due = Number((selectedQuickSupplier() || {}).payable || 0);
    const amt = Number(document.getElementById('supQuickAmt')?.value) || 0;
    const after = Math.max(due - amt, 0);
    if (!due) {
        el.textContent = 'Ledger balance due: Rs. 0';
        return;
    }
    el.textContent = `Ledger balance due: Rs. ${due.toLocaleString()} now · Rs. ${after.toLocaleString()} after this payment`;
}

function applyPayStatusAmount() {
    const status = document.getElementById('supQuickStatus')?.value;
    const amt = document.getElementById('supQuickAmt');
    if (!amt || status !== 'full') return;
    const cap = remainingPayCap();
    amt.value = cap > 0 ? String(cap) : '';
    paintQuickPayDue();
}

function fillQuickPaySuppliers(selectedId) {
    const sel = document.getElementById('supQuickSupplier');
    if (!sel) return;
    const rows = paySupplierRows();
    const keep = selectedId || sel.value;
    sel.innerHTML = '<option value="">Select supplier</option>' + rows.map((s) =>
        `<option value="${s.id}">${escapeHtml(s.name)} · due Rs. ${Number(s.payable || 0).toLocaleString()}</option>`
    ).join('');
    if (keep && rows.some((s) => String(s.id) === String(keep))) sel.value = String(keep);
    paintQuickPayDue();
}

async function loadQuickPayBills() {
    const hint = document.getElementById('supQuickBillHint');
    const refEl = document.getElementById('supQuickRef');
    const row = selectedQuickSupplier();
    if (refEl) {
        refEl.value = '';
        refEl.dataset.due = '0';
    }
    if (!row) {
        if (hint) hint.textContent = '';
        paintQuickPayDue();
        return;
    }
    const data = await api.get(`/api/suppliers/${row.id}/ledger`);
    const bills = (typeof groupSupplierBills === 'function' ? groupSupplierBills(data) : [])
        .filter((b) => b.due > 0.009);
    const bill = bills[0];
    if (refEl) {
        refEl.value = bill ? bill.ref : '';
        refEl.dataset.due = bill ? String(bill.due) : '0';
    }
    if (hint) {
        hint.textContent = bill
            ? `Applies to voucher ${bill.ref} (bill due Rs. ${bill.due.toLocaleString()}).`
            : 'No open voucher for this supplier.';
    }
    applyPayStatusAmount();
    paintQuickPayDue();
}

function resetQuickPayProof() {
    const file = document.getElementById('supQuickFile');
    const hidden = document.getElementById('supQuickProof');
    if (file) file.value = '';
    if (hidden) hidden.value = '';
    if (typeof setRecvProofPreview === 'function') {
        setRecvProofPreview('supQuickPrev', 'supQuickHint', '');
    }
}

async function saveQuickSupplierPay(event) {
    event.preventDefault();
    const row = selectedQuickSupplier();
    if (!row) return showToast('Select a supplier.');
    const ref = document.getElementById('supQuickRef')?.value;
    if (!ref) return showToast('This supplier has no open voucher balance.');
    const amount = Number(document.getElementById('supQuickAmt')?.value) || 0;
    if (amount <= 0) return showToast('Enter the amount paid now.');
    const cap = remainingPayCap();
    if (amount - cap > 0.009) {
        return showToast(`Amount cannot exceed remaining Rs. ${cap.toLocaleString()}.`);
    }
    const data = await api.post(`/api/suppliers/${row.id}/payments`, {
        amount,
        method: document.getElementById('supQuickMethod').value,
        ref,
        entryDate: document.getElementById('supQuickDate').value || todayInputDateValue(),
        paymentProof: document.getElementById('supQuickProof').value,
        note: `Installment on ${ref}`
    });
    showToast(data.message);
    document.getElementById('supQuickAmt').value = '';
    document.getElementById('supQuickStatus').value = 'partial';
    resetQuickPayProof();
    await loadSuppliers();
    if (typeof loadQuickPayBills === 'function') await loadQuickPayBills();
    if (typeof refreshRecvVouchers === 'function') await refreshRecvVouchers();
    if (typeof loadRpSuppliers === 'function' && document.getElementById('rpBody')) {
        await loadRpSuppliers();
    }
    if (typeof openSupplierLedger === 'function' && document.getElementById('supLedgerCard')
        && !document.getElementById('supLedgerCard').hidden) {
        await openSupplierLedger(row.id);
    }
}

function bindQuickSupplierPay() {
    const form = document.getElementById('supQuickPayForm');
    if (!form || form.dataset.bound) return;
    form.dataset.bound = '1';
    const date = document.getElementById('supQuickDate');
    if (date) date.value = todayInputDateValue();
    document.getElementById('supQuickSupplier').addEventListener('change', () => {
        loadQuickPayBills().catch((err) => showToast(err.message));
    });
    document.getElementById('supQuickStatus').addEventListener('change', applyPayStatusAmount);
    const amt = document.getElementById('supQuickAmt');
    amt.addEventListener('focus', () => {
        if (amt.value === '' || amt.value === '0' || Number(amt.value) === 0) amt.value = '';
        else amt.select();
    });
    amt.addEventListener('blur', () => {
        if (String(amt.value).trim() === '') amt.value = '';
        paintQuickPayDue();
    });
    amt.addEventListener('input', paintQuickPayDue);
    form.addEventListener('submit', (e) => {
        saveQuickSupplierPay(e).catch((err) => showToast(err.message));
    });
    const file = document.getElementById('supQuickFile');
    file.addEventListener('change', (e) => {
        const picked = e.target.files && e.target.files[0];
        if (!picked || typeof compressInvImage !== 'function') return;
        compressInvImage(picked).then((dataUrl) => {
            document.getElementById('supQuickProof').value = dataUrl;
            if (typeof setRecvProofPreview === 'function') {
                setRecvProofPreview('supQuickPrev', 'supQuickHint', dataUrl);
            }
        }).catch((error) => showToast(error.message));
    });
}
