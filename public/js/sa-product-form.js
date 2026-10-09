function saProdFields(row) {
    const item = row || { title: '', shop: '', category: 'Fabrics', price: '', was: '', unit: 'Pcs', stock: 0, status: 'Pending', tag: '' };
    const choice = (list, current) => list.map((name) => `<option value="${name}"${name === current ? ' selected' : ''}>${name || 'None'}</option>`).join('');
    const lock = item.locked ? ' disabled' : '';
    const note = item.locked ? '<p class="sa-muted">Title, price, and stock stay in the shopkeeper catalog. Status and tag save here.</p>' : '';
    const cats = saProdCatList();
    const catOpts = cats.length ? cats : ['Other'];
    return `${note}<label>Product title</label><input id="saFormTitle" autocomplete="off" value="${saText(item.title)}"${lock}>
        <label>Shop</label><input id="saFormShop" autocomplete="off" value="${saText(item.shop)}"${lock}>
        <label>Category</label><select id="saFormCategory"${lock}>${choice(catOpts, item.category)}</select>
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

function saApplyProdPayload(data) {
    if (data.products) saProdRows = data.products;
    saProdFlash = data.message || 'Products updated.';
    saPaintProducts();
}

async function saProdApi(url, options) {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        saProdFlash = data.message || 'Could not update products.';
        saPaintProducts();
        return null;
    }
    return data;
}

async function saProdSetStatus(id, status) {
    const data = await saProdApi('/api/admin/products/' + encodeURIComponent(id) + '/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
    if (data) saApplyProdPayload(data);
}

async function saProdDeleteIds(ids) {
    if (!ids.length) return;
    if (ids.length === 1) {
        const data = await saProdApi('/api/admin/products/' + encodeURIComponent(ids[0]), { method: 'DELETE' });
        if (data) {
            ids.forEach((id) => saProdPick.delete(String(id)));
            saApplyProdPayload(data);
        }
        return;
    }
    const data = await saProdApi('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action: 'delete' })
    });
    if (data) {
        ids.forEach((id) => saProdPick.delete(String(id)));
        saApplyProdPayload(data);
    }
}

async function saProdBulk(action) {
    const ids = [...saProdPick];
    if (!ids.length) {
        saProdFlash = 'Select products first.';
        saPaintProducts();
        return;
    }
    if (action === 'delete') {
        saConfirmProdDelete(ids);
        return;
    }
    const data = await saProdApi('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action })
    });
    if (data) saApplyProdPayload(data);
}

function saConfirmProdDelete(ids) {
    const label = ids.length === 1
        ? `Delete "${saText((saProdById(ids[0]) || {}).title || 'this product')}" permanently?`
        : `Delete ${ids.length} selected products permanently?`;
    saShopModal('Confirm Delete', `<p>${label}</p><p class="sa-muted">This removes the product from the database and marketplace.</p>`,
        '<button type="button" id="saFormCancel">Cancel</button><button class="sa-add sa-danger" type="button" id="saProdConfirmDel">Delete</button>');
    document.getElementById('saFormCancel').addEventListener('click', () => document.getElementById('saShopModal').remove());
    document.getElementById('saProdConfirmDel').addEventListener('click', async () => {
        document.getElementById('saShopModal').remove();
        await saProdDeleteIds(ids.map(String));
    });
}

async function saProdSend(url, body) {
    const data = await saProdApi(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!data) return;
    const modal = document.getElementById('saShopModal');
    if (modal) modal.remove();
    if (data.products) saApplyProdPayload(data);
    else await saMountProducts();
}

function saOpenProdForm(row) {
    const editing = row && row.id;
    saShopModal(editing ? 'Edit Product' : 'Add Product', saProdFields(row),
        '<button type="button" id="saFormCancel">Cancel</button><button class="sa-add" type="submit">Save Product</button>');
    document.getElementById('saFormCancel').addEventListener('click', () => document.getElementById('saShopModal').remove());
    document.querySelector('#saShopModal form').addEventListener('submit', (event) => {
        event.preventDefault();
        const body = saProdBody();
        if (editing) {
            saProdSend('/api/platform/products/' + row.id, body);
            return;
        }
        saProdSend('/api/platform/products', body);
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
    const edit = event.target.closest('[data-prod-edit]');
    const publish = event.target.closest('[data-prod-publish]');
    const hide = event.target.closest('[data-prod-hide]');
    const del = event.target.closest('[data-prod-del]');
    const pill = event.target.closest('[data-prod-pill]');
    const bulk = event.target.closest('[data-prod-bulk]');
    if (add) saOpenProdForm(null);
    if (like) {
        const id = like.dataset.prodLike;
        if (saProdLikes.has(id)) saProdLikes.delete(id);
        else saProdLikes.add(id);
        like.classList.toggle('is-on');
    }
    if (edit) {
        const row = saProdById(edit.dataset.prodEdit);
        if (row) saOpenProdForm(row);
    }
    if (publish) saProdSetStatus(publish.dataset.prodPublish, 'published');
    if (hide) saProdSetStatus(hide.dataset.prodHide, 'hidden');
    if (del) saConfirmProdDelete([del.dataset.prodDel]);
    if (pill) { saProdCategory = pill.dataset.prodPill; saPaintProducts(); }
    if (event.target.closest('#saProdAll')) {
        saProdQuery = '';
        saProdCategory = 'All';
        saProdShop = 'All';
        saProdSort = 'Newest';
        saPaintProducts();
    }
    if (bulk) saProdBulk(bulk.dataset.prodBulk);
});
