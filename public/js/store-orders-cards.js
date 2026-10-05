function osOrdCardHtml(row) {
    const when = osOrdWhen(row.createdAt);
    const qty = Number(row.itemCount || 0);
    const items = qty + (qty === 1 ? ' item' : ' items');
    const on = String(row.id) === String(osOrdOpenId) ? ' on' : '';
    return `<article class="os-ord-card${on}" data-osoid="${row.id}">
        <div class="os-ord-card-top">
            <strong class="os-ord-no">#${escapeHtml(row.orderNumber)}</strong>
            <div class="os-ord-when"><strong>${when.day}</strong><small>${when.time}</small></div>
        </div>
        ${osOrdCustomerCell(row)}
        <div class="os-ord-card-sum">
            <span class="os-ord-chip">${escapeHtml(items)}</span>
            <strong>Rs. ${Number(row.total || 0).toLocaleString()}</strong>
            ${osOrdPayBadge(row.payment)}
            ${osOrdStatusBadge(row.status)}
        </div>
        <button type="button" class="os-ord-card-go" data-osoopen="${row.id}">View details</button>
        <button type="button" class="rpt-btn" data-report="order" data-role="Shopkeeper" data-target="${escapeHtml(row.orderNumber)}" data-order="${escapeHtml(row.orderNumber)}">Report to Admin</button>
    </article>`;
}

function paintOsOrdCards(slice) {
    const box = document.getElementById('osOrdersCards');
    if (!box) return;
    box.innerHTML = slice.length
        ? slice.map(osOrdCardHtml).join('')
        : '<p class="os-ord-empty">No orders match these filters.</p>';
}
