async function loadCustDash(opts) {
    const root = document.getElementById('view-customers');
    if (!root) return;
    if (!document.getElementById('custPage')) {
        root.innerHTML = customersMarkup();
        disableAutofill(root);
        bindCustDash();
    }
    const data = await api.get('/api/retail/customers/hub');
    custRows = Array.isArray(data.customers) ? data.customers : [];
    custStats = data.stats || custStats;
    custAreas = Array.isArray(data.areas) ? data.areas : [];
    paintCustAreas();
    if (!(opts && opts.keepPage)) custPage = 1;
    paintCustTable();
    if (custDetailId && typeof paintCustDetail === 'function') {
        const open = custFind(custDetailId);
        if (open) paintCustDetail(open);
    }
}

function bindCustDash() {
    const search = document.getElementById('custSearch');
    const kind = document.getElementById('custKind');
    const area = document.getElementById('custArea');
    const range = document.getElementById('custRange');
    const pager = document.getElementById('custPager');
    const all = document.getElementById('custCheckAll');
    if (search && !search.dataset.bound) {
        search.dataset.bound = '1';
        search.addEventListener('input', () => {
            custQuery = search.value;
            custPage = 1;
            paintCustTable();
        });
    }
    function bindSel(el, apply) {
        if (!el || el.dataset.bound) return;
        el.dataset.bound = '1';
        el.addEventListener('change', () => {
            apply(el.value);
            custPage = 1;
            paintCustTable();
        });
    }
    bindSel(kind, (v) => { custKind = v; });
    bindSel(area, (v) => { custArea = v; });
    bindSel(range, (v) => { custRange = v; });
    if (pager && !pager.dataset.bound) {
        pager.dataset.bound = '1';
        pager.addEventListener('click', (event) => {
            const btn = event.target.closest('[data-custpage]');
            if (!btn || btn.disabled) return;
            const act = btn.dataset.custpage;
            if (act === 'prev') custPage -= 1;
            else if (act === 'next') custPage += 1;
            else custPage = Number(act) || 1;
            paintCustTable();
        });
    }
    if (all && !all.dataset.bound) {
        all.dataset.bound = '1';
        all.addEventListener('change', () => {
            document.querySelectorAll('#custTable input[type="checkbox"]').forEach((box) => {
                box.checked = all.checked;
            });
        });
    }
    bindCustActs(document.getElementById('custTable'));
    bindCustActs(document.getElementById('custCards'));
    if (typeof bindCustMoreClose === 'function') bindCustMoreClose();
    if (typeof bindCustForm === 'function') bindCustForm();
    if (typeof bindCustDetail === 'function') bindCustDetail();
    const ledger = document.getElementById('custLedgerModal');
    const close = document.getElementById('custLedgerClose');
    if (close && !close.dataset.bound) {
        close.dataset.bound = '1';
        close.addEventListener('click', () => {
            ledger.classList.remove('open');
            ledger.hidden = true;
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('view-customers');
    if (!root) return;
    if (document.getElementById('custPage')) return;
    root.innerHTML = customersMarkup();
    disableAutofill(root);
    bindCustDash();
});
