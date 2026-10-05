function paintCustCards(slice) {
    const box = document.getElementById('custCards');
    if (!box) return;
    if (!slice.length) {
        box.innerHTML = '<p class="os-ord-empty">No customers match these filters.</p>';
        return;
    }
    box.innerHTML = slice.map((row) => `
        <article class="cust-card" data-custid="${row.id}">
            <div class="cust-card-top">
                ${custNameCell(row)}
                ${custStatusBadge(row.status)}
            </div>
            <p class="cust-card-line">${escapeHtml(row.phone || '—')}</p>
            <p class="cust-card-line cust-addr">${escapeHtml(row.address || '—')}</p>
            <div class="cust-card-sum">
                <span class="os-ord-chip">${row.totalOrders} orders</span>
                <span class="os-ord-chip">${custRs(row.totalPurchase)}</span>
                <span class="os-ord-chip">${custDay(row.lastOrderAt)}</span>
            </div>
            ${custActions(row)}
        </article>`).join('');
}
