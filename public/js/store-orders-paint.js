function osOrdPayBadge(payment) {
    if (payment === 'Paid') return '<span class="os-ord-pay paid">Paid</span>';
    if (payment === 'Mobile Wallet') return '<span class="os-ord-pay cod">Wallet</span>';
    return '<span class="os-ord-pay cod">COD</span>';
}

function osOrdStatusBadge(status) {
    const key = String(status || 'New').toLowerCase();
    return `<span class="os-ord-st ${key}">${escapeHtml(status || 'New')}</span>`;
}

function osOrdCustomerCell(row) {
    return `<div class="os-ord-cust">
        <span class="os-ord-ava">${osOrdInitials(row.customerName)}</span>
        <div>
            <strong>${escapeHtml(row.customerName)}</strong>
            <small>${escapeHtml(row.customerPhone || '—')}</small>
        </div>
    </div>`;
}

function osOrdRowHtml(row) {
    const when = osOrdWhen(row.createdAt);
    const qty = Number(row.itemCount || 0);
    const items = qty + (qty === 1 ? ' item' : ' items');
    const on = String(row.id) === String(osOrdOpenId) ? ' on' : '';
    return `<tr class="os-ord-row${on}" data-osoid="${row.id}">
        <td><strong class="os-ord-no">#${escapeHtml(row.orderNumber)}</strong></td>
        <td><div class="os-ord-when"><strong>${when.day}</strong><small>${when.time}</small></div></td>
        <td>${osOrdCustomerCell(row)}</td>
        <td>${escapeHtml(items)}</td>
        <td><strong>Rs. ${Number(row.total || 0).toLocaleString()}</strong></td>
        <td>${osOrdPayBadge(row.payment)}</td>
        <td>${osOrdStatusBadge(row.status)}</td>
        <td><button type="button" class="os-ord-go" data-osoopen="${row.id}" aria-label="View order">›</button> <button type="button" class="rpt-btn" data-report="order" data-role="Shopkeeper" data-target="${escapeHtml(row.orderNumber)}" data-order="${escapeHtml(row.orderNumber)}">Report to Admin</button></td>
    </tr>`;
}

function paintOsOrdPager(total, pages) {
    const label = document.getElementById('osOrdPageLabel');
    const pager = document.getElementById('osOrdPager');
    if (!label || !pager) return;
    const start = total ? (osOrdPage - 1) * OS_ORD_PAGE + 1 : 0;
    const end = Math.min(total, osOrdPage * OS_ORD_PAGE);
    label.textContent = `Showing ${start} - ${end} of ${total} orders`;
    const prev = `<button type="button" class="os-page-btn" data-osopage="prev" ${osOrdPage <= 1 ? 'disabled' : ''}>‹</button>`;
    const next = `<button type="button" class="os-page-btn" data-osopage="next" ${osOrdPage >= pages ? 'disabled' : ''}>›</button>`;
    const nums = Array.from({ length: pages }, (_, i) => {
        const n = i + 1;
        return `<button type="button" class="os-page-btn${n === osOrdPage ? ' on' : ''}" data-osopage="${n}">${n}</button>`;
    }).join('');
    pager.innerHTML = prev + nums + next;
}

function paintOsOrders() {
    const tbody = document.getElementById('osOrdersTable');
    if (!tbody) return;
    paintOsOrdTabs();
    const rows = osOrdFiltered();
    const pages = Math.max(1, Math.ceil(rows.length / OS_ORD_PAGE));
    if (osOrdPage > pages) osOrdPage = pages;
    const slice = rows.slice((osOrdPage - 1) * OS_ORD_PAGE, osOrdPage * OS_ORD_PAGE);
    tbody.innerHTML = slice.map(osOrdRowHtml).join('')
        || '<tr><td colspan="8" class="empty">No orders match these filters.</td></tr>';
    if (typeof paintOsOrdCards === 'function') paintOsOrdCards(slice);
    paintOsOrdPager(rows.length, pages);
}

async function loadOsOrders() {
    const data = await api.get('/api/online-store/orders');
    osOrders = Array.isArray(data.orders) ? data.orders : [];
    osOrdPage = 1;
    paintOsOrders();
}
