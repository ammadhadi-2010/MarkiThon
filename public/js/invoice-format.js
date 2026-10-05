const INV_FORMAT_KEY = 'markithon-print-format';

function currentInvFormat() {
    return document.querySelector('input[name="invPrintFormat"]:checked')?.value || 'thermal';
}

function applyInvFormat(mode) {
    const value = mode === 'a4' ? 'a4' : 'thermal';
    const back = document.getElementById('invoiceBack');
    if (back) {
        back.classList.toggle('print-a4', value === 'a4');
        back.classList.toggle('print-thermal', value === 'thermal');
    }
    document.documentElement.classList.toggle('print-a4', value === 'a4');
    document.documentElement.classList.toggle('print-thermal', value === 'thermal');
    document.querySelectorAll('input[name="invPrintFormat"]').forEach((el) => {
        el.checked = el.value === value;
    });
    try { localStorage.setItem(INV_FORMAT_KEY, value); } catch (error) { /* ignore */ }
}

function bindInvFormat() {
    const bar = document.getElementById('invFormatBar');
    if (!bar || bar.dataset.bound) return;
    bar.dataset.bound = '1';
    let saved = 'thermal';
    try { saved = localStorage.getItem(INV_FORMAT_KEY) || 'thermal'; } catch (error) { saved = 'thermal'; }
    applyInvFormat(saved);
    bar.addEventListener('change', (event) => {
        if (event.target.name === 'invPrintFormat') applyInvFormat(event.target.value);
    });
}

function clearInvFormatClass() {
    document.documentElement.classList.remove('print-a4', 'print-thermal');
}
