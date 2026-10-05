let saOrderRows = [];
let saOrderShown = [];
let saOrderPage = 1;
let saOrderFocus = false;
let saOrderFlash = '';
let saOrderQuery = '';
let saOrderStatus = 'All';
let saOrderShop = 'All';
let saOrderFrom = '';
let saOrderTo = '';
const SA_ORDER_SIZE = 6;
const SA_ORDER_PILLS = ['New', 'Processing', 'Completed', 'Cancelled'];
const SA_ORDER_COLORS = ['#2563eb', '#7c3aed', '#0891b2', '#db2777', '#ea580c', '#16a34a'];

function saOrderDay(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return date.getFullYear() + '-' + month + '-' + day;
}

function saOrderWhen(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return { day: 'Not set', time: '' };
    return {
        day: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };
}

function saOrderMatch(row) {
    const text = (row.number + ' ' + row.customer + ' ' + row.phone + ' ' + row.products).toLowerCase();
    if (saOrderQuery && !text.includes(saOrderQuery.toLowerCase())) return false;
    if (saOrderStatus !== 'All' && row.status !== saOrderStatus && row.label !== saOrderStatus) return false;
    if (saOrderShop !== 'All' && row.shop !== saOrderShop) return false;
    const day = saOrderDay(row.createdAt);
    if (saOrderFrom && day < saOrderFrom) return false;
    if (saOrderTo && day > saOrderTo) return false;
    return true;
}

function saOrderCards(rows) {
    const count = (status) => rows.filter((row) => row.status === status).length;
    const cart = saSvg('<circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M3 4h2l2.2 10h10.2l2-7H7"/>');
    const clock = saSvg('<circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/>');
    const gear = saSvg('<circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/>');
    const check = saSvg('<circle cx="12" cy="12" r="8"/><path d="M8 12l2.5 2.5L16 9"/>');
    const stop = saSvg('<circle cx="12" cy="12" r="8"/><path d="M9 9l6 6M15 9l-6 6"/>');
    const cards = [
        ['blue', cart, 'Total Orders', rows.length, 'up'],
        ['purple', clock, 'New Orders', count('New'), 'down'],
        ['orange', gear, 'Processing', count('Processing'), 'up'],
        ['green', check, 'Completed', count('Completed'), 'up'],
        ['pink', stop, 'Cancelled', count('Cancelled'), 'down']
    ];
    return `<div class="sa-shop-stats sa-order-stats">${cards.map(([tone, icon, label, value, trend]) =>
        `<article class="sa-card sa-stat sa-tone-${tone}"><div class="sa-stat-top"><span class="sa-ico">${icon}</span><span>${label}</span></div><strong>${saCount(value)}</strong><div class="sa-trend">${trend === 'down' ? '<span class="sa-down">↓</span>' : '<span class="sa-up">↑</span>'}</div></article>`
    ).join('')}</div>`;
}

function saOrderPills(rows) {
    const items = [['All', 'All Orders', rows.length]].concat(SA_ORDER_PILLS.map((name) => [name, name, rows.filter((row) => row.status === name).length]));
    return `<div class="sa-pills">${items.map(([value, label, total]) =>
        `<button class="sa-pill-btn${value === saOrderStatus ? ' is-on' : ''}" type="button" data-order-pill="${value}">${label} ${saCount(total)}</button>`
    ).join('')}</div>`;
}

function saOrderRow(row, index) {
    const when = saOrderWhen(row.createdAt);
    const color = SA_ORDER_COLORS[index % SA_ORDER_COLORS.length];
    const bag = saSvg('<path d="M6 8h12l-1 11H7L6 8z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/>');
    return `<tr>
        <td>${index + 1}</td>
        <td><div class="sa-order-id"><span class="sa-order-mark" style="background:${color}">${bag}</span><strong>${saText(row.number)}</strong></div></td>
        <td><div class="sa-order-who"><span class="sa-order-ava" style="background:${color}">${saShopInitials(row.customer)}</span><span><strong>${saText(row.customer)}</strong><small>${saText(row.phone || 'Not set')}</small></span></div></td>
        <td>${saText(row.shop)}</td>
        <td>${saMoney(row.total)}</td>
        <td>${saStatus(row.label)}</td>
        <td><strong>${when.day}</strong><small>${when.time}</small></td>
        <td><div class="sa-actions">
            <button class="sa-order-view" type="button" data-order-view="${row.id}">View</button>
            <button type="button" data-order-more="${row.id}" aria-label="More options">${saSvg('<circle cx="6" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18" cy="12" r="1.2" fill="currentColor"/>')}</button>
        </div></td>
    </tr>`;
}

function saOrderPager(total) {
    const pages = Math.max(1, Math.ceil(total / SA_ORDER_SIZE));
    if (saOrderPage > pages) saOrderPage = pages;
    const start = total ? (saOrderPage - 1) * SA_ORDER_SIZE + 1 : 0;
    const end = Math.min(total, saOrderPage * SA_ORDER_SIZE);
    const buttons = Array.from({ length: pages }, (_, index) => {
        const page = index + 1;
        return `<button class="sa-page-btn${page === saOrderPage ? ' is-on' : ''}" type="button" data-order-page="${page}">${page}</button>`;
    }).join('');
    return `<div class="sa-pager"><span class="sa-muted">Showing ${start} – ${end} of ${total} orders</span><div>${buttons}</div></div>`;
}

function saPaintOrders() {
    saOrderShown = saOrderRows.filter(saOrderMatch);
    const shops = [...new Set(saOrderRows.map((row) => row.shop))].sort();
    const slice = saOrderShown.slice((saOrderPage - 1) * SA_ORDER_SIZE, saOrderPage * SA_ORDER_SIZE);
    const mark = saSvg('<circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M3 4h2l2.2 10h10.2l2-7H7"/>');
    const search = saSvg('<circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/>');
    document.getElementById('saOrders').innerHTML = `
        <div class="sa-shop-head">
            <div class="sa-shop-title"><div class="sa-shop-mark">${mark}</div><div><h1>Orders</h1><p class="sa-muted">Manage all marketplace orders and track their progress.</p></div></div>
            <div class="sa-order-actions"><button class="sa-export" id="saExportOrders" type="button">Export Orders</button><button class="sa-add" id="saAddOrder" type="button">+ New Order</button></div>
        </div>
        ${saOrderCards(saOrderRows)}
        ${saOrderPills(saOrderRows)}
        <div class="sa-shop-tools">
            <label class="sa-shop-search-wrap">${search}<input class="sa-shop-search" id="saOrderQuery" type="search" placeholder="Search by order ID, customer, or product..." autocomplete="off" value="${saText(saOrderQuery)}"></label>
            <select id="saOrderShop">${saShopOptions([['All', 'All Shops']].concat(shops.map((name) => [name, name])), saOrderShop)}</select>
            <label class="sa-order-dates"><input id="saOrderFrom" type="date" autocomplete="off" value="${saText(saOrderFrom)}" aria-label="From date"><span>–</span><input id="saOrderTo" type="date" autocomplete="off" value="${saText(saOrderTo)}" aria-label="To date"></label>
        </div>
        <section class="sa-card sa-shop-board"><div class="sa-scroll"><table class="sa-table sa-shop-table sa-order-table">
            <thead><tr><th>#</th><th>Order ID</th><th>Customer</th><th>Shop</th><th>Total Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>${slice.map((row, index) => saOrderRow(row, (saOrderPage - 1) * SA_ORDER_SIZE + index)).join('') || '<tr><td colspan="8">No orders match these filters.</td></tr>'}</tbody>
        </table></div>${saOrderPager(saOrderShown.length)}</section>
        <p class="sa-note-line" id="saOrderNote">${saText(saOrderFlash)}</p>
        <p class="sa-muted">Status changes stay in this admin list. Shop bills are not changed.</p>`;
    saOrderFlash = '';
    document.getElementById('saOrderQuery').addEventListener('input', (event) => {
        saOrderQuery = event.target.value;
        saOrderPage = 1;
        saOrderFocus = true;
        saPaintOrders();
    });
    document.getElementById('saOrderShop').addEventListener('change', (event) => { saOrderShop = event.target.value; saOrderPage = 1; saPaintOrders(); });
    document.getElementById('saOrderFrom').addEventListener('change', (event) => { saOrderFrom = event.target.value; saOrderPage = 1; saPaintOrders(); });
    document.getElementById('saOrderTo').addEventListener('change', (event) => { saOrderTo = event.target.value; saOrderPage = 1; saPaintOrders(); });
    if (saOrderFocus) {
        const box = document.getElementById('saOrderQuery');
        box.focus();
        box.setSelectionRange(box.value.length, box.value.length);
        saOrderFocus = false;
    }
}

async function saMountOrders() {
    const response = await fetch('/api/admin/orders');
    const data = await response.json();
    saOrderRows = data.orders || [];
    saPaintOrders();
}

function saOrderById(id) {
    return saOrderRows.find((row) => row.id === id);
}
