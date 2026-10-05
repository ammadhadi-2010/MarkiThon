function renderInvSupplierList() {
    const tbody = document.getElementById('invSupTable');
    const empty = document.getElementById('invSupEmpty');
    if (!tbody) return;
    const q = (document.getElementById('invSupSearch')?.value || '').toLowerCase().trim();
    const rows = (suppliersCache || []).filter((s) => {
        if (!q) return true;
        return [s.name, s.phone, s.email, s.contactPerson]
            .some((v) => String(v || '').toLowerCase().includes(q));
    });
    if (empty) empty.style.display = rows.length ? 'none' : 'block';
    tbody.innerHTML = rows.map((s) => {
        const due = Number(s.payable || 0);
        const extra = `<button type="button" data-id="${s.id}" data-act="view">View Details</button>`;
        return `<tr>
            <td>${escapeHtml(s.name)}</td>
            <td>${escapeHtml(s.phone)}</td>
            <td class="${due > 0 ? 'sup-due' : ''}">Rs. ${due.toLocaleString()}</td>
            <td class="col-actions">${actionMenuHtml(s.id, extra, {
                editLabel: 'Edit Supplier',
                deleteLabel: 'Delete Supplier'
            })}</td>
        </tr>`;
    }).join('');
}

function closeInvSupplierDetails() {
    const modal = document.getElementById('invSupDetailModal');
    if (modal) modal.hidden = true;
}

async function openInvSupplierDetails(id) {
    const row = (suppliersCache || []).find((s) => String(s.id) === String(id));
    const modal = document.getElementById('invSupDetailModal');
    if (!row || !modal) return;
    document.getElementById('invSupDetailTitle').textContent = row.name || 'Supplier Details';
    document.getElementById('invSupDetailContact').textContent = [
        row.contactPerson && `Contact: ${row.contactPerson}`,
        row.phone && `Phone: ${row.phone}`,
        row.email && `Email: ${row.email}`,
        row.address && `Address: ${row.address}`,
        `Status: ${row.status || 'Active'}`
    ].filter(Boolean).join(' · ');
    modal.dataset.id = String(row.id);
    const list = await api.get(`/api/suppliers/${row.id}/ledger`);
    const rows = Array.isArray(list) ? list : [];
    const purchase = rows.filter((e) => e.type === 'PURCHASE')
        .reduce((s, e) => s + Number(e.amount || 0), 0);
    const paid = rows.filter((e) => e.type === 'PAYMENT')
        .reduce((s, e) => s + Number(e.amount || 0), 0);
    const due = Number(row.payable != null ? row.payable : purchase - paid);
    const set = (elId, value) => {
        const el = document.getElementById(elId);
        if (el) el.textContent = `Rs. ${Number(value || 0).toLocaleString()}`;
    };
    set('invSupStatPurchase', purchase);
    set('invSupStatPaid', paid);
    set('invSupStatDue', Math.max(due, 0));
    modal.hidden = false;
}

async function removeInvSupplier(id) {
    if (!confirm('Delete this supplier?')) return;
    const data = await api.del(`/api/suppliers/${id}`);
    showToast(data.message);
    closeInvSupplierDetails();
    resetInvAddSupplierForm();
    await loadSuppliers();
}

function bindInvSupplierList() {
    const table = document.getElementById('invSupTable');
    const search = document.getElementById('invSupSearch');
    if (!table || table.dataset.bound) return;
    table.dataset.bound = '1';
    if (search) search.addEventListener('input', renderInvSupplierList);
    document.getElementById('globalSearch')?.addEventListener('input', (e) => {
        const panel = document.getElementById('invSupplierPanel');
        if (!panel || panel.hidden) return;
        if (search) search.value = e.target.value;
        renderInvSupplierList();
    });
    table.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-act]');
        if (!btn) return;
        const row = (suppliersCache || []).find((s) => String(s.id) === String(btn.dataset.id));
        if (btn.dataset.act === 'view') {
            openInvSupplierDetails(btn.dataset.id).catch((err) => showToast(err.message));
        }
        if (btn.dataset.act === 'edit' && row) fillInvAddSupplierForm(row);
        if (btn.dataset.act === 'delete') {
            removeInvSupplier(btn.dataset.id).catch((err) => showToast(err.message));
        }
    });
    document.getElementById('invSupDetailClose')?.addEventListener('click', closeInvSupplierDetails);
    document.getElementById('invSupDetailEdit')?.addEventListener('click', () => {
        const id = document.getElementById('invSupDetailModal')?.dataset.id;
        const row = (suppliersCache || []).find((s) => String(s.id) === String(id));
        closeInvSupplierDetails();
        if (row) fillInvAddSupplierForm(row);
    });
}
