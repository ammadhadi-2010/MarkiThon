function money(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function normalizeItems(raw) {
    const list = Array.isArray(raw) ? raw : [];
    return list.map((item) => {
        const qty = Math.max(1, money(item.qty) || 1);
        const price = money(item.price);
        const discount = money(item.discount);
        const total = money(item.total) || Math.max(0, qty * price - discount);
        return {
            title: String(item.title || 'Item').trim(),
            sku: String(item.sku || '').trim(),
            qty,
            price,
            discount,
            total,
            image: String(item.image || '').trim()
        };
    });
}

function sums(items, details) {
    const subtotal = details.subtotal != null
        ? money(details.subtotal)
        : items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const discount = details.discount != null
        ? money(details.discount)
        : items.reduce((sum, item) => sum + item.discount, 0);
    const deliveryCharges = money(details.deliveryCharges);
    const total = subtotal - discount + deliveryCharges;
    return { subtotal, discount, deliveryCharges, total };
}

function stampTimeline(status, createdAt, prev, touch) {
    const created = createdAt ? new Date(createdAt).toISOString() : new Date().toISOString();
    const t = Object.assign({ New: created }, prev || {});
    if (!touch) return t;
    const now = new Date().toISOString();
    if (status === 'Cancelled') return t;
    if (['Processing', 'Ready', 'Dispatched', 'Completed'].includes(status)) {
        t.Processing = t.Processing || now;
    }
    if (['Ready', 'Dispatched', 'Completed'].includes(status)) t.Ready = t.Ready || now;
    if (['Dispatched', 'Completed'].includes(status)) t.Dispatched = t.Dispatched || now;
    if (status === 'Completed') t.Completed = t.Completed || now;
    return t;
}

function mergeDetails(body, items, createdAt, prev, touch) {
    const cur = prev && typeof prev === 'object' ? prev : {};
    const next = Object.assign({}, cur, body && body.details ? body.details : {});
    if (body.whatsapp != null) next.whatsapp = String(body.whatsapp).trim();
    if (body.address != null) next.address = String(body.address).trim();
    if (body.mapUrl != null) next.mapUrl = String(body.mapUrl).trim();
    const paid = (body.payment || next.paymentStatus) === 'Paid';
    const math = sums(items, next);
    next.whatsapp = String(next.whatsapp || body.customerPhone || '').trim();
    next.address = String(next.address || '').trim();
    next.mapUrl = String(next.mapUrl || '').trim();
    next.deliveryMethod = String(next.deliveryMethod || 'Home Delivery').trim();
    next.eta = String(next.eta || '2 - 3 Working Days').trim();
    next.trackingNumber = String(next.trackingNumber || 'N/A').trim();
    next.paymentStatus = String(next.paymentStatus || (paid ? 'Paid' : 'Pending'));
    next.subtotal = math.subtotal;
    next.discount = math.discount;
    next.deliveryCharges = math.deliveryCharges;
    next.timeline = stampTimeline(body.status || 'New', createdAt, next.timeline, touch);
    return next;
}

function packOrder(row, statuses, payments) {
    const json = row.toJSON ? row.toJSON() : row;
    const items = normalizeItems(json.items);
    const details = mergeDetails(json, items, json.createdAt, json.details, false);
    const math = sums(items, details);
    return {
        id: json.id,
        orderNumber: json.orderNumber,
        customerName: json.customerName,
        customerPhone: json.customerPhone || '',
        items,
        itemCount: Number(json.itemCount || items.reduce((sum, item) => sum + item.qty, 0)),
        total: math.total,
        payment: payments.includes(json.payment) ? json.payment : 'Paid',
        status: statuses.includes(json.status) ? json.status : 'New',
        note: json.note || '',
        createdAt: json.createdAt,
        whatsapp: details.whatsapp,
        address: details.address,
        mapUrl: details.mapUrl,
        deliveryMethod: details.deliveryMethod,
        eta: details.eta,
        trackingNumber: details.trackingNumber,
        paymentStatus: details.paymentStatus,
        subtotal: details.subtotal,
        discount: details.discount,
        deliveryCharges: details.deliveryCharges,
        timeline: details.timeline,
        details
    };
}

module.exports = { money, normalizeItems, mergeDetails, stampTimeline, packOrder };
