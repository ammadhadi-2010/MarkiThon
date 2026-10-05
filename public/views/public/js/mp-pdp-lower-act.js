function mpShowTab(root, name) {
    root.querySelectorAll('[data-mptab]').forEach((btn) => {
        const on = btn.getAttribute('data-mptab') === name;
        btn.classList.toggle('on', on);
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    root.querySelectorAll('[data-mppanel]').forEach((panel) => {
        const on = panel.getAttribute('data-mppanel') === name;
        panel.classList.toggle('on', on);
        panel.hidden = !on;
    });
}

function mpSyncQty(root, value) {
    const next = String(Math.max(1, Number(value) || 1));
    ['#mpQty', '#mpDockQty'].forEach((sel) => {
        const input = root.querySelector(sel);
        if (input) input.value = next;
    });
    return Number(next);
}

function mpBindLower(root, row) {
    const tabs = root.querySelector('.mp-tabs');
    if (tabs) {
        tabs.addEventListener('click', (event) => {
            const btn = event.target.closest('[data-mptab]');
            if (btn) mpShowTab(root, btn.getAttribute('data-mptab'));
        });
    }
    const scroller = root.querySelector('#mpAlsoRow');
    const step = () => Math.max(220, Math.round((scroller ? scroller.clientWidth : 280) * 0.8));
    root.querySelector('#mpAlsoPrev')?.addEventListener('click', () => {
        if (scroller) scroller.scrollBy({ left: -step(), behavior: 'smooth' });
    });
    root.querySelector('#mpAlsoNext')?.addEventListener('click', () => {
        if (scroller) scroller.scrollBy({ left: step(), behavior: 'smooth' });
    });
    const buy = root.querySelector('.mp-buy');
    const dock = root.querySelector('#mpDock');
    if (buy && dock) {
        const syncDock = () => {
            const past = buy.getBoundingClientRect().bottom < 80;
            dock.hidden = !past;
            document.body.classList.toggle('mp-dock-on', past);
        };
        document.addEventListener('scroll', syncDock, { passive: true, capture: true });
        window.addEventListener('scroll', syncDock, { passive: true });
        syncDock();
    }
    ['#mpQtyMinus', '#mpQtyPlus'].forEach((sel) => {
        root.querySelector(sel)?.addEventListener('click', () => {
            mpSyncQty(root, root.querySelector('#mpQty')?.value);
        });
    });
    root.querySelector('#mpDockMinus')?.addEventListener('click', () => {
        const current = root.querySelector('#mpDockQty');
        mpSyncQty(root, (Number(current && current.value) || 1) - 1);
    });
    root.querySelector('#mpDockPlus')?.addEventListener('click', () => {
        const current = root.querySelector('#mpDockQty');
        mpSyncQty(root, (Number(current && current.value) || 1) + 1);
    });
    root.querySelector('#mpQty')?.addEventListener('input', (event) => mpSyncQty(root, event.target.value));
    root.querySelector('#mpDockQty')?.addEventListener('input', (event) => mpSyncQty(root, event.target.value));
    root.querySelector('#mpDockCart')?.addEventListener('click', () => {
        const qty = mpSyncQty(root, root.querySelector('#mpDockQty')?.value);
        if (typeof mpAddToCart === 'function') mpAddToCart(row.id, qty);
        if (typeof mpPaintCartBadge === 'function') mpPaintCartBadge(root);
        const btn = root.querySelector('#mpDockCart');
        if (btn) btn.textContent = 'Added';
    });
    root.querySelector('#mpDockBuy')?.addEventListener('click', () => {
        const qty = mpSyncQty(root, root.querySelector('#mpDockQty')?.value);
        if (typeof mpAddToCart === 'function') mpAddToCart(row.id, qty);
        window.location.href = '/contact';
    });
}
