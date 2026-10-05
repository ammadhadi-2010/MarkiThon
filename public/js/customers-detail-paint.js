let custDetailId = '';
let custDetailTab = 'orders';
let custDetailAll = false;

function custDDay(value) {
    const raw = String(value || '');
    const iso = raw.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
        const parts = iso.split('-');
        return new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])))
            .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
    }
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function custDOrdStatus(status) {
    const key = String(status || 'Completed').toLowerCase();
    return `<span class="os-ord-st ${key}">${escapeHtml(status || 'Completed')}</span>`;
}

function paintCustDHero(row) {
    document.getElementById('custDAva').textContent = custInitials(row.name);
    document.getElementById('custDName').textContent = row.name;
    const vip = document.getElementById('custDVip');
    vip.hidden = !row.vip;
    document.getElementById('custDPhone').textContent = row.phone || '—';
    document.getElementById('custDStatus').innerHTML = custStatusBadge(row.status);
}

function paintCustDMeta(row) {
    document.getElementById('custDMeta').innerHTML = `
        <div><p class="os-od-muted">Email</p><p>${escapeHtml(row.email || '—')}</p></div>
        <div><p class="os-od-muted">Address</p><p>${escapeHtml(row.address || '—')}</p></div>
        <div><p class="os-od-muted">City</p><p>${escapeHtml(row.city || row.area || '—')}</p></div>
        <div><p class="os-od-muted">Join Date</p><p>${custDDay(row.joinedAt)}</p></div>`;
    document.getElementById('custDKpis').innerHTML = `
        <article><p>Total Orders</p><strong>${row.totalOrders || 0}</strong></article>
        <article><p>Total Purchase</p><strong>${custRs(row.totalPurchase)}</strong></article>
        <article class="due"><p>Pending Due</p><strong>${custRs(row.pendingDue)}</strong></article>`;
}

function paintCustDOrders(row) {
    const list = Array.isArray(row.orders) ? row.orders : [];
    const shown = custDetailAll ? list : list.slice(0, 5);
    const rows = shown.map((o) => `<tr>
        <td><strong class="cust-d-no">#${escapeHtml(o.number)}</strong></td>
        <td>${custDDay(o.day)}</td>
        <td>${o.items}</td>
        <td>${custRs(o.total)}</td>
        <td>${custDOrdStatus(o.status)}</td>
    </tr>`).join('') || '<tr><td colspan="5" class="empty">No orders yet.</td></tr>';
    const more = list.length > 5
        ? `<button type="button" class="cust-d-all" data-cdact="allorders">${custDetailAll ? 'Show less' : 'View All Orders →'}</button>`
        : '';
    document.getElementById('custDOrders').innerHTML = `
        <div class="table-wrap cust-d-table">
            <table class="cust-d-os">
                <thead><tr><th>Order #</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>${more}`;
}

function paintCustDetail(row) {
    if (!row || !document.getElementById('custDetail')) return;
    paintCustDHero(row);
    paintCustDMeta(row);
    paintCustDOrders(row);
    if (typeof paintCustDPays === 'function') paintCustDPays(row);
    if (typeof paintCustDNotes === 'function') paintCustDNotes(row);
    document.querySelectorAll('#custDTabs [data-cdtab]').forEach((btn) => {
        btn.classList.toggle('on', btn.dataset.cdtab === custDetailTab);
    });
    document.getElementById('custDOrders').hidden = custDetailTab !== 'orders';
    document.getElementById('custDPays').hidden = custDetailTab !== 'pays';
    document.getElementById('custDNotes').hidden = custDetailTab !== 'notes';
}
