async function saTicketSend(id, body) {
    const response = await fetch('/api/admin/support/tickets' + (id ? '/' + encodeURIComponent(id) : ''), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    const note = document.getElementById('saFormNote');
    if (!response.ok) {
        if (note) note.textContent = data.message || 'Could not update the ticket.';
        else saTicketFlash = data.message || 'Could not update the ticket.';
        if (!note) saPaintTickets();
        return;
    }
    const modal = document.getElementById('saShopModal');
    if (modal) modal.remove();
    saTicketFlash = data.message || 'Ticket updated.';
    await saMountTickets();
}

function saTicketCsv(value) {
    return '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"';
}

function saExportTickets() {
    const lines = ['Ticket,Type,Subject,From,Priority,Status,Date'];
    saTicketShown.forEach((row) => {
        lines.push([row.number, row.type, row.subject, row.from, row.priority, row.status, row.createdAt].map(saTicketCsv).join(','));
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
    link.download = 'tickets.csv';
    link.click();
}

function saQuickModal(title, body, onSave) {
    saShopModal(title, body, '<button type="button" id="saFormCancel">Cancel</button><button class="sa-add" type="submit">Save</button>');
    document.getElementById('saFormCancel').addEventListener('click', () => document.getElementById('saShopModal').remove());
    document.querySelector('#saShopModal form').addEventListener('submit', (event) => {
        event.preventDefault();
        onSave();
    });
}

function saOpenNewTicket() {
    const body = `<label>From</label><input id="saFormFrom" autocomplete="off">
        <label>Type</label><select id="saFormKind"><option>Customer</option><option>Shopkeeper</option><option>Order</option><option>System</option></select>
        <label>Subject</label><input id="saFormSubject" autocomplete="off">
        <label>Message</label><textarea id="saFormMessage" autocomplete="off"></textarea>
        <label>Linked order</label><input id="saFormOrder" autocomplete="off">`;
    saQuickModal('New Ticket', body, () => saTicketSend('', {
        from: document.getElementById('saFormFrom').value,
        type: document.getElementById('saFormKind').value,
        subject: document.getElementById('saFormSubject').value,
        message: document.getElementById('saFormMessage').value,
        orderNumber: document.getElementById('saFormOrder').value,
        role: 'Admin'
    }));
}

async function saTicketBulk(body) {
    const ids = saTicketShown.map((row) => row.id);
    if (!ids.length) {
        saTicketFlash = 'No tickets match these filters.';
        saPaintTickets();
        return;
    }
    const response = await fetch('/api/admin/support/tickets/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, ids })
    });
    const data = await response.json();
    const note = document.getElementById('saFormNote');
    if (!response.ok) {
        if (note) note.textContent = data.message || 'Could not update tickets.';
        return;
    }
    const modal = document.getElementById('saShopModal');
    if (modal) modal.remove();
    saTicketFlash = data.message || 'Tickets updated.';
    await saMountTickets();
}

document.addEventListener('click', (event) => {
    const view = event.target.closest('[data-ticket-view]');
    const tab = event.target.closest('[data-ticket-tab]');
    const page = event.target.closest('[data-ticket-page]');
    if (event.target.closest('#saNewTicket')) saOpenNewTicket();
    if (event.target.closest('#saBulkReply')) {
        saQuickModal('Bulk Reply', '<label>Reply</label><textarea id="saFormBulk" autocomplete="off"></textarea>', () => {
            saTicketBulk({ message: document.getElementById('saFormBulk').value });
        });
    }
    if (event.target.closest('#saAssignTo')) {
        saQuickModal('Assign To', '<label>Assignee</label><input id="saFormAssign" autocomplete="off">', () => {
            saTicketBulk({ assignee: document.getElementById('saFormAssign').value });
        });
    }
    if (event.target.closest('#saExportTickets')) saExportTickets();
    if (view) location.assign('/admin/support/' + encodeURIComponent(view.dataset.ticketView));
    if (tab) { saTicketType = tab.dataset.ticketTab; saTicketPage = 1; saPaintTickets(); }
    if (page) { saTicketPage = Number(page.dataset.ticketPage); saPaintTickets(); }
});
