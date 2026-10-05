function reportEsc(value) {
    return String(value || '').replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}

function reportClose() {
    const modal = document.getElementById('reportModal');
    if (modal) modal.remove();
}

function reportOpen(trigger) {
    reportClose();
    const role = trigger.dataset.role === 'Shopkeeper' ? 'Shopkeeper' : 'Customer';
    const kind = trigger.dataset.report || 'product';
    const target = trigger.dataset.target || '';
    const orderNumber = trigger.dataset.order || '';
    const orderId = trigger.dataset.orderId || '';
    const title = role === 'Shopkeeper' ? 'Report to Admin' : (kind === 'order' ? 'Report Issue / Dispute Order' : 'Report Issue');
    const about = orderNumber ? 'Order ' + orderNumber + (orderId ? ' · ID ' + orderId : '') : (target || 'General');
    const reason = kind === 'order'
        ? `<label>Reason</label><select id="rptReason" autocomplete="off"><option>Delayed</option><option>Damaged</option><option>Incorrect item</option><option>Other</option></select>`
        : '';
    const wrap = document.createElement('div');
    wrap.id = 'reportModal';
    wrap.innerHTML = `<form class="rpt-card" autocomplete="off">
        <h2>${title}</h2>
        <p>About: ${reportEsc(about)}</p>
        ${reason}
        <label>Your name</label>
        <input id="rptFrom" autocomplete="off" required>
        <label>Phone</label>
        <input id="rptPhone" autocomplete="off">
        <label>Subject</label>
        <input id="rptSubject" autocomplete="off" required>
        <label>Message</label>
        <textarea id="rptMessage" autocomplete="off" required></textarea>
        <label>Attachment name</label>
        <input id="rptFile" autocomplete="off" placeholder="Optional file name">
        <p class="rpt-note" id="rptNote"></p>
        <div class="rpt-actions">
            <button type="button" id="rptCancel">Cancel</button>
            <button class="rpt-send" type="submit">Send to Admin</button>
        </div>
    </form>`;
    document.body.appendChild(wrap);
    const from = document.getElementById('rptFrom');
    const phone = document.getElementById('rptPhone');
    if (typeof mpBuyer !== 'undefined' && mpBuyer) {
        if (from) from.value = mpBuyer.name || '';
        if (phone && mpBuyer.phone) phone.value = mpBuyer.phone;
    }
    document.getElementById('rptCancel').addEventListener('click', reportClose);
    wrap.addEventListener('click', (event) => { if (event.target === wrap) reportClose(); });
    wrap.querySelector('form').addEventListener('submit', (event) => {
        event.preventDefault();
        const picked = document.getElementById('rptReason');
        const typed = document.getElementById('rptSubject').value.trim();
        const subject = picked ? picked.value + (typed ? ': ' + typed : '') : typed;
        reportSend({
            role, kind, target, orderNumber,
            type: kind === 'order' ? 'Order' : '',
            subject,
            from: document.getElementById('rptFrom').value,
            phone: document.getElementById('rptPhone').value,
            message: document.getElementById('rptMessage').value,
            files: document.getElementById('rptFile').value.trim() ? [document.getElementById('rptFile').value.trim()] : []
        });
    });
}

async function reportSend(body) {
    const note = document.getElementById('rptNote');
    const response = await fetch('/api/support/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        if (note) note.textContent = data.message || 'Could not send the report.';
        return;
    }
    reportClose();
}

document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-report]');
    if (!trigger) return;
    event.preventDefault();
    event.stopPropagation();
    reportOpen(trigger);
}, true);
