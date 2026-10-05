function osOdPayLabel(row) {
    if (row.payment === 'COD') return 'Cash on Delivery (COD)';
    if (row.payment === 'Mobile Wallet') return 'Mobile Wallet';
    return 'Paid Online';
}

function osOdRs(value) {
    return 'Rs. ' + Number(value || 0).toLocaleString();
}

function osOdFillPay(row) {
    const pending = row.paymentStatus !== 'Paid';
    document.getElementById('osOdPay').innerHTML = `
        <strong class="os-od-sec">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
            </svg>
            Payment &amp; Delivery
        </strong>
        <p class="os-od-muted">Payment Method</p>
        <p class="os-od-payline">
            <strong>${osOdPayLabel(row)}</strong>
            ${pending ? '<span class="os-od-pill warn">Pending</span>' : '<span class="os-od-pill ok">Paid</span>'}
        </p>
        <p class="os-od-muted">Payment Status</p>
        <p>${pending
            ? '<span class="os-od-pill bad">Not Paid Yet</span>'
            : '<span class="os-od-pill ok">Paid</span>'}</p>`;
}

function osOdFillSum(row) {
    document.getElementById('osOdSum').innerHTML = `
        <strong class="os-od-sec">Order Summary</strong>
        <p class="os-od-row"><span>Subtotal</span><span>${osOdRs(row.subtotal)}</span></p>
        <p class="os-od-row"><span>Discount</span><span>- ${osOdRs(row.discount)}</span></p>
        <p class="os-od-row"><span>Delivery Charges</span><span>${osOdRs(row.deliveryCharges)}</span></p>
        <p class="os-od-row grand"><span>Grand Total</span>
            <strong>${osOdRs(row.total)}</strong></p>`;
}

function osOdFillShip(row) {
    document.getElementById('osOdShip').innerHTML = `
        <strong class="os-od-sec">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 7h11v10H3z"/><path d="M14 10h4l3 3v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>
            </svg>
            Delivery Information
        </strong>
        <div class="os-od-ship-grid">
            <div>
                <p class="os-od-muted">Delivery Method</p>
                <p>${escapeHtml(row.deliveryMethod || 'Home Delivery')}</p>
            </div>
            <div class="os-od-ship-addr">
                <p class="os-od-muted">Address</p>
                <p>${escapeHtml(row.address || '—')}</p>
            </div>
            <div>
                <p class="os-od-muted">ETA</p>
                <p>${escapeHtml(row.eta || '2 - 3 Working Days')}</p>
            </div>
            <div>
                <p class="os-od-muted">Tracking Number</p>
                <p>${escapeHtml(row.trackingNumber || 'N/A')}</p>
            </div>
        </div>`;
}

function osOdStampLabel(iso) {
    if (!iso) return 'Pending';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'Pending';
    const day = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return day + ' ' + time;
}

function osOdFillTime(row) {
    const idx = osOdStepIndex(row.status);
    const stamps = row.timeline || {};
    document.getElementById('osOdTime').innerHTML = OS_ORD_STEPS.map((name, i) => {
        const done = idx > i || (row.status === 'Confirmed' && i === 0);
        const on = idx === i && row.status !== 'Confirmed';
        const cls = row.status === 'Cancelled' ? '' : (done ? ' done' : on ? ' on' : '');
        const stamp = stamps[name] || (i === 0 ? row.createdAt : '') || (on ? row.createdAt : '');
        const label = done || on ? osOdStampLabel(stamp) : 'Pending';
        return `<li class="os-od-step${cls}">
            <span class="os-od-node">${name}</span>
            <small>${escapeHtml(label)}</small>
        </li>`;
    }).join('');
}

function paintOsOrdDetail(row) {
    osOdFillHeader(row);
    osOdFillCustomer(row);
    osOdFillItems(row);
    osOdFillPay(row);
    osOdFillSum(row);
    osOdFillShip(row);
    osOdFillTime(row);
    document.querySelectorAll('#osOrdDrawer [data-osordact]').forEach((btn) => {
        const next = btn.dataset.osordact;
        const dead = row.status === 'Cancelled' || row.status === 'Completed';
        btn.disabled = dead && next !== 'Cancelled' ? true : (next !== 'Cancelled' && next === row.status);
        if (next === 'Cancelled') btn.disabled = dead;
    });
}
