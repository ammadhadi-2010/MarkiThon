function custFind(id) {
    return custRows.find((row) => String(row.id) === String(id));
}

function custWaHref(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    if (!digits) return '';
    const intl = digits.startsWith('0') ? '92' + digits.slice(1) : digits;
    return 'https://wa.me/' + intl;
}

function custCloseMore() {
    document.querySelectorAll('.cust-more.open').forEach((menu) => {
        menu.classList.remove('open');
        const btn = menu.querySelector('.cust-ico.more');
        if (btn) btn.setAttribute('aria-expanded', 'false');
    });
}

function custPlaceDrop(menu) {
    const drop = menu.querySelector('.cust-drop');
    const btn = menu.querySelector('.cust-ico.more');
    if (!drop || !btn) return;
    const box = btn.getBoundingClientRect();
    drop.style.position = 'fixed';
    drop.style.left = 'auto';
    drop.style.right = Math.max(8, window.innerWidth - box.right) + 'px';
    drop.style.top = (box.bottom + 8) + 'px';
    const height = drop.offsetHeight || 220;
    if (window.innerHeight - box.bottom < height + 12 && box.top > height) {
        drop.style.top = (box.top - height - 8) + 'px';
    }
}

function custToggleMore(btn) {
    const menu = btn.closest('.cust-more');
    const open = menu.classList.contains('open');
    custCloseMore();
    if (open) return;
    menu.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    custPlaceDrop(menu);
}

function custOpenLedger(row) {
    const modal = document.getElementById('custLedgerModal');
    if (!modal) return;
    document.getElementById('ledgerCustName').value = row.name;
    document.getElementById('searchCust').value = row.name;
    modal.hidden = false;
    modal.classList.add('open');
    if (typeof searchLedger === 'function') searchLedger().catch((err) => showToast(err.message));
}

function custSendPromo(row) {
    const href = custWaHref(row.whatsapp || row.phone);
    if (!href) {
        showToast('No WhatsApp number on file.');
        return;
    }
    const text = encodeURIComponent(
        'Ammad Hadi Stor: a custom promo is waiting for you. Show this message on your next visit.'
    );
    window.open(href + '?text=' + text, '_blank', 'noopener');
}

async function custToggleVip(row) {
    await api.put('/api/retail/customers/' + row.id, Object.assign({}, row, { vip: !row.vip }));
    showToast(row.vip ? 'VIP tag removed.' : 'Customer marked as VIP.');
    await loadCustDash();
}

async function custDeleteRow(row) {
    const ok = await openConfirmDelete({
        title: 'Delete customer',
        detail: row.name,
        warning: 'This customer will be removed from Ammad Hadi Stor. This cannot be undone.',
        yesLabel: 'Delete Customer'
    });
    if (!ok) return;
    await api.delete('/api/retail/customers/' + row.id);
    showToast('Customer deleted.');
    await loadCustDash();
}

function custRunAct(act, id) {
    const row = custFind(id);
    if (!row && act !== 'more') return;
    if (act === 'view' || act === 'history') {
        if (typeof custOpenDetail === 'function') custOpenDetail(row, 'orders');
        else custOpenLedger(row);
    }
    else if (act === 'edit' && typeof custOpenForm === 'function') custOpenForm(row);
    else if (act === 'call') {
        if (row.phone) window.location.href = 'tel:' + row.phone;
        else showToast('No phone number on file.');
    } else if (act === 'wa') {
        const href = custWaHref(row.whatsapp || row.phone);
        if (href) window.open(href, '_blank', 'noopener');
        else showToast('No WhatsApp number on file.');
    } else if (act === 'promo') custSendPromo(row);
    else if (act === 'vip') custToggleVip(row);
    else if (act === 'delete') custDeleteRow(row);
    else if (act === 'status') custToggleStatus(row);
}

async function custToggleStatus(row) {
    const next = row.status === 'Active' ? 'Inactive' : 'Active';
    await api.put('/api/retail/customers/' + row.id, Object.assign({}, row, { status: next }));
    showToast('Status updated.');
    await loadCustDash();
}

function bindCustActs(root) {
    if (!root || root.dataset.actsBound) return;
    root.dataset.actsBound = '1';
    root.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-custact]');
        if (!btn || !root.contains(btn)) return;
        const wrap = btn.closest('[data-custid]');
        const act = btn.dataset.custact;
        if (act === 'more') {
            event.stopPropagation();
            custToggleMore(btn);
            return;
        }
        custCloseMore();
        custRunAct(act, wrap && wrap.dataset.custid);
    });
}

function bindCustMoreClose() {
    if (document.body.dataset.custMoreBound) return;
    document.body.dataset.custMoreBound = '1';
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.cust-more')) custCloseMore();
    });
    window.addEventListener('scroll', custCloseMore, true);
}
