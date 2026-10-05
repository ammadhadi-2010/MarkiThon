function onWsNumFocus(event) {
    const el = event.target;
    if (el.value === '' || el.value === '0' || Number(el.value) === 0) {
        el.value = '';
        return;
    }
    el.select();
}

function updateWsLineQty(input) {
    const index = Number(input.dataset.wsqty);
    if (!wsLines[index]) return;
    const qty = Number(input.value);
    wsLines[index].qty = Number.isFinite(qty) && qty > 0 ? qty : 0;
    const totalCell = input.closest('tr')?.querySelector('.pos-line-total');
    if (totalCell) {
        totalCell.textContent = (wsLines[index].qty * wsLines[index].rate).toLocaleString();
    }
    if (typeof wsTotals === 'function') wsTotals();
}

function bindWsZeroInputs() {
    const disc = document.getElementById('wsDiscount');
    if (disc && !disc.dataset.zeroBound) {
        disc.dataset.zeroBound = '1';
        disc.addEventListener('focus', onWsNumFocus);
        disc.addEventListener('blur', (event) => {
            if (String(event.target.value).trim() === '') event.target.value = '0';
            if (typeof wsTotals === 'function') wsTotals();
        });
    }
    const lines = document.getElementById('wsLines');
    if (!lines || lines.dataset.zeroBound) return;
    lines.dataset.zeroBound = '1';
    lines.addEventListener('focusin', (event) => {
        if (event.target.dataset.wsqty === undefined) return;
        onWsNumFocus(event);
    });
    lines.addEventListener('focusout', (event) => {
        if (event.target.dataset.wsqty === undefined) return;
        const el = event.target;
        if (String(el.value).trim() === '' || Number(el.value) <= 0) el.value = '1';
        updateWsLineQty(el);
    });
    lines.addEventListener('input', (event) => {
        if (event.target.dataset.wsqty === undefined) return;
        updateWsLineQty(event.target);
    });
}
