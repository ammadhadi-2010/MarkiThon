const RECV_ZERO_IDS = [
    'recvThaan', 'recvPerThaan', 'recvQty',
    'recvPurchase', 'recvAmount', 'recvWholesale', 'recvRetail', 'recvMinRate', 'recvPaidNow'
];

function recvEmptyIfZero(value) {
    const n = Number(value);
    return n > 0 ? String(value) : '';
}

function onRecvZeroFocus(event) {
    const el = event.target;
    if (el.value === '' || Number(el.value) === 0) el.value = '';
    else el.select();
}

function onRecvZeroBlur(event) {
    const el = event.target;
    if (el.value.trim() === '' || Number(el.value) === 0) el.value = '';
    if (typeof paintRecvTotals === 'function') paintRecvTotals();
}

function bindRecvZeroInputs() {
    RECV_ZERO_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (!el || el.dataset.zeroBound) return;
        el.dataset.zeroBound = '1';
        el.addEventListener('focus', onRecvZeroFocus);
        el.addEventListener('blur', onRecvZeroBlur);
    });
}
