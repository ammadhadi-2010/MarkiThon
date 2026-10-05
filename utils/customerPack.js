const { fallbackOrders, paymentsFromOrders } = require('./customerHistory');

function packCustomer(row) {
    const json = row && row.toJSON ? row.toJSON() : row || {};
    const status = json.status === 'Inactive' ? 'Inactive' : 'Active';
    const details = json.details && typeof json.details === 'object' ? json.details : {};
    const orders = Array.isArray(details.orders) && details.orders.length
        ? details.orders
        : fallbackOrders(json);
    const payments = Array.isArray(details.payments) && details.payments.length
        ? details.payments
        : paymentsFromOrders(orders);
    const notes = Array.isArray(details.notes) ? details.notes : [];
    return {
        id: json.id,
        name: json.name || '',
        phone: json.phone || '',
        whatsapp: json.whatsapp || json.phone || '',
        address: json.address || '',
        area: json.area || '',
        email: json.email || '',
        city: json.city || json.area || 'Multan',
        status,
        vip: Boolean(json.vip),
        totalOrders: Number(json.totalOrders || 0),
        totalPurchase: Number(json.totalPurchase || 0),
        pendingDue: Number(json.pendingDue || 0),
        lastOrderAt: json.lastOrderAt || null,
        joinedAt: json.joinedAt || json.createdAt || null,
        createdAt: json.createdAt,
        orders,
        payments,
        notes
    };
}

function customerStats(list) {
    const totalCustomers = list.length;
    const totalPurchases = list.reduce((sum, row) => sum + Number(row.totalPurchase || 0), 0);
    const activeCustomers = list.filter((row) => row.status === 'Active').length;
    const avgOrderValue = totalCustomers
        ? Math.round(totalPurchases / totalCustomers / 10) * 10
        : 0;
    return { totalCustomers, totalPurchases, avgOrderValue, activeCustomers };
}

function customerAreas(list) {
    return [...new Set(list.map((row) => row.area).filter(Boolean))].sort();
}

function customerPayload(req) {
    const name = String((req.body && req.body.name) || '').trim();
    const status = req.body && req.body.status === 'Inactive' ? 'Inactive' : 'Active';
    return {
        name,
        phone: req.body.phone || '',
        whatsapp: req.body.whatsapp || req.body.phone || '',
        address: req.body.address || '',
        area: req.body.area || '',
        email: req.body.email || '',
        city: req.body.city || req.body.area || '',
        pendingDue: Number(req.body.pendingDue || 0),
        status,
        vip: Boolean(req.body.vip),
        ShopId: req.body.ShopId || 1
    };
}

function applyCustomerPatch(row, req) {
    const body = req.body || {};
    const status = body.status === 'Inactive'
        ? 'Inactive'
        : (body.status === 'Active' ? 'Active' : (row.status || 'Active'));
    const details = Object.assign({}, row.details || {});
    if (body.note && String(body.note).trim()) {
        const notes = Array.isArray(details.notes) ? details.notes.slice() : [];
        notes.unshift({ text: String(body.note).trim(), at: new Date().toISOString() });
        details.notes = notes;
    }
    return {
        name: String(body.name || row.name || '').trim(),
        phone: body.phone != null ? body.phone : row.phone,
        whatsapp: body.whatsapp != null ? body.whatsapp : row.whatsapp,
        address: body.address != null ? body.address : row.address,
        area: body.area != null ? body.area : row.area,
        email: body.email != null ? body.email : row.email,
        city: body.city != null ? body.city : row.city,
        pendingDue: body.pendingDue != null ? Number(body.pendingDue) : row.pendingDue,
        status,
        vip: body.vip != null ? Boolean(body.vip) : Boolean(row.vip),
        details,
        ShopId: body.ShopId || row.ShopId || 1
    };
}

module.exports = { packCustomer, customerStats, customerAreas, customerPayload, applyCustomerPatch };
