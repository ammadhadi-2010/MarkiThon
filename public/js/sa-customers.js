let saCustRows = [];
let saCustShown = [];
let saCustPage = 1;
let saCustFocus = false;
let saCustFlash = '';
let saCustQuery = '';
let saCustStatus = 'All';
let saCustCity = 'All';
const SA_CUST_SIZE = 8;
const SA_CUST_COLORS = ['#2563eb', '#7c3aed', '#0891b2', '#db2777', '#ea580c', '#16a34a'];

function saCustMatch(row) {
    const text = (row.name + ' ' + row.phone + ' ' + row.address + ' ' + row.city).toLowerCase();
    if (saCustQuery && !text.includes(saCustQuery.toLowerCase())) return false;
    if (saCustStatus !== 'All' && row.status !== saCustStatus) return false;
    if (saCustCity !== 'All' && (row.city || 'Not set') !== saCustCity) return false;
    return true;
}

function saCustCards(rows) {
    const active = rows.filter((row) => row.status === 'Active').length;
    const fresh = rows.filter((row) => row.fresh).length;
    const spent = rows.reduce((sum, row) => sum + (Number(row.spent) || 0), 0);
    const people = saSvg('<circle cx="9" cy="8" r="3"/><circle cx="16" cy="9" r="2.4"/><path d="M3.5 18c.6-3 2.8-4.5 5.5-4.5S14 15 14.6 18"/><path d="M14 13.6c1.6-.4 3.2.2 4.2 1.6.6.9.8 1.8.8 2.8"/>');
    const user = saSvg('<circle cx="12" cy="8" r="3"/><path d="M5 19c.8-3.2 3.2-5 7-5s6.2 1.8 7 5"/>');
    const star = saSvg('<path d="M12 3l2.2 4.6L19 8.4l-3.5 3.4.8 4.8L12 14.2 7.7 16.6l.8-4.8L5 8.4l4.8-.8L12 3z"/>');
    const coin = saSvg('<circle cx="12" cy="12" r="8"/><path d="M12 7v10M9.5 9.5c.6-.8 1.5-1.2 2.5-1.2 1.6 0 2.5.8 2.5 2s-.9 1.8-2.5 2-2.5.8-2.5 2 1 2 2.5 2c1 0 1.9-.4 2.5-1.2"/>');
    const cards = [
        ['blue', people, 'Total Customers', saCount(rows.length), 'up'],
        ['green', user, 'Active Customers', saCount(active), 'up'],
        ['purple', star, 'New Customers', saCount(fresh), 'up'],
        ['orange', coin, 'Total Spent', saMoney(spent), 'up']
    ];
    return `<div class="sa-shop-stats">${cards.map(([tone, icon, label, value, trend]) =>
        `<article class="sa-card sa-stat sa-tone-${tone}"><div class="sa-stat-top"><span class="sa-ico">${icon}</span><span>${label}</span></div><strong>${value}</strong><div class="sa-trend"><span class="sa-${trend === 'down' ? 'down' : 'up'}">${trend === 'down' ? '↓' : '↑'}</span></div></article>`
    ).join('')}</div>`;
}

function saCustRow(row, index) {
    const color = SA_CUST_COLORS[index % SA_CUST_COLORS.length];
    const wa = saShopWa(row.phone);
    const tel = wa ? 'tel:+' + wa.split('wa.me/')[1] : '';
    const link = wa ? `<a class="sa-wa" href="${wa}" target="_blank" rel="noopener" aria-label="WhatsApp">${saSvg('<path d="M8 5h8a2 2 0 0 1 2 2v8l-3-2H8a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/>')}</a>` : '';
    const call = tel ? `<a class="sa-call" href="${tel}" aria-label="Call">${saSvg('<path d="M7 4h3l1 4-2 1a12 12 0 0 0 6 6l1-2 4 1v3a2 2 0 0 1-2 2A16 16 0 0 1 5 6a2 2 0 0 1 2-2z"/>')}</a>` : '';
    const more = saSvg('<circle cx="6" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18" cy="12" r="1.2" fill="currentColor"/>');
    return `<tr>
        <td>${index + 1}</td>
        <td><div class="sa-order-who"><span class="sa-order-ava" style="background:${color}">${saShopInitials(row.name)}</span><strong>${saText(row.name)}</strong></div></td>
        <td><span class="sa-contact">${saText(row.phone || 'Not set')} ${link}</span></td>
        <td>${saText(row.city || 'Not set')}</td>
        <td>${saCount(row.orders)}</td>
        <td>${saMoney(row.spent)}</td>
        <td>${saStatus(row.status)}</td>
        <td><div class="sa-actions">${call}${link}<button type="button" data-cust-more="${row.id}" aria-label="More options">${more}</button></div></td>
    </tr>`;
}

function saCustPager(total) {
    const pages = Math.max(1, Math.ceil(total / SA_CUST_SIZE));
    if (saCustPage > pages) saCustPage = pages;
    const start = total ? (saCustPage - 1) * SA_CUST_SIZE + 1 : 0;
    const end = Math.min(total, saCustPage * SA_CUST_SIZE);
    const want = [1, pages, saCustPage - 1, saCustPage, saCustPage + 1]
        .filter((page, index, list) => page >= 1 && page <= pages && list.indexOf(page) === index)
        .sort((a, b) => a - b);
    let prev = 0;
    const buttons = want.map((page) => {
        const gap = prev && page - prev > 1 ? '<span class="sa-muted">…</span>' : '';
        prev = page;
        return gap + `<button class="sa-page-btn${page === saCustPage ? ' is-on' : ''}" type="button" data-cust-page="${page}">${page}</button>`;
    }).join('');
    return `<div class="sa-pager"><span class="sa-muted">Showing ${start} – ${end} of ${total} customers</span><div>${buttons}</div></div>`;
}

function saPaintCustomers() {
    saCustShown = saCustRows.filter(saCustMatch);
    const cities = [...new Set(saCustRows.map((row) => row.city || 'Not set'))].sort();
    const slice = saCustShown.slice((saCustPage - 1) * SA_CUST_SIZE, saCustPage * SA_CUST_SIZE);
    const mark = saSvg('<circle cx="9" cy="8" r="3"/><circle cx="16" cy="9" r="2.4"/><path d="M3.5 18c.6-3 2.8-4.5 5.5-4.5S14 15 14.6 18"/>');
    const search = saSvg('<circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/>');
    document.getElementById('saCustomers').innerHTML = `
        <div class="sa-shop-head">
            <div class="sa-shop-title"><div class="sa-shop-mark">${mark}</div><div><h1>Customers</h1><p class="sa-muted">Manage your customers and their purchase history.</p></div></div>
            <div class="sa-order-actions"><button class="sa-export" id="saExportCustomers" type="button">Export Customers</button><button class="sa-add" id="saAddCustomer" type="button">+ Add Customer</button></div>
        </div>
        ${saCustCards(saCustRows)}
        <div class="sa-shop-tools">
            <label class="sa-shop-search-wrap">${search}<input class="sa-shop-search" id="saCustQuery" type="search" placeholder="Search by name, phone, or address..." autocomplete="off" value="${saText(saCustQuery)}"></label>
            <select id="saCustStatus">${saShopOptions([['All', 'All Customers'], ['Active', 'Active'], ['Inactive', 'Inactive']], saCustStatus)}</select>
            <select id="saCustCity">${saShopOptions([['All', 'All Cities']].concat(cities.map((name) => [name, name])), saCustCity)}</select>
        </div>
        <section class="sa-card sa-shop-board"><div class="sa-scroll"><table class="sa-table sa-shop-table sa-cust-table">
            <thead><tr><th>#</th><th>Customer</th><th>Phone / WhatsApp</th><th>City</th><th>Total Orders</th><th>Total Spent</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>${slice.map((row, index) => saCustRow(row, (saCustPage - 1) * SA_CUST_SIZE + index)).join('') || '<tr><td colspan="8">No customers match these filters.</td></tr>'}</tbody>
        </table></div>${saCustPager(saCustShown.length)}</section>
        <p class="sa-note-line" id="saCustNote">${saText(saCustFlash)}</p>
        <p class="sa-muted">Totals are read from marketplace orders. Shopkeeper customer records are not changed.</p>`;
    saCustFlash = '';
    document.getElementById('saCustQuery').addEventListener('input', (event) => {
        saCustQuery = event.target.value;
        saCustPage = 1;
        saCustFocus = true;
        saPaintCustomers();
    });
    document.getElementById('saCustStatus').addEventListener('change', (event) => { saCustStatus = event.target.value; saCustPage = 1; saPaintCustomers(); });
    document.getElementById('saCustCity').addEventListener('change', (event) => { saCustCity = event.target.value; saCustPage = 1; saPaintCustomers(); });
    if (saCustFocus) {
        const box = document.getElementById('saCustQuery');
        box.focus();
        box.setSelectionRange(box.value.length, box.value.length);
        saCustFocus = false;
    }
}

async function saMountCustomers() {
    const response = await fetch('/api/admin/customers');
    const data = await response.json();
    saCustRows = data.customers || [];
    saPaintCustomers();
}

function saCustById(id) {
    return saCustRows.find((row) => row.id === id);
}
