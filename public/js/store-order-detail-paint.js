const OS_ORD_STEPS = ['New', 'Processing', 'Ready', 'Dispatched', 'Completed'];

function osOdStepIndex(status) {
    if (status === 'Cancelled') return -1;
    if (status === 'New') return 0;
    if (status === 'Confirmed') return 0;
    if (status === 'Processing') return 1;
    if (status === 'Ready') return 2;
    if (status === 'Dispatched') return 3;
    if (status === 'Completed') return 4;
    return 0;
}

function osOdWaHref(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    if (!digits) return '';
    const intl = digits.startsWith('0') ? '92' + digits.slice(1) : digits;
    return 'https://wa.me/' + intl;
}

function osOdMapHref(row) {
    if (row.mapUrl) return row.mapUrl;
    if (!row.address) return '';
    return 'https://maps.google.com/?q=' + encodeURIComponent(row.address);
}

function osOdThumb(item) {
    if (item.image) {
        return `<img class="os-od-thumb" src="${escapeHtml(item.image)}" alt="">`;
    }
    const letter = escapeHtml((item.title || 'P').slice(0, 1).toUpperCase());
    return `<span class="os-od-thumb">${letter}</span>`;
}

function osOdItemRow(item) {
    return `<tr>
        <td class="os-od-col-prod">
            <div class="os-od-prod">
                ${osOdThumb(item)}
                <div>
                    <strong>${escapeHtml(item.title)}</strong>
                    <small>${escapeHtml(item.sku || '—')}</small>
                </div>
            </div>
        </td>
        <td class="os-od-col-num">${item.qty}</td>
        <td class="os-od-col-num">Rs. ${Number(item.price).toLocaleString()}</td>
        <td class="os-od-col-num">Rs. ${Number(item.discount || 0).toLocaleString()}</td>
        <td class="os-od-col-num"><strong>Rs. ${Number(item.total).toLocaleString()}</strong></td>
    </tr>`;
}

function osOdFillHeader(row) {
    const date = row.createdAt ? new Date(row.createdAt) : null;
    const valid = date && !Number.isNaN(date.getTime());
    const day = valid ? date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const time = valid ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
    document.getElementById('osOdTitle').textContent = '#' + row.orderNumber;
    document.getElementById('osOdWhen').textContent = time ? day + '  ·  ' + time : day;
    document.getElementById('osOdStatus').innerHTML = osOrdStatusBadge(row.status);
    const call = document.getElementById('osOdCall');
    const wa = document.getElementById('osOdWa');
    const phone = row.customerPhone || '';
    call.href = phone ? 'tel:' + phone : '#';
    call.classList.toggle('off', !phone);
    const waHref = osOdWaHref(row.whatsapp || phone);
    wa.href = waHref || '#';
    wa.classList.toggle('off', !waHref);
}

function osOdFillCustomer(row) {
    const phone = row.customerPhone || '—';
    const wa = row.whatsapp || row.customerPhone || '—';
    document.getElementById('osOdCust').innerHTML = `
        <div class="os-od-person">
            <span class="os-od-ava-lg">${osOrdInitials(row.customerName)}</span>
            <div>
                <strong>${escapeHtml(row.customerName)}</strong>
                <p class="os-od-line tel">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 4h3l2 5-2 1a12 12 0 0 0 6 6l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 6a2 2 0 0 1 2-2z"/>
                    </svg>
                    ${escapeHtml(phone)}
                </p>
                <p class="os-od-line wa">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3zm4.7 12.6c-.2.6-1.2 1.1-1.6 1.1-.4 0-.8.2-2.7-.6-2.3-1-3.8-3.4-3.9-3.6-.1-.2-1-1.3-1-2.5s.6-1.8.9-2 .3-.3.5-.3h.4c.1 0 .3 0 .4.3l.6 1.5c.1.2 0 .3 0 .5l-.3.5c-.1.1-.2.3 0 .5.3.5.8 1.1 1.3 1.5.6.5 1.2.8 1.5.9.2.1.4.1.5-.1l.5-.6c.1-.1.3-.1.5 0l1.6.8c.2.1.3.2.3.4s-.1 1.2-.3 1.4z"/>
                    </svg>
                    WhatsApp ${escapeHtml(wa)}
                </p>
            </div>
        </div>`;
    const map = osOdMapHref(row);
    document.getElementById('osOdAddr').innerHTML = `
        <span class="os-od-pin" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>
            </svg>
        </span>
        <div>
            <p>${escapeHtml(row.address || 'No delivery address yet.')}</p>
            ${map ? `<a class="os-od-map" href="${escapeHtml(map)}" target="_blank" rel="noopener">View on Map</a>` : ''}
        </div>`;
}

function osOdFillItems(row) {
    const items = Array.isArray(row.items) ? row.items : [];
    document.getElementById('osOdItems').innerHTML = items.map(osOdItemRow).join('')
        || '<tr><td colspan="5" class="empty">No line items.</td></tr>';
}
