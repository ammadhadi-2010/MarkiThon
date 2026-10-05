function saOrderFields() {
    return `<label>Customer</label><input id="saFormCustomer" autocomplete="off">
        <label>Phone</label><input id="saFormPhone" autocomplete="off">
        <label>Shop</label><input id="saFormShop" autocomplete="off" value="Ammad Hadi Stor">
        <label>Total</label><input id="saFormTotal" type="number" min="0" autocomplete="off">
        <label>Status</label><select id="saFormStatus"><option>New</option><option>Processing</option><option>Confirmed</option><option value="Dispatched">Shipped</option><option>Completed</option><option>Cancelled</option></select>
        <label>Note</label><input id="saFormNoteText" autocomplete="off">`;
}

function saOrderBody() {
    return {
        customer: document.getElementById('saFormCustomer').value,
        phone: document.getElementById('saFormPhone').value,
        shop: document.getElementById('saFormShop').value,
        total: document.getElementById('saFormTotal').value,
        status: document.getElementById('saFormStatus').value,
        note: document.getElementById('saFormNoteText').value
    };
}

function saCsv(value) {
    const text = String(value == null ? '' : value).replace(/"/g, '""');
    return '"' + text + '"';
}

function saExportOrders() {
    const lines = ['Order,Customer,Phone,Shop,Total,Status,Date'];
    saOrderShown.forEach((row) => {
        lines.push([row.number, row.customer, row.phone, row.shop, row.total, row.label, row.createdAt].map(saCsv).join(','));
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
    link.download = 'orders.csv';
    link.click();
}

async function saOrderSend(url, body) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    const note = document.getElementById('saFormNote');
    if (!response.ok) {
        if (note) note.textContent = data.message || 'Could not save the order.';
        else saOrderFlash = data.message || 'Could not save the order.';
        if (!note) saPaintOrders();
        return;
    }
    const modal = document.getElementById('saShopModal');
    if (modal) modal.remove();
    saOrderFlash = data.message || 'Order updated.';
    await saMountOrders();
}

function saOpenOrderForm() {
    saShopModal('New Order', saOrderFields(),
        '<button type="button" id="saFormCancel">Cancel</button><button class="sa-add" type="submit">Save Order</button>');
    document.getElementById('saFormCancel').addEventListener('click', () => document.getElementById('saShopModal').remove());
    document.querySelector('#saShopModal form').addEventListener('submit', (event) => {
        event.preventDefault();
        saOrderSend('/api/admin/orders', saOrderBody());
    });
}

function saOpenOrderView(row) {
    const items = (row.items || []).map((item) => `<div><span>${saText(item.title)}</span><strong>${saText(item.qty)}</strong></div>`).join('')
        || '<div><span>Items</span><strong>Not listed</strong></div>';
    const body = `<div class="sa-detail">
        <div><span>Order</span><strong>${saText(row.number)}</strong></div>
        <div><span>Customer</span><strong>${saText(row.customer)}</strong></div>
        <div><span>Phone</span><strong>${saText(row.phone || 'Not set')}</strong></div>
        <div><span>Shop</span><strong>${saText(row.shop)}</strong></div>
        <div><span>Total</span><strong>${saMoney(row.total)}</strong></div>
        <div><span>Status</span><strong>${saText(row.label)}</strong></div>
        <div><span>Note</span><strong>${saText(row.note || 'Not set')}</strong></div>
        ${items}
    </div>`;
    saShopModal('Order ' + saText(row.number), body, '<button type="button" id="saFormCancel">Close</button>');
    document.getElementById('saFormCancel').addEventListener('click', () => document.getElementById('saShopModal').remove());
}

function saOpenOrderMenu(id, button) {
    const old = document.getElementById('saOrderMenu');
    if (old) old.remove();
    const menu = document.createElement('div');
    menu.id = 'saOrderMenu';
    menu.className = 'sa-menu-pop';
    const choices = [['New', 'New'], ['Processing', 'Processing'], ['Confirmed', 'Confirmed'], ['Dispatched', 'Shipped'], ['Completed', 'Completed'], ['Cancelled', 'Cancelled']];
    menu.innerHTML = choices.map(([status, label]) =>
        `<button type="button" data-order-status="${status}" data-order-id="${id}">Mark ${label}</button>`).join('');
    const box = button.getBoundingClientRect();
    menu.style.top = (window.scrollY + box.bottom + 6) + 'px';
    menu.style.left = (window.scrollX + box.right - 160) + 'px';
    document.body.appendChild(menu);
}

document.addEventListener('click', (event) => {
    const add = event.target.closest('#saAddOrder');
    const view = event.target.closest('[data-order-view]');
    const more = event.target.closest('[data-order-more]');
    const pill = event.target.closest('[data-order-pill]');
    const page = event.target.closest('[data-order-page]');
    const status = event.target.closest('[data-order-status]');
    if (add) saOpenOrderForm();
    if (event.target.closest('#saExportOrders')) saExportOrders();
    if (view) {
        const row = saOrderById(view.dataset.orderView);
        if (row) saOpenOrderView(row);
    }
    if (more) saOpenOrderMenu(more.dataset.orderMore, more);
    if (pill) { saOrderStatus = pill.dataset.orderPill; saOrderPage = 1; saPaintOrders(); }
    if (page) { saOrderPage = Number(page.dataset.orderPage); saPaintOrders(); }
    if (status) {
        const id = status.dataset.orderId;
        document.getElementById('saOrderMenu').remove();
        saOrderSend('/api/admin/orders/' + encodeURIComponent(id), { status: status.dataset.orderStatus });
    }
    if (!more && !event.target.closest('#saOrderMenu')) {
        const menu = document.getElementById('saOrderMenu');
        if (menu) menu.remove();
    }
});
