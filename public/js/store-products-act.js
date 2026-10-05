function fillOsCatFilter() {
    const select = document.getElementById('osCatFilter');
    if (!select) return;
    const keep = select.value;
    const names = [...new Set(osProducts.map((p) => p.category).filter(Boolean))];
    select.innerHTML = '<option value="">All Categories</option>' + names.map((name) =>
        `<option>${escapeHtml(name)}</option>`
    ).join('');
    if (names.includes(keep)) select.value = keep;
}

function osPageSlice() {
    const all = osFilterRows();
    const pages = Math.max(1, Math.ceil(all.length / OS_PAGE_SIZE) || 1);
    if (osPage > pages) osPage = pages;
    if (osPage < 1) osPage = 1;
    const start = (osPage - 1) * OS_PAGE_SIZE;
    return { all, pages, start, slice: all.slice(start, start + OS_PAGE_SIZE) };
}

function paintOsFooter(pack) {
    const label = document.getElementById('osPageLabel');
    const pager = document.getElementById('osPager');
    const total = pack.all.length;
    const from = total ? pack.start + 1 : 0;
    const to = pack.start + pack.slice.length;
    if (label) label.textContent = `Showing ${from} - ${to} of ${total} products`;
    if (!pager) return;
    let html = `<button type="button" class="os-page-btn" data-ospage="prev" ${osPage <= 1 ? 'disabled' : ''}>‹</button>`;
    for (let n = 1; n <= pack.pages; n += 1) {
        html += `<button type="button" class="os-page-btn${n === osPage ? ' on' : ''}" data-ospage="${n}">${n}</button>`;
    }
    html += `<button type="button" class="os-page-btn" data-ospage="next" ${osPage >= pack.pages ? 'disabled' : ''}>›</button>`;
    pager.innerHTML = html;
}

function renderOsProducts() {
    const tbody = document.getElementById('osTable');
    if (!tbody) return;
    const pack = osPageSlice();
    tbody.innerHTML = pack.slice.map((p, i) => osRowHtml(p, pack.start + i)).join('')
        || '<tr><td colspan="11" class="empty">No products match these filters.</td></tr>';
    paintOsFooter(pack);
    disableAutofill(tbody);
}

async function loadOsProducts() {
    osProducts = await api.get('/api/store/manage');
    if (!Array.isArray(osProducts)) osProducts = [];
    osPage = 1;
    fillOsCatFilter();
    renderOsProducts();
}

async function patchOsProduct(id, body) {
    const data = await api.put(`/api/online-store/products/${encodeURIComponent(id)}`, body);
    const next = data.product;
    osProducts = osProducts.map((p) => String(p.id) === String(next.id) ? next : p);
    renderOsProducts();
    showToast(data.message);
}

async function moveOsProduct(index, dir) {
    const rows = osFilterRows();
    const from = rows[index];
    const to = rows[index + (dir === 'up' ? -1 : 1)];
    if (!from || !to) return;
    await patchOsProduct(from.id, { storeSortOrder: to.storeSortOrder || index });
    await patchOsProduct(to.id, { storeSortOrder: from.storeSortOrder || index + 1 });
}

function osPreviewProduct() {
    const open = document.getElementById('osViewPublic') || document.getElementById('osOpenLink');
    window.open((open && open.getAttribute('href')) || '/ammadhadistor', '_blank', 'noopener');
}

function closeOsMenus() {
    document.querySelectorAll('.os-more.open').forEach((el) => el.classList.remove('open'));
}

function placeOsMenu(wrap) {
    const drop = wrap.querySelector('.os-more-drop');
    const btn = wrap.querySelector('[data-act="more"]');
    if (!drop || !btn) return;
    const rect = btn.getBoundingClientRect();
    drop.style.top = '0px';
    drop.style.left = '0px';
    const width = drop.offsetWidth || 180;
    const height = drop.offsetHeight || 44;
    let left = rect.right - width;
    if (left < 8) left = 8;
    if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
    let top = rect.bottom + 6;
    if (top + height > window.innerHeight - 8) top = Math.max(8, rect.top - height - 6);
    drop.style.top = `${Math.round(top)}px`;
    drop.style.left = `${Math.round(left)}px`;
}

function bindOsProducts() {
    const root = document.getElementById('osProductsCard');
    if (!root || root.dataset.bound) return;
    root.dataset.bound = '1';
    const reset = () => { osPage = 1; renderOsProducts(); };
    document.getElementById('osSearch').addEventListener('input', reset);
    document.getElementById('osCatFilter').addEventListener('change', reset);
    document.getElementById('osStatusFilter').addEventListener('change', reset);
    document.getElementById('osCheckAll').addEventListener('change', (e) => {
        root.querySelectorAll('#osTable input[type="checkbox"]').forEach((box) => {
            box.checked = e.target.checked;
        });
    });
    root.addEventListener('click', onOsTableClick);
    root.querySelector('.os-table-wrap')?.addEventListener('scroll', () => closeOsMenus());
    window.addEventListener('scroll', () => closeOsMenus(), true);
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.os-more')) closeOsMenus();
    });
    root.addEventListener('change', (e) => {
        const feat = e.target.closest('[data-osfeat]');
        if (!feat) return;
        patchOsProduct(feat.dataset.osfeat, { storeFeatured: feat.checked }).catch((err) => showToast(err.message));
    });
}

function onOsTableClick(e) {
    const page = e.target.closest('[data-ospage]');
    if (page) {
        const key = page.dataset.ospage;
        if (key === 'prev') osPage -= 1;
        else if (key === 'next') osPage += 1;
        else osPage = Number(key) || 1;
        renderOsProducts();
        return;
    }
    const more = e.target.closest('[data-act="more"]');
    if (more) {
        const wrap = more.closest('.os-more');
        const open = !wrap.classList.contains('open');
        closeOsMenus();
        if (open) {
            wrap.classList.add('open');
            placeOsMenu(wrap);
        }
        return;
    }
    const pub = e.target.closest('[data-ospub]');
    if (pub) {
        const row = osProducts.find((p) => String(p.id) === String(pub.dataset.ospub));
        if (row) patchOsProduct(row.id, { storePublished: !row.storePublished }).catch((err) => showToast(err.message));
        return;
    }
    const move = e.target.closest('[data-osmove]');
    if (move) {
        moveOsProduct(Number(move.dataset.osidx), move.dataset.osmove).catch((err) => showToast(err.message));
        return;
    }
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    if (btn.dataset.act === 'preview') osPreviewProduct();
    if (btn.dataset.act === 'edit' && typeof openOsEdit === 'function') {
        openOsEdit(btn.dataset.id);
    }
    if (btn.dataset.act === 'delete') {
        deleteOsProduct(btn.dataset.id).catch((err) => showToast(err.message));
    }
}
