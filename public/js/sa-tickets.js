let saTicketRows = [];
let saTicketShown = [];
let saTicketPage = 1;
let saTicketFocus = false;
let saTicketFlash = '';
let saTicketQuery = '';
let saTicketType = 'All';
let saTicketStatus = 'All';
let saTicketFrom = '';
let saTicketTo = '';
const SA_TICKET_SIZE = 10;
const SA_TICKET_TABS = [['All', 'All Tickets'], ['Customer', 'Customer Complaints'], ['Shopkeeper', 'Shopkeeper Support'], ['Order', 'Order Disputes'], ['System', 'System Issues']];

function saTicketMatch(row) {
    const text = (row.number + ' ' + row.subject + ' ' + row.from).toLowerCase();
    if (saTicketQuery && !text.includes(saTicketQuery.toLowerCase())) return false;
    if (saTicketType !== 'All' && row.type !== saTicketType) return false;
    if (saTicketStatus !== 'All' && row.status !== saTicketStatus) return false;
    const day = saOrderDay(row.createdAt);
    if (saTicketFrom && day < saTicketFrom) return false;
    if (saTicketTo && day > saTicketTo) return false;
    return true;
}

function saTicketCards(rows) {
    const count = (status) => rows.filter((row) => row.status === status).length;
    const box = saSvg('<path d="M5 6h14v12H5z"/><path d="M5 10h14"/>');
    const wait = saSvg('<path d="M12 4v8l4 2"/><circle cx="12" cy="12" r="8"/>');
    const play = saSvg('<circle cx="12" cy="12" r="8"/><path d="M10 9l5 3-5 3V9z"/>');
    const check = saSvg('<circle cx="12" cy="12" r="8"/><path d="M8 12l2.5 2.5L16 9"/>');
    const stop = saSvg('<circle cx="12" cy="12" r="8"/><path d="M9 9l6 6M15 9l-6 6"/>');
    const cards = [
        ['blue', box, 'Total Tickets', rows.length],
        ['orange', wait, 'Pending', count('Pending')],
        ['cyan', play, 'In Progress', count('In Progress')],
        ['green', check, 'Resolved', count('Resolved')],
        ['pink', stop, 'Escalated', count('Escalated')]
    ];
    return `<div class="sa-shop-stats sa-order-stats">${cards.map(([tone, icon, label, value]) =>
        `<article class="sa-card sa-stat sa-tone-${tone}"><div class="sa-stat-top"><span class="sa-ico">${icon}</span><span>${label}</span></div><strong>${saCount(value)}</strong><div class="sa-trend"><span class="sa-up">↑</span></div></article>`
    ).join('')}</div>`;
}

function saTicketTabs() {
    return `<div class="sa-pills">${SA_TICKET_TABS.map(([value, label]) =>
        `<button class="sa-pill-btn${value === saTicketType ? ' is-on' : ''}" type="button" data-ticket-tab="${value}">${label}</button>`
    ).join('')}</div>`;
}

function saTicketRow(row, index) {
    const when = saOrderWhen(row.createdAt);
    return `<tr>
        <td>${index + 1}</td>
        <td><strong>${saText(row.number)}</strong></td>
        <td>${saStatus(row.type)}</td>
        <td>${saText(row.subject)}</td>
        <td>${saText(row.from)}</td>
        <td>${saStatus(row.priority)}</td>
        <td>${saStatus(row.status)}</td>
        <td><strong>${when.day}</strong><small>${when.time}</small></td>
        <td><button class="sa-order-view" type="button" data-ticket-view="${row.id}">View</button></td>
    </tr>`;
}

function saTicketPager(total) {
    const pages = Math.max(1, Math.ceil(total / SA_TICKET_SIZE));
    if (saTicketPage > pages) saTicketPage = pages;
    const start = total ? (saTicketPage - 1) * SA_TICKET_SIZE + 1 : 0;
    const end = Math.min(total, saTicketPage * SA_TICKET_SIZE);
    const buttons = Array.from({ length: pages }, (_, index) => {
        const page = index + 1;
        return `<button class="sa-page-btn${page === saTicketPage ? ' is-on' : ''}" type="button" data-ticket-page="${page}">${page}</button>`;
    }).join('');
    return `<div class="sa-pager"><span class="sa-muted">Showing ${start} – ${end} of ${total} tickets</span><div>${buttons}</div></div>`;
}

function saPaintTickets() {
    saTicketShown = saTicketRows.filter(saTicketMatch);
    const slice = saTicketShown.slice((saTicketPage - 1) * SA_TICKET_SIZE, saTicketPage * SA_TICKET_SIZE);
    const mark = saSvg('<path d="M4 10a8 8 0 0 1 16 0v6H4v-6z"/><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>');
    const search = saSvg('<circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/>');
    document.getElementById('saTickets').innerHTML = `
        <div class="sa-shop-head">
            <div class="sa-shop-title"><div class="sa-shop-mark">${mark}</div><div><h1>Complaints / Support</h1><p class="sa-muted">Handle customer complaints, support tickets and marketplace issues.</p></div></div>
            <div class="sa-quick">
                <button type="button" id="saNewTicket">New Ticket</button>
                <button type="button" id="saBulkReply">Bulk Reply</button>
                <button type="button" id="saAssignTo">Assign To</button>
                <button type="button" id="saExportTickets">Export Tickets</button>
            </div>
        </div>
        ${saTicketCards(saTicketRows)}
        ${saTicketTabs()}
        <div class="sa-shop-tools">
            <select id="saTicketType">${saShopOptions([['All', 'All Types'], ['Customer', 'Customer'], ['Shopkeeper', 'Shopkeeper'], ['Order', 'Order'], ['System', 'System']], saTicketType)}</select>
            <select id="saTicketStatus">${saShopOptions([['All', 'All Status'], ['Pending', 'Pending'], ['In Progress', 'In Progress'], ['Resolved', 'Resolved'], ['Escalated', 'Escalated']], saTicketStatus)}</select>
            <label class="sa-order-dates"><input id="saTicketFrom" type="date" autocomplete="off" value="${saText(saTicketFrom)}" aria-label="From date"><span>–</span><input id="saTicketTo" type="date" autocomplete="off" value="${saText(saTicketTo)}" aria-label="To date"></label>
            <label class="sa-shop-search-wrap">${search}<input class="sa-shop-search" id="saTicketQuery" type="search" placeholder="Search ticket #, customer, shop..." autocomplete="off" value="${saText(saTicketQuery)}"></label>
        </div>
        <section class="sa-card sa-shop-board"><div class="sa-scroll"><table class="sa-table sa-shop-table sa-ticket-table">
            <thead><tr><th>#</th><th>Ticket #</th><th>Type</th><th>Subject</th><th>From</th><th>Priority</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>${slice.map((row, index) => saTicketRow(row, (saTicketPage - 1) * SA_TICKET_SIZE + index)).join('') || `<tr><td colspan="9">${saTicketRows.length ? 'No tickets match these filters.' : 'No support tickets yet.'}</td></tr>`}</tbody>
        </table></div>${saTicketPager(saTicketShown.length)}</section>
        <p class="sa-note-line" id="saTicketNote">${saText(saTicketFlash)}</p>
        <p class="sa-muted">Ticket updates stay in this support list. Shop orders are not changed.</p>`;
    saTicketFlash = '';
    document.getElementById('saTicketQuery').addEventListener('input', (event) => {
        saTicketQuery = event.target.value;
        saTicketPage = 1;
        saTicketFocus = true;
        saPaintTickets();
    });
    document.getElementById('saTicketType').addEventListener('change', (event) => { saTicketType = event.target.value; saTicketPage = 1; saPaintTickets(); });
    document.getElementById('saTicketStatus').addEventListener('change', (event) => { saTicketStatus = event.target.value; saTicketPage = 1; saPaintTickets(); });
    document.getElementById('saTicketFrom').addEventListener('change', (event) => { saTicketFrom = event.target.value; saTicketPage = 1; saPaintTickets(); });
    document.getElementById('saTicketTo').addEventListener('change', (event) => { saTicketTo = event.target.value; saTicketPage = 1; saPaintTickets(); });
    if (saTicketFocus) {
        const box = document.getElementById('saTicketQuery');
        box.focus();
        box.setSelectionRange(box.value.length, box.value.length);
        saTicketFocus = false;
    }
}

async function saMountTickets() {
    const response = await fetch('/api/admin/support/tickets');
    const data = await response.json();
    saTicketRows = data.tickets || [];
    saPaintTickets();
}

function saTicketById(id) {
    return saTicketRows.find((row) => row.id === id);
}
