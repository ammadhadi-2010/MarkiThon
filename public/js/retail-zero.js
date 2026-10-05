function onRtNumFocus(event) {
    const el = event.target;
    if (el.value === '' || el.value === '0' || Number(el.value) === 0) {
        el.value = '';
        return;
    }
    el.select();
}

function updateRtLineQty(input) {
    const index = Number(input.dataset.rtqty);
    if (!rtLines[index]) return;
    const qty = Number(input.value);
    rtLines[index].qty = Number.isFinite(qty) && qty > 0 ? qty : 0;
    const totalCell = input.closest('tr')?.querySelector('.pos-line-total');
    if (totalCell) {
        totalCell.textContent = (rtLines[index].qty * rtLines[index].rate).toLocaleString();
    }
    if (typeof rtTotals === 'function') rtTotals();
}

function bindRtZeroInputs() {
    const disc = document.getElementById('rtDiscount');
    if (disc && !disc.dataset.zeroBound) {
        disc.dataset.zeroBound = '1';
        disc.addEventListener('focus', onRtNumFocus);
        disc.addEventListener('blur', (event) => {
            if (String(event.target.value).trim() === '') event.target.value = '0';
            if (typeof rtTotals === 'function') rtTotals();
        });
    }
    const lines = document.getElementById('rtLines');
    if (!lines || lines.dataset.zeroBound) return;
    lines.dataset.zeroBound = '1';
    lines.addEventListener('focusin', (event) => {
        if (event.target.dataset.rtqty === undefined && event.target.dataset.rtrate === undefined) return;
        onRtNumFocus(event);
    });
    lines.addEventListener('focusout', (event) => {
        const el = event.target;
        if (el.dataset.rtrate !== undefined) {
            if (String(el.value).trim() === '' || Number(el.value) < 0) el.value = '0';
            if (typeof posApplyRateInput === 'function') posApplyRateInput(rtLines, el, 'rtrate');
            if (typeof rtTotals === 'function') rtTotals();
            return;
        }
        if (el.dataset.rtqty === undefined) return;
        if (String(el.value).trim() === '' || Number(el.value) <= 0) el.value = '1';
        updateRtLineQty(el);
    });
    lines.addEventListener('input', (event) => {
        if (event.target.dataset.rtrate !== undefined) {
            if (typeof posApplyRateInput === 'function') posApplyRateInput(rtLines, event.target, 'rtrate');
            if (typeof rtTotals === 'function') rtTotals();
            return;
        }
        if (event.target.dataset.rtqty === undefined) return;
        updateRtLineQty(event.target);
    });
}
