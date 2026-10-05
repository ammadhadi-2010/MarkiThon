function demoEmail(name) {
    return String(name || 'customer').toLowerCase().replace(/[^a-z0-9]+/g, '.') + '@gmail.com';
}

function splitAmount(total, count) {
    const n = Math.max(1, count);
    const base = Math.round(total / n);
    const parts = Array.from({ length: n }, () => base);
    parts[0] += total - parts.reduce((s, v) => s + v, 0);
    return parts.map((v) => Math.max(200, v));
}

function orderRow(number, day, items, total, status) {
    return { number, day, items, total, status };
}

function bilalOrders() {
    return [
        orderRow('MK-10023', '2025-09-14', 3, 4850, 'Completed'),
        orderRow('MK-10018', '2025-09-10', 1, 2700, 'Completed'),
        orderRow('MK-10012', '2025-09-05', 2, 3450, 'Processing'),
        orderRow('MK-10006', '2025-08-28', 1, 1200, 'Completed'),
        orderRow('MK-10002', '2025-08-20', 2, 2500, 'Completed'),
        orderRow('MK-10001', '2025-08-08', 1, 1750, 'Completed'),
        orderRow('MK-09998', '2025-07-22', 2, 1100, 'Completed'),
        orderRow('MK-09990', '2025-07-04', 1, 900, 'Completed')
    ];
}

function fallbackOrders(row) {
    if (row.name === 'Bilal Ahmed') return bilalOrders();
    const count = Math.max(1, Number(row.totalOrders || 1));
    const parts = splitAmount(Number(row.totalPurchase || 0), count);
    const start = row.lastOrderAt ? new Date(row.lastOrderAt) : new Date('2026-09-01');
    return parts.map((total, i) => {
        const day = new Date(start);
        day.setDate(day.getDate() - i * 6);
        const status = i === 1 && count > 2 ? 'Processing' : 'Completed';
        return orderRow('MK-' + (10000 + (row.id || i) * 3 + i), day.toISOString().slice(0, 10),
            1 + (i % 3), total, status);
    });
}

function paymentsFromOrders(orders) {
    return (orders || []).filter((o) => o.status === 'Completed').map((o) => ({
        day: o.day,
        amount: o.total,
        method: 'Cash',
        note: 'Payment for ' + o.number
    }));
}

function withProfile(row) {
    const orders = row.name === 'Bilal Ahmed' ? bilalOrders() : fallbackOrders(row);
    const email = row.name === 'Bilal Ahmed' ? 'bilal.ahmed@gmail.com' : demoEmail(row.name);
    return Object.assign({}, row, {
        email,
        city: 'Multan',
        pendingDue: row.name === 'Bilal Ahmed' ? 0 : Number(row.pendingDue || 0),
        joinedAt: row.name === 'Bilal Ahmed' ? new Date('2024-08-12T12:00:00') : (row.joinedAt || new Date('2025-01-15')),
        details: {
            orders,
            payments: paymentsFromOrders(orders),
            notes: row.name === 'Bilal Ahmed'
                ? [{ text: 'Prefers evening delivery in Model Town.', at: '2026-09-10T10:00:00' }]
                : []
        }
    });
}

module.exports = { withProfile, fallbackOrders, paymentsFromOrders, demoEmail };
