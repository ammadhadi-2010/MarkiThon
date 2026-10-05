function saCatFields(row) {
    return `<label>Slug</label><input id="saFormSlug" autocomplete="off" value="${saText(row.slug)}">
        <label>Status</label><select id="saFormCatStatus"><option${row.status === 'Active' ? ' selected' : ''}>Active</option><option${row.status === 'Inactive' ? ' selected' : ''}>Inactive</option></select>`;
}

async function saCatSend(id, body) {
    const response = await fetch('/api/admin/categories/' + encodeURIComponent(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    const note = document.getElementById('saFormNote');
    if (!response.ok) {
        if (note) note.textContent = data.message || 'Could not update the category.';
        else saCatFlash = data.message || 'Could not update the category.';
        if (!note) saPaintCategories();
        return;
    }
    const modal = document.getElementById('saShopModal');
    if (modal) modal.remove();
    saCatFlash = data.message || 'Category updated.';
    await saMountCategories();
}

function saOpenCatEdit(row) {
    saShopModal('Edit ' + saText(row.name), saCatFields(row),
        '<button type="button" id="saFormCancel">Cancel</button><button class="sa-add" type="submit">Save Category</button>');
    document.getElementById('saFormCancel').addEventListener('click', () => document.getElementById('saShopModal').remove());
    document.querySelector('#saShopModal form').addEventListener('submit', (event) => {
        event.preventDefault();
        saCatSend(row.id, {
            slug: document.getElementById('saFormSlug').value,
            status: document.getElementById('saFormCatStatus').value
        });
    });
}

function saOpenCatView(row) {
    const body = `<div class="sa-detail">
        <div><span>Name</span><strong>${saText(row.name)}</strong></div>
        <div><span>Slug</span><strong>${saText(row.slug)}</strong></div>
        <div><span>Products</span><strong>${saCount(row.products)}</strong></div>
        <div><span>Status</span><strong>${saText(row.status)}</strong></div>
    </div>`;
    saShopModal(saText(row.name), body, '<button type="button" id="saFormCancel">Close</button>');
    document.getElementById('saFormCancel').addEventListener('click', () => document.getElementById('saShopModal').remove());
}

function saOpenCatMenu(id, button) {
    const old = document.getElementById('saCatMenu');
    if (old) old.remove();
    const menu = document.createElement('div');
    menu.id = 'saCatMenu';
    menu.className = 'sa-menu-pop';
    menu.innerHTML = ['Active', 'Inactive'].map((status) =>
        `<button type="button" data-cat-status="${status}" data-cat-id="${id}">Mark ${status}</button>`).join('');
    const box = button.getBoundingClientRect();
    menu.style.top = (window.scrollY + box.bottom + 6) + 'px';
    menu.style.left = (window.scrollX + box.right - 150) + 'px';
    document.body.appendChild(menu);
}

document.addEventListener('click', (event) => {
    const pick = event.target.closest('[data-cat-pick]');
    const edit = event.target.closest('[data-cat-edit]');
    const view = event.target.closest('[data-cat-view]');
    const more = event.target.closest('[data-cat-more]');
    const page = event.target.closest('[data-cat-page]');
    const status = event.target.closest('[data-cat-status]');
    if (pick) { saCatPick = pick.dataset.catPick; saCatPage = 1; saPaintCategories(); }
    if (edit) {
        const row = saCatById(edit.dataset.catEdit);
        if (row) saOpenCatEdit(row);
    }
    if (view) {
        const row = saCatById(view.dataset.catView);
        if (row) saOpenCatView(row);
    }
    if (more) saOpenCatMenu(more.dataset.catMore, more);
    if (page) { saCatPage = Number(page.dataset.catPage); saPaintCategories(); }
    if (status) {
        const row = saCatById(status.dataset.catId);
        document.getElementById('saCatMenu').remove();
        if (row) saCatSend(row.id, { slug: row.slug, status: status.dataset.catStatus });
    }
    if (!more && !event.target.closest('#saCatMenu')) {
        const menu = document.getElementById('saCatMenu');
        if (menu) menu.remove();
    }
});
