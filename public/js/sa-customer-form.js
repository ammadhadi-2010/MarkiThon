function saCustFields() {
    return `<label>Name</label><input id="saFormCustName" autocomplete="off">
        <label>Phone</label><input id="saFormCustPhone" autocomplete="off">
        <label>City</label><input id="saFormCustCity" autocomplete="off">
        <label>Address</label><input id="saFormCustAddress" autocomplete="off">
        <label>Status</label><select id="saFormCustStatus"><option>Active</option><option>Inactive</option></select>`;
}

function saCustBody() {
    return {
        name: document.getElementById('saFormCustName').value,
        phone: document.getElementById('saFormCustPhone').value,
        city: document.getElementById('saFormCustCity').value,
        address: document.getElementById('saFormCustAddress').value,
        status: document.getElementById('saFormCustStatus').value
    };
}

function saCustCsv(value) {
    return '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"';
}

function saExportCustomers() {
    const lines = ['Name,Phone,City,Address,Orders,Spent,Status'];
    saCustShown.forEach((row) => {
        lines.push([row.name, row.phone, row.city, row.address, row.orders, row.spent, row.status].map(saCustCsv).join(','));
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
    link.download = 'customers.csv';
    link.click();
}

async function saCustSend(url, body) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    const note = document.getElementById('saFormNote');
    if (!response.ok) {
        if (note) note.textContent = data.message || 'Could not save the customer.';
        else saCustFlash = data.message || 'Could not save the customer.';
        if (!note) saPaintCustomers();
        return;
    }
    const modal = document.getElementById('saShopModal');
    if (modal) modal.remove();
    saCustFlash = data.message || 'Customer updated.';
    await saMountCustomers();
}

function saOpenCustForm() {
    saShopModal('Add Customer', saCustFields(),
        '<button type="button" id="saFormCancel">Cancel</button><button class="sa-add" type="submit">Save Customer</button>');
    document.getElementById('saFormCancel').addEventListener('click', () => document.getElementById('saShopModal').remove());
    document.querySelector('#saShopModal form').addEventListener('submit', (event) => {
        event.preventDefault();
        saCustSend('/api/admin/customers', saCustBody());
    });
}

function saOpenCustView(row) {
    const history = (row.history || []).map((item) =>
        `<div><span>${saText(item.number)}</span><strong>${saMoney(item.total)}</strong></div>`).join('')
        || '<div><span>Orders</span><strong>Not listed</strong></div>';
    const body = `<div class="sa-detail">
        <div><span>Name</span><strong>${saText(row.name)}</strong></div>
        <div><span>Phone</span><strong>${saText(row.phone || 'Not set')}</strong></div>
        <div><span>City</span><strong>${saText(row.city || 'Not set')}</strong></div>
        <div><span>Address</span><strong>${saText(row.address || 'Not set')}</strong></div>
        <div><span>Orders</span><strong>${saCount(row.orders)}</strong></div>
        <div><span>Spent</span><strong>${saMoney(row.spent)}</strong></div>
        ${history}
    </div>`;
    saShopModal(saText(row.name), body, '<button type="button" id="saFormCancel">Close</button>');
    document.getElementById('saFormCancel').addEventListener('click', () => document.getElementById('saShopModal').remove());
}

function saOpenCustMenu(id, button) {
    const old = document.getElementById('saCustMenu');
    if (old) old.remove();
    const menu = document.createElement('div');
    menu.id = 'saCustMenu';
    menu.className = 'sa-menu-pop';
    menu.innerHTML = `<button type="button" data-cust-view="${id}">View history</button>`
        + ['Active', 'Inactive'].map((status) =>
            `<button type="button" data-cust-status="${status}" data-cust-id="${id}">Mark ${status}</button>`).join('');
    const box = button.getBoundingClientRect();
    menu.style.top = (window.scrollY + box.bottom + 6) + 'px';
    menu.style.left = (window.scrollX + box.right - 160) + 'px';
    document.body.appendChild(menu);
}

document.addEventListener('click', (event) => {
    const add = event.target.closest('#saAddCustomer');
    const more = event.target.closest('[data-cust-more]');
    const view = event.target.closest('[data-cust-view]');
    const status = event.target.closest('[data-cust-status]');
    const page = event.target.closest('[data-cust-page]');
    if (add) saOpenCustForm();
    if (event.target.closest('#saExportCustomers')) saExportCustomers();
    if (more) saOpenCustMenu(more.dataset.custMore, more);
    if (view) {
        const row = saCustById(view.dataset.custView);
        const menu = document.getElementById('saCustMenu');
        if (menu) menu.remove();
        if (row) saOpenCustView(row);
    }
    if (page) { saCustPage = Number(page.dataset.custPage); saPaintCustomers(); }
    if (status) {
        const id = status.dataset.custId;
        document.getElementById('saCustMenu').remove();
        saCustSend('/api/admin/customers/' + encodeURIComponent(id), { status: status.dataset.custStatus });
    }
    if (!more && !event.target.closest('#saCustMenu')) {
        const menu = document.getElementById('saCustMenu');
        if (menu) menu.remove();
    }
});
