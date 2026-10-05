let recvVoucherCache = [];
let recvVoucherPending = '';

function recvVoucherMenu(id) {
    return `<div class="action-menu">
        <button type="button" class="dots" data-menu="1" title="Actions" aria-haspopup="true">⋮</button>
        <div class="action-drop">
            <button type="button" data-recv-act="print" data-id="${id}">View / Print Receipt</button>
            <button type="button" data-recv-act="edit" data-id="${id}">Edit Receipt</button>
            <button type="button" class="danger" data-recv-act="delete" data-id="${id}">Delete Receipt</button>
        </div>
    </div>`;
}

function formatRecvVoucherDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function voucherRowsFromApi(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.vouchers)) return data.vouchers;
    return null;
}

function paintRecvVouchers(rows) {
    recvVoucherCache = rows.slice();
    const body = document.getElementById('recvVoucherBody');
    if (!body) return;
    if (!recvVoucherCache.length) {
        body.innerHTML = '<tr><td colspan="7" class="empty">No stock receipts recorded yet.</td></tr>';
        return;
    }
    body.innerHTML = recvVoucherCache.map((v) => `
        <tr data-voucher-id="${v.id}">
            <td>${formatRecvVoucherDate(v.date)}</td>
            <td>${escapeHtml(v.billNo || '-')}</td>
            <td>${escapeHtml(v.supplierName || '-')}</td>
            <td>${escapeHtml(v.productTitle || '-')} · ${escapeHtml(v.colors || '-')}</td>
            <td>${Number(v.qty || 0).toLocaleString()} ${escapeHtml(v.unit || 'Meter')}</td>
            <td>Rs. ${Number(v.total || 0).toLocaleString()}<br><span class="recv-pay-tag">${escapeHtml(v.status || '')}</span></td>
            <td class="row-actions">${recvVoucherMenu(v.id)}</td>
        </tr>`).join('');
}

async function fetchReceiptsPayload() {
    try {
        return await api.get('/api/products/vouchers');
    } catch (error) {
        console.error('GET /api/products/vouchers failed', error);
        return await api.get('/api/stock-receipts');
    }
}

let recvFetchTimer = null;
let recvFetchAttempt = 0;
const RECV_FETCH_MAX = 6;

function scheduleRecvFetchRetry() {
    if (recvFetchAttempt >= RECV_FETCH_MAX) return;
    recvFetchAttempt += 1;
    const delay = Math.min(900 * recvFetchAttempt, 5000);
    clearTimeout(recvFetchTimer);
    recvFetchTimer = setTimeout(() => {
        fetchReceipts({ retry: true });
    }, delay);
}

async function fetchReceipts(opts) {
    const retry = Boolean(opts && opts.retry);
    const body = document.getElementById('recvVoucherBody');
    try {
        const data = await fetchReceiptsPayload();
        const rows = voucherRowsFromApi(data);
        if (!rows) {
            console.error('Stock receipts: unexpected payload', data);
            throw new Error('Could not read stock receipts from the server.');
        }
        recvFetchAttempt = 0;
        paintRecvVouchers(rows);
    } catch (error) {
        console.error('Stock receipts fetch failed', {
            url: '/api/products/vouchers',
            attempt: recvFetchAttempt + 1,
            message: error && error.message,
            error
        });
        if (!retry) recvFetchAttempt = 0;
        scheduleRecvFetchRetry();
        if (typeof showToast === 'function' && recvFetchAttempt <= 1) {
            showToast(error.message || 'Could not load stock receipts.');
        }
        if (body && !recvVoucherCache.length) {
            body.innerHTML = '<tr><td colspan="7" class="empty">Connecting to stock receipts...</td></tr>';
        }
    }
}

async function refreshRecvVouchers() {
    recvFetchAttempt = 0;
    clearTimeout(recvFetchTimer);
    return fetchReceipts();
}

function closeRecvVoucherDel() {
    document.getElementById('recvVoucherDel')?.classList.remove('open');
    recvVoucherPending = '';
}

function openRecvVoucherDel(id) {
    recvVoucherPending = id;
    const row = recvVoucherCache.find((v) => String(v.id) === String(id));
    const text = document.getElementById('recvVoucherDelText');
    if (text) {
        text.textContent = row
            ? `Are you sure you want to delete voucher #${row.billNo} ?`
            : 'Are you sure you want to delete this receipt?';
    }
    document.getElementById('recvVoucherDel')?.classList.add('open');
}

async function confirmRecvVoucherDelete() {
    const id = recvVoucherPending;
    if (!id) return;
    try {
        const data = await api.del(`/api/products/vouchers/${encodeURIComponent(id)}`);
        closeRecvVoucherDel();
        showToast(data.message || 'Receipt deleted.');
        const editing = document.getElementById('recvVoucherId')?.value;
        if (editing && String(editing) === String(id) && typeof resetRecvForm === 'function') resetRecvForm();
        await refreshRecvVouchers();
        if (typeof loadProducts === 'function') await loadProducts();
        if (typeof loadSuppliers === 'function') await loadSuppliers();
        if (typeof refreshStockView === 'function') await refreshStockView();
    } catch (error) {
        showToast(error.message);
    }
}

function bindRecvVouchers() {
    const body = document.getElementById('recvVoucherBody');
    if (!body) return;
    if (!body.dataset.bound) {
        body.dataset.bound = '1';
        body.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-recv-act]');
            if (!btn) return;
            e.preventDefault();
            e.stopPropagation();
            document.querySelectorAll('.action-menu.open').forEach((menu) => menu.classList.remove('open'));
            const act = btn.dataset.recvAct;
            if (act === 'print' && typeof printRecvVoucher === 'function') printRecvVoucher(btn.dataset.id);
            if (act === 'edit' && typeof editRecvVoucher === 'function') {
                editRecvVoucher(btn.dataset.id).catch((err) => showToast(err.message));
            }
            if (act === 'delete') openRecvVoucherDel(btn.dataset.id);
        });
        document.getElementById('recvVoucherDelNo')?.addEventListener('click', closeRecvVoucherDel);
        document.getElementById('recvVoucherDelYes')?.addEventListener('click', () => {
            confirmRecvVoucherDelete();
        });
    }
    fetchReceipts();
}
