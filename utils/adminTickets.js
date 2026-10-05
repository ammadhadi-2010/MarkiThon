const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../data/admin-tickets.json');
const types = ['Customer', 'Shopkeeper', 'Order', 'System'];
const priorities = ['High', 'Medium', 'Low'];
const statuses = ['Pending', 'In Progress', 'Resolved', 'Escalated'];
const seed = [
    ['tkt-1025', 'MP-1025', 'Customer', 'Product not received', 'Ayesha Khan', 'High', 'Pending', '2025-09-16T10:24:00', ''],
    ['tkt-1024', 'MP-1024', 'Shopkeeper', 'Shop suspended', 'Zain Textiles', 'High', 'In Progress', '2025-09-16T09:12:00', ''],
    ['tkt-1023', 'MP-1023', 'Order', 'Wrong item received', 'Usman Ali', 'Medium', 'In Progress', '2025-09-15T17:43:00', 'MK-10014'],
    ['tkt-1022', 'MP-1022', 'Customer', 'Refund request', 'Sana Fatima', 'Medium', 'Pending', '2025-09-15T14:17:00', ''],
    ['tkt-1021', 'MP-1021', 'Shopkeeper', 'Product removal request', 'Royal Fabrics', 'Low', 'Resolved', '2025-09-14T11:36:00', ''],
    ['tkt-1020', 'MP-1020', 'System', 'Website not working', 'Admin', 'High', 'In Progress', '2025-09-14T10:42:00', ''],
    ['tkt-1019', 'MP-1019', 'Order', 'Delivery delay', 'Zain Sheikh', 'Medium', 'In Progress', '2025-09-13T20:15:00', 'MK-10014'],
    ['tkt-1018', 'MP-1018', 'Customer', 'Return request', 'Hina Butt', 'Low', 'Resolved', '2025-09-13T18:22:00', ''],
    ['tkt-1017', 'MP-1017', 'Shopkeeper', 'Commission issue', 'Modern Textiles', 'Medium', 'In Progress', '2025-09-12T16:30:00', ''],
    ['tkt-1016', 'MP-1016', 'Shopkeeper', 'Account blocked', 'Tahir Mehmood', 'Low', 'Resolved', '2025-09-12T15:15:00', ''],
    ['tkt-1015', 'MP-1015', 'Customer', 'Payment not received', 'Ammad Hadi Stor', 'High', 'Escalated', '2025-09-11T12:05:00', ''],
    ['tkt-1014', 'MP-1014', 'System', 'Checkout error', 'Admin', 'Medium', 'Escalated', '2025-09-11T09:40:00', '']
].map(([id, number, type, subject, from, priority, status, createdAt, orderNumber]) => ({
    id, number, type, subject, from, priority, status, createdAt, orderNumber
}));

function readTickets() {
    try {
        const rows = JSON.parse(fs.readFileSync(file, 'utf8'));
        return Array.isArray(rows) ? rows : seed.map((row) => ({ ...row }));
    } catch (error) {
        return seed.map((row) => ({ ...row }));
    }
}

function writeTickets(rows) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(rows, null, 2));
}

function thread(row) {
    if (Array.isArray(row.messages)) return row.messages;
    return [{
        from: row.from,
        role: row.type === 'Shopkeeper' ? 'Shopkeeper' : 'Customer',
        text: row.subject,
        at: row.createdAt,
        files: []
    }];
}

function present(row) {
    return {
        ...row,
        orderNumber: row.orderNumber || '',
        assignee: row.assignee || '',
        phone: row.phone || '',
        target: row.target || '',
        messages: thread(row)
    };
}

function listTickets() {
    const rows = readTickets();
    if (!fs.existsSync(file)) writeTickets(rows);
    return rows.map(present).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function findTicket(id) {
    return listTickets().find((row) => row.id === id) || null;
}

function pushMessage(row, message) {
    const text = String(message.text || '').trim().slice(0, 1000);
    if (!text) return thread(row);
    const files = (Array.isArray(message.files) ? message.files : []).slice(0, 3).map((name) => String(name).slice(0, 80));
    return thread(row).concat([{
        from: String(message.from || 'Admin').slice(0, 80),
        role: message.role || 'Admin',
        text,
        at: new Date().toISOString(),
        files
    }]);
}

function typeFrom(body) {
    if (types.includes(body.type)) return body.type;
    const kind = String(body.kind || '').toLowerCase();
    if (kind === 'order') return 'Order';
    if (kind === 'shop') return 'Shopkeeper';
    if (kind === 'system') return 'System';
    return body.role === 'Shopkeeper' ? 'Shopkeeper' : 'Customer';
}

function createReport(body) {
    const subject = String(body.subject || '').trim();
    const from = String(body.from || '').trim();
    const text = String(body.message || '').trim();
    if (subject.length < 3 || from.length < 2 || text.length < 3) return null;
    const rows = readTickets();
    const row = {
        id: 'tkt-' + Date.now(),
        number: 'MP-' + String(Date.now()).slice(-6),
        type: typeFrom(body),
        subject: subject.slice(0, 120),
        from: from.slice(0, 80),
        priority: priorities.includes(body.priority) ? body.priority : 'Medium',
        status: 'Pending',
        createdAt: new Date().toISOString(),
        orderNumber: String(body.orderNumber || '').trim().slice(0, 40),
        target: String(body.target || '').trim().slice(0, 120),
        phone: String(body.phone || '').trim().slice(0, 20),
        assignee: '',
        messages: []
    };
    row.messages = pushMessage(row, {
        from: row.from,
        role: body.role === 'Shopkeeper' ? 'Shopkeeper' : 'Customer',
        text,
        files: body.files
    });
    rows.unshift(row);
    writeTickets(rows);
    return present(row);
}

function updateTicket(id, body) {
    const rows = readTickets();
    const index = rows.findIndex((row) => row.id === id);
    if (index < 0) return { missing: true };
    const priority = priorities.includes(body.priority) ? body.priority : rows[index].priority;
    const status = statuses.includes(body.status) ? body.status : rows[index].status;
    if (!priorities.includes(priority) || !statuses.includes(status)) return null;
    const next = { ...rows[index], priority, status };
    if (body.assignee != null) next.assignee = String(body.assignee).trim().slice(0, 60);
    if (body.orderNumber != null) next.orderNumber = String(body.orderNumber).trim().slice(0, 40);
    if (body.message) next.messages = pushMessage(next, { from: 'Admin', role: 'Admin', text: body.message, files: body.files });
    rows[index] = next;
    writeTickets(rows);
    return present(next);
}

function bulkTickets(body) {
    const ids = new Set(Array.isArray(body.ids) ? body.ids : []);
    if (!ids.size) return null;
    const rows = readTickets();
    let changed = false;
    const next = rows.map((row) => {
        if (!ids.has(row.id)) return row;
        changed = true;
        const copy = { ...row };
        if (body.assignee) copy.assignee = String(body.assignee).trim().slice(0, 60);
        if (body.message) copy.messages = pushMessage(copy, { from: 'Admin', role: 'Admin', text: body.message });
        return copy;
    });
    if (!changed) return null;
    writeTickets(next);
    return next.map(present);
}

module.exports = { listTickets, findTicket, createReport, updateTicket, bulkTickets };
