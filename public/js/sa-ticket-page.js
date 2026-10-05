function saTicketWhen(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Not set';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        + ' ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function saTicketThread(ticket) {
    return (ticket.messages || []).map((item) => {
        const files = (item.files || []).map((name) => `<span class="sa-file">${saText(name)}</span>`).join('');
        const side = item.role === 'Admin' ? ' is-admin' : '';
        return `<article class="sa-msg${side}"><strong>${saText(item.from)}</strong><p>${saText(item.text)}</p>${files}<small>${saTicketWhen(item.at)}</small></article>`;
    }).join('') || '<p class="sa-muted">No messages yet.</p>';
}

function saPaintTicketPage(ticket) {
    const choice = (list, current) => list.map((name) => `<option${name === current ? ' selected' : ''}>${name}</option>`).join('');
    document.getElementById('saView').innerHTML = `
        <a class="sa-back" href="/admin#complaints">← Back to Support Tickets</a>
        <h1>${saText(ticket.number)}</h1>
        <p class="sa-muted">${saText(ticket.subject)}</p>
        <p class="sa-note-line" id="saTicketPageNote"></p>
        <div class="sa-ticket-page">
            <section class="sa-card">
                <h3>Conversation</h3>
                <div class="sa-thread">${saTicketThread(ticket)}</div>
                <form id="saReplyForm" autocomplete="off">
                    <label>Reply</label>
                    <textarea id="saReplyText" autocomplete="off"></textarea>
                    <label>Attachment name</label>
                    <input id="saReplyFile" autocomplete="off" placeholder="Optional file name">
                    <button class="sa-add" type="submit">Send Reply</button>
                </form>
            </section>
            <aside class="sa-card">
                <h3>Ticket Info</h3>
                <div class="sa-detail">
                    <div><span>From</span><strong>${saText(ticket.from)}</strong></div>
                    <div><span>Phone</span><strong>${saText(ticket.phone || 'Not set')}</strong></div>
                    <div><span>Type</span><strong>${saText(ticket.type)}</strong></div>
                    <div><span>Linked order</span><strong>${saText(ticket.orderNumber || 'Not set')}</strong></div>
                    <div><span>About</span><strong>${saText(ticket.target || 'Not set')}</strong></div>
                </div>
                <form id="saTicketControls" autocomplete="off">
                    <label>Priority</label>
                    <select id="saPagePriority">${choice(['High', 'Medium', 'Low'], ticket.priority)}</select>
                    <label>Status</label>
                    <select id="saPageStatus">${choice(['Pending', 'In Progress', 'Resolved', 'Escalated'], ticket.status)}</select>
                    <label>Assign to</label>
                    <input id="saPageAssign" autocomplete="off" value="${saText(ticket.assignee || '')}">
                    <button class="sa-add" type="submit">Save Controls</button>
                </form>
            </aside>
        </div>`;
    document.getElementById('saReplyForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const file = document.getElementById('saReplyFile').value.trim();
        saSaveTicket(ticket.id, {
            priority: ticket.priority,
            status: ticket.status,
            message: document.getElementById('saReplyText').value,
            files: file ? [file] : []
        });
    });
    document.getElementById('saTicketControls').addEventListener('submit', (event) => {
        event.preventDefault();
        saSaveTicket(ticket.id, {
            priority: document.getElementById('saPagePriority').value,
            status: document.getElementById('saPageStatus').value,
            assignee: document.getElementById('saPageAssign').value
        });
    });
}

async function saSaveTicket(id, body) {
    const response = await fetch('/api/admin/support/tickets/' + encodeURIComponent(id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    const note = document.getElementById('saTicketPageNote');
    if (!response.ok) {
        if (note) note.textContent = data.message || 'Could not update the ticket.';
        return;
    }
    saPaintTicketPage(data.ticket);
    const saved = document.getElementById('saTicketPageNote');
    if (saved) saved.textContent = data.message || 'Ticket updated.';
}

async function saMountTicketPage(id) {
    saPaintNav('complaints');
    saPaintTop();
    const response = await fetch('/api/admin/support/tickets/' + encodeURIComponent(id));
    if (!response.ok) {
        document.getElementById('saView').innerHTML = '<section class="sa-card"><h2>Ticket not found</h2><p><a class="sa-back" href="/admin#complaints">← Back to Support Tickets</a></p></section>';
        return;
    }
    const data = await response.json();
    saPaintTicketPage(data.ticket);
}
