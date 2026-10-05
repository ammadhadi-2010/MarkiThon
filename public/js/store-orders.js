function bindOsOrders() {
    const tabs = document.getElementById('osOrdTabs');
    const search = document.getElementById('osOrdSearch');
    const range = document.getElementById('osOrdRange');
    const table = document.getElementById('osOrdersTable');
    const cards = document.getElementById('osOrdersCards');
    const pager = document.getElementById('osOrdPager');
    if (tabs && !tabs.dataset.bound) {
        tabs.dataset.bound = '1';
        tabs.addEventListener('click', (event) => {
            const btn = event.target.closest('[data-osostatus]');
            if (!btn) return;
            osOrdTab = btn.dataset.osostatus;
            osOrdPage = 1;
            paintOsOrders();
        });
    }
    if (search && !search.dataset.bound) {
        search.dataset.bound = '1';
        search.addEventListener('input', () => {
            osOrdQuery = search.value;
            osOrdPage = 1;
            paintOsOrders();
        });
    }
    if (range && !range.dataset.bound) {
        range.dataset.bound = '1';
        range.addEventListener('change', () => {
            osOrdRange = range.value;
            osOrdPage = 1;
            paintOsOrders();
        });
    }
    function bindOsOrdOpen(el) {
        if (!el || el.dataset.bound) return;
        el.dataset.bound = '1';
        el.addEventListener('click', (event) => {
            const open = event.target.closest('[data-osoopen]');
            const row = event.target.closest('[data-osoid]');
            const id = (open && open.dataset.osoopen) || (row && row.dataset.osoid);
            if (id) osOrdDrawerOpen(id);
        });
    }
    bindOsOrdOpen(table);
    bindOsOrdOpen(cards);
    if (pager && !pager.dataset.bound) {
        pager.dataset.bound = '1';
        pager.addEventListener('click', (event) => {
            const btn = event.target.closest('[data-osopage]');
            if (!btn || btn.disabled) return;
            const act = btn.dataset.osopage;
            if (act === 'prev') osOrdPage -= 1;
            else if (act === 'next') osOrdPage += 1;
            else osOrdPage = Number(act) || 1;
            paintOsOrders();
        });
    }
    if (typeof bindOsOrdDrawer === 'function') bindOsOrdDrawer();
    if (typeof bindOsOrdManual === 'function') bindOsOrdManual();
}
