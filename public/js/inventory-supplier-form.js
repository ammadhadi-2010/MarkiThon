function invAddSupplierMarkup() {
    return `
    <div id="invSupplierPanel" hidden>
    <div class="inv-sup-split">
        <div class="card" id="invAddSupplierCard">
            <div class="card-title">Add Supplier</div>
            <p class="wl-hint">Register a mill here. Record installment payments on the Suppliers page.</p>
            <form id="invAddSupplierForm" autocomplete="off">
                <input id="invSupEditId" name="invSupEditId" type="hidden" autocomplete="off">
                <div class="field"><label for="invSupName">Supplier Name</label>
                    <input id="invSupName" name="invSupName" required placeholder="Ammad Hadi Stor" autocomplete="off"></div>
                <div class="field"><label for="invSupContact">Contact Person</label>
                    <input id="invSupContact" name="invSupContact" placeholder="Ammad Hadi" autocomplete="off"></div>
                <div class="field"><label for="invSupPhone">Phone</label>
                    <input id="invSupPhone" name="invSupPhone" required placeholder="0300-1234567" autocomplete="off"></div>
                <div class="field"><label for="invSupEmail">Email</label>
                    <input id="invSupEmail" name="invSupEmail" type="email" placeholder="ammad@hadistor.pk" autocomplete="off"></div>
                <div class="field"><label for="invSupAddress">Address</label>
                    <input id="invSupAddress" name="invSupAddress" placeholder="Lahore, Pakistan" autocomplete="off"></div>
                <div class="actions">
                    <button type="button" class="ghost" id="invSupCancel">Cancel</button>
                    <button type="submit" class="primary">Save Supplier</button>
                </div>
            </form>
        </div>
        <div class="card" id="invSupplierListCard">
            <div class="card-title">Supplier Details / List</div>
            <div class="list-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>
                <input id="invSupSearch" name="invSupSearch" type="text" placeholder="Search supplier..." autocomplete="off">
            </div>
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Supplier Name</th>
                            <th>Phone</th>
                            <th>Balance Due</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="invSupTable"></tbody>
                </table>
            </div>
            <div id="invSupEmpty" class="empty">No suppliers yet. Save a mill to see it here.</div>
        </div>
    </div>
    <div id="invSupDetailModal" class="share-modal" hidden>
        <div class="share-card">
            <h3 id="invSupDetailTitle">Supplier Details</h3>
            <p id="invSupDetailContact" class="share-sub"></p>
            <div class="sup-ledger-stats">
                <div class="sup-stat"><span>Total purchase</span><strong id="invSupStatPurchase">Rs. 0</strong></div>
                <div class="sup-stat"><span>Paid</span><strong id="invSupStatPaid">Rs. 0</strong></div>
                <div class="sup-stat due"><span>Balance due</span><strong id="invSupStatDue">Rs. 0</strong></div>
            </div>
            <button type="button" class="primary" id="invSupDetailEdit">Edit Supplier</button>
            <button type="button" class="ghost" id="invSupDetailClose">Close</button>
        </div>
    </div>
    </div>`;
}

function setInvPageMode(mode) {
    const supplier = mode === 'supplier';
    const catalog = document.getElementById('catalogWrap');
    const table = document.getElementById('invCatalogTableCard');
    const panel = document.getElementById('invSupplierPanel');
    if (catalog) catalog.hidden = supplier;
    if (table) table.hidden = supplier;
    if (panel) panel.hidden = !supplier;
    document.querySelectorAll('#invQuickActions [data-invquick]').forEach((btn) => {
        const on = supplier ? 'supplier' : 'product';
        btn.classList.toggle('active', btn.dataset.invquick === on);
    });
    const search = document.getElementById('globalSearch');
    if (search) search.placeholder = supplier ? 'Search suppliers...' : 'Search products...';
}

function resetInvAddSupplierForm() {
    document.getElementById('invAddSupplierForm')?.reset();
    const idEl = document.getElementById('invSupEditId');
    if (idEl) idEl.value = '';
}

function fillInvAddSupplierForm(row) {
    document.getElementById('invSupEditId').value = row.id;
    document.getElementById('invSupName').value = row.name || '';
    document.getElementById('invSupContact').value = row.contactPerson || '';
    document.getElementById('invSupPhone').value = row.phone || '';
    document.getElementById('invSupEmail').value = row.email || '';
    document.getElementById('invSupAddress').value = row.address || '';
    document.getElementById('invSupName')?.focus();
}

function focusInvAddSupplier() {
    if (typeof showView === 'function') {
        showView('inventory', { invMode: 'supplier', skipRefresh: true });
    }
    setInvPageMode('supplier');
    if (typeof loadSuppliers === 'function') {
        loadSuppliers().catch((err) => showToast(err.message));
    }
    document.getElementById('invSupName')?.focus();
}

async function saveInvAddSupplier(event) {
    event.preventDefault();
    const id = document.getElementById('invSupEditId').value;
    const payload = {
        name: document.getElementById('invSupName').value,
        contactPerson: document.getElementById('invSupContact').value,
        phone: document.getElementById('invSupPhone').value,
        email: document.getElementById('invSupEmail').value,
        address: document.getElementById('invSupAddress').value
    };
    const data = id
        ? await api.put(`/api/suppliers/${id}`, payload)
        : await api.post('/api/suppliers/add', payload);
    showToast(data.message);
    resetInvAddSupplierForm();
    if (typeof loadSuppliers === 'function') await loadSuppliers();
}

function bindInvAddSupplier() {
    const form = document.getElementById('invAddSupplierForm');
    if (!form || form.dataset.bound) return;
    form.dataset.bound = '1';
    form.addEventListener('submit', (e) => {
        saveInvAddSupplier(e).catch((err) => showToast(err.message));
    });
    document.getElementById('invSupCancel')?.addEventListener('click', resetInvAddSupplierForm);
    if (typeof bindInvSupplierList === 'function') bindInvSupplierList();
}
