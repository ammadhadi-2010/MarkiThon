function saProdFields(row) {
    const item = row || { title: '', shop: '', category: 'Fabrics', price: '', was: '', unit: 'Pcs', stock: 0, status: 'Pending', tag: '' };
    const choice = (list, current) => list.map((name) => `<option value="${name}"${name === current ? ' selected' : ''}>${name || 'None'}</option>`).join('');
    const lock = item.locked ? ' disabled' : '';
    const note = item.locked ? '<p class="sa-muted">Title, price, and stock stay in the shopkeeper catalog. Status and tag save here.</p>' : '';
    return `${note}<label>Product title</label><input id="saFormTitle" autocomplete="off" value="${saText(item.title)}"${lock}>
        <label>Shop</label><input id="saFormShop" autocomplete="off" value="${saText(item.shop)}"${lock}>
        <label>Category</label><select id="saFormCategory"${lock}>${choice(saProdCatList(), item.category)}</select>
        <label>Price</label><input id="saFormPrice" type="number" min="1" autocomplete="off" value="${item.price}"${lock}>
        <label>Original price</label><input id="saFormWas" type="number" min="0" autocomplete="off" value="${item.was || ''}"${lock}>
        <label>Unit</label><input id="saFormUnit" autocomplete="off" value="${saText(item.unit || 'Pcs')}"${lock}>
        <label>Stock</label><input id="saFormStock" type="number" min="0" autocomplete="off" value="${item.stock || 0}"${lock}>
        <label>Status</label><select id="saFormStatus">${choice(['Published', 'Hidden', 'Pending'], item.status || 'Pending')}</select>
        <label>Tag</label><select id="saFormTag">${choice(['', 'Featured', 'New', 'Sale'], item.tag || '')}</select>`;
}

function saProdBody() {
    return {
        title: document.getElementById('saFormTitle').value,
        shop: document.getElementById('saFormShop').value,
        category: document.getElementById('saFormCategory').value,
        price: document.getElementById('saFormPrice').value,
        was: document.getElementById('saFormWas').value,
        unit: document.getElementById('saFormUnit').value,
        stock: document.getElementById('saFormStock').value,
        status: document.getElementById('saFormStatus').value,
        tag: document.getElementById('saFormTag').value
    };
}

async function saProdSend(url, body) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    const note = document.getElementById('saFormNote');
    if (!response.ok) {
        if (note) note.textContent = data.message || 'Could not save the product.';
        else saProdFlash = data.message || 'Could not save the product.';
        if (!note) saPaintProducts();
        return;
    }
    const modal = document.getElementById('saShopModal');
    if (modal) modal.remove();
    saProdFlash = data.message || 'Products updated.';
    if (data.products) saProdRows = data.products;
    if (body.action === 'delete') (body.ids || []).forEach((id) => saProdPick.delete(id));
    if (data.products) saPaintProducts();
    else await saMountProducts();
}

function saOpenProdForm(row) {
    const editing = row && row.id;
    saShopModal(editing ? 'Edit Product' : 'Add Product', saProdFields(row),
        '<button type="button" id="saFormCancel">Cancel</button><button class="sa-add" type="submit">Save Product</button>');
    document.getElementById('saFormCancel').addEventListener('click', () => document.getElementById('saShopModal').remove());
    document.querySelector('#saShopModal form').addEventListener('submit', (event) => {
        event.preventDefault();
        saProdSend(editing ? '/api/platform/products/' + row.id : '/api/platform/products', saProdBody());
    });
}

function saOpenProdView(row) {
    const off = row.was > row.price ? Math.round((1 - row.price / row.was) * 100) + '% OFF' : 'None';
    const body = `<div class="sa-detail">
        <div><span>Shop</span><strong>${saText(row.shop)}</strong></div>
        <div><span>Category</span><strong>${saText(row.category)}</strong></div>
        <div><span>Price</span><strong>${saMoney(row.price)} / ${saText(row.unit)}</strong></div>
        <div><span>Original</span><strong>${row.was ? saMoney(row.was) : 'Not set'}</strong></div>
        <div><span>Discount</span><strong>${off}</strong></div>
        <div><span>Stock</span><strong>${saCount(row.stock)}</strong></div>
        <div><span>Status</span><strong>${saText(row.status)}</strong></div>
    </div>`;
    saShopModal(saText(row.title), body, '<button type="button" id="saFormCancel">Close</button>');
    document.getElementById('saFormCancel').addEventListener('click', () => document.getElementById('saShopModal').remove());
}

function saOpenProdMenu(id, button) {
    const old = document.getElementById('saProdMenu');
    if (old) old.remove();
    const menu = document.createElement('div');
    menu.id = 'saProdMenu';
    menu.className = 'sa-menu-pop';
    menu.innerHTML = ['Published', 'Hidden', 'Pending'].map((status) =>
        `<button type="button" data-prod-status="${status}" data-prod-id="${id}">Mark ${status}</button>`).join('')
        + `<button type="button" data-prod-status="delete" data-prod-id="${id}">Delete</button>`;
    const box = button.getBoundingClientRect();
    menu.style.top = (window.scrollY + box.bottom + 6) + 'px';
    menu.style.left = (window.scrollX + box.right - 150) + 'px';
    document.body.appendChild(menu);
}

document.addEventListener('change', (event) => {
    const pick = event.target.closest('[data-prod-pick]');
    if (!pick) return;
    if (pick.checked) saProdPick.add(pick.dataset.prodPick);
    else saProdPick.delete(pick.dataset.prodPick);
    const count = document.getElementById('saProdCount');
    if (count) count.textContent = saProdPick.size + ' Products selected';
});

document.addEventListener('click', (event) => {
    const add = event.target.closest('#saAddProduct');
    const like = event.target.closest('[data-prod-like]');
    const view = event.target.closest('[data-prod-view]');
    const edit = event.target.closest('[data-prod-edit]');
    const hide = event.target.closest('[data-prod-hide]');
    const more = event.target.closest('[data-prod-more]');
    const pill = event.target.closest('[data-prod-pill]');
    const bulk = event.target.closest('[data-prod-bulk]');
    const status = event.target.closest('[data-prod-status]');
    if (add) saOpenProdForm(null);
    if (like) {
        const id = like.dataset.prodLike;
        if (saProdLikes.has(id)) saProdLikes.delete(id);
        else saProdLikes.add(id);
        like.classList.toggle('is-on');
    }
    if (view) {
        const row = saProdById(view.dataset.prodView);
        if (row) saOpenProdView(row);
    }
    if (edit) {
        const row = saProdById(edit.dataset.prodEdit);
        if (row) saOpenProdForm(row);
    }
    if (hide) {
        const row = saProdById(hide.dataset.prodHide);
        if (row) saProdSend('/api/platform/products/' + row.id, { ...row, status: row.status === 'Published' ? 'Hidden' : 'Published' });
    }
    if (more) saOpenProdMenu(more.dataset.prodMore, more);
    if (pill) { saProdCategory = pill.dataset.prodPill; saPaintProducts(); }
    if (event.target.closest('#saProdAll')) {
        saProdQuery = '';
        saProdCategory = 'All';
        saProdShop = 'All';
        saProdSort = 'Newest';
        saPaintProducts();
    }
    if (bulk && !saProdPick.size) {
        saProdFlash = 'Select products first.';
        saPaintProducts();
    } else if (bulk) saProdSend('/api/platform/products/bulk', { ids: [...saProdPick], action: bulk.dataset.prodBulk });
    if (status) {
        const id = status.dataset.prodId;
        document.getElementById('saProdMenu').remove();
        const action = status.dataset.prodStatus;
        if (action === 'delete') saProdSend('/api/platform/products/bulk', { ids: [id], action: 'delete' });
        else saProdSend('/api/platform/products/' + id, { ...saProdById(id), status: action });
    }
    if (!more && !event.target.closest('#saProdMenu')) {
        const menu = document.getElementById('saProdMenu');
        if (menu) menu.remove();
    }
});
