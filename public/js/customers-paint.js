function custStatusBadge(status) {
    const on = status === 'Active';
    return `<span class="cust-st ${on ? 'on' : 'off'}">${on ? 'Active' : 'Inactive'}</span>`;
}

function custIconBtn(act, label, path) {
    return `<button type="button" class="cust-ico ${act}" data-custact="${act}" aria-label="${label}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${path}</svg>
    </button>`;
}

function custMoreMenu() {
    return `<div class="cust-more">
        ${custIconBtn('more', 'More options', '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>')}
        <div class="cust-drop" role="menu">
            <button type="button" data-custact="history">View Order History</button>
            <button type="button" data-custact="edit">Edit Customer Profile</button>
            <button type="button" data-custact="promo">Send Custom Promo Message</button>
            <button type="button" data-custact="vip">Toggle VIP Status</button>
            <button type="button" class="danger" data-custact="delete">Delete Customer</button>
        </div>
    </div>`;
}

function custActions(row) {
    return `<div class="cust-acts" data-custid="${row.id}">
        ${custIconBtn('view', 'View Details', '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>')}
        ${custIconBtn('edit', 'Edit', '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>')}
        ${custIconBtn('call', 'Direct Call', '<path d="M6 4h3l2 5-2 1a12 12 0 0 0 6 6l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 6a2 2 0 0 1 2-2z"/>')}
        ${custIconBtn('wa', 'Direct WhatsApp', '<path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3z"/>')}
        ${custMoreMenu()}
    </div>`;
}

function custNameCell(row) {
    return `<div class="cust-who">
        <span class="os-ord-ava">${escapeHtml(custInitials(row.name))}</span>
        <div>
            <strong>${escapeHtml(row.name)}</strong>
            ${row.vip ? '<span class="cust-vip">VIP</span>' : ''}
        </div>
    </div>`;
}

function custRowHtml(row) {
    return `<tr data-custid="${row.id}">
        <td class="cust-check"><input type="checkbox" autocomplete="off"></td>
        <td>${custNameCell(row)}</td>
        <td>${escapeHtml(row.phone || '—')}</td>
        <td class="cust-addr">${escapeHtml(row.address || '—')}</td>
        <td>${row.totalOrders}</td>
        <td><strong>${custRs(row.totalPurchase)}</strong></td>
        <td>${custDay(row.lastOrderAt)}</td>
        <td>${custStatusBadge(row.status)}</td>
        <td>${custActions(row)}</td>
    </tr>`;
}

function paintCustPager(total, pages) {
    const label = document.getElementById('custPageLabel');
    const pager = document.getElementById('custPager');
    if (!label || !pager) return;
    const start = total ? (custPage - 1) * CUST_PAGE + 1 : 0;
    const end = Math.min(total, custPage * CUST_PAGE);
    label.textContent = `Showing ${start} - ${end} of ${total} customers`;
    let from = Math.max(1, custPage - 2);
    let to = Math.min(pages, from + 4);
    from = Math.max(1, to - 4);
    const nums = [];
    for (let n = from; n <= to; n += 1) {
        nums.push(`<button type="button" class="os-page-btn${n === custPage ? ' on' : ''}" data-custpage="${n}">${n}</button>`);
    }
    const prev = `<button type="button" class="os-page-btn" data-custpage="prev" ${custPage <= 1 ? 'disabled' : ''}>‹</button>`;
    const next = `<button type="button" class="os-page-btn" data-custpage="next" ${custPage >= pages ? 'disabled' : ''}>›</button>`;
    pager.innerHTML = prev + nums.join('') + next;
}

function paintCustTable() {
    if (typeof custCloseMore === 'function') custCloseMore();
    const tbody = document.getElementById('custTable');
    if (!tbody) return;
    paintCustStats();
    const rows = custFiltered();
    const pages = Math.max(1, Math.ceil(rows.length / CUST_PAGE));
    if (custPage > pages) custPage = pages;
    const slice = rows.slice((custPage - 1) * CUST_PAGE, custPage * CUST_PAGE);
    tbody.innerHTML = slice.map(custRowHtml).join('')
        || '<tr><td colspan="9" class="empty">No customers match these filters.</td></tr>';
    if (typeof paintCustCards === 'function') paintCustCards(slice);
    paintCustPager(rows.length, pages);
}
