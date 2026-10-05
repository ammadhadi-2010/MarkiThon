function saShopFields(row) {
    const shop = row || { name: '', owner: '', phone: '', package: 'Standard', months: 3, status: 'Pending' };
    return `<label>Shop name</label><input id="saFormName" autocomplete="off" value="${saText(shop.name)}">
        <label>Owner</label><input id="saFormOwner" autocomplete="off" value="${saText(shop.owner)}">
        <label>Phone</label><input id="saFormPhone" autocomplete="off" value="${saText(shop.phone)}">
        <label>Package</label><select id="saFormPack"><option${shop.package === 'Standard' ? ' selected' : ''}>Standard</option><option${shop.package === 'Premium' ? ' selected' : ''}>Premium</option></select>
        <label>Duration in months</label><input id="saFormMonths" type="number" min="1" max="24" autocomplete="off" value="${shop.months || 3}">`;
}

function saShopModal(title, body, actions) {
    const old = document.getElementById('saShopModal');
    if (old) old.remove();
    const wrap = document.createElement('div');
    wrap.id = 'saShopModal';
    wrap.className = 'sa-modal-back';
    wrap.innerHTML = `<form class="sa-card sa-modal" autocomplete="off"><h3>${title}</h3>${body}<div class="sa-modal-actions">${actions}</div><p class="sa-note-line" id="saFormNote"></p></form>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('click', (event) => { if (event.target === wrap) wrap.remove(); });
    return wrap;
}

function saShopBody() {
    return {
        name: document.getElementById('saFormName').value,
        owner: document.getElementById('saFormOwner').value,
        phone: document.getElementById('saFormPhone').value,
        package: document.getElementById('saFormPack').value,
        months: document.getElementById('saFormMonths').value,
        status: document.getElementById('saFormStatus') ? document.getElementById('saFormStatus').value : 'Pending'
    };
}

async function saShopSend(id, body) {
    const response = await fetch(id ? '/api/platform/shops/' + id : '/api/platform/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    const note = document.getElementById('saFormNote') || document.getElementById('saShopNote');
    if (!response.ok) {
        if (note) note.textContent = data.message || 'Could not save the shop.';
        return;
    }
    const modal = document.getElementById('saShopModal');
    if (modal) modal.remove();
    await saMountShops();
}

function saOpenShopForm(row) {
    const editing = row && row.id;
    saShopModal(editing ? 'Edit Shop' : 'Add New Shop', saShopFields(row),
        '<button type="button" id="saFormCancel">Cancel</button><button class="sa-add" type="submit">Save Shop</button>');
    document.getElementById('saFormCancel').addEventListener('click', () => document.getElementById('saShopModal').remove());
    document.querySelector('#saShopModal form').addEventListener('submit', (event) => {
        event.preventDefault();
        if (row && row.locked) {
            document.getElementById('saFormNote').textContent = 'The live shop is changed from shopkeeper settings.';
            return;
        }
        saShopSend(editing ? row.id : '', saShopBody());
    });
}

function saOpenShopMenu(id, button) {
    const old = document.getElementById('saShopMenu');
    if (old) old.remove();
    const menu = document.createElement('div');
    menu.id = 'saShopMenu';
    menu.className = 'sa-menu-pop';
    menu.innerHTML = ['Active', 'Pending', 'Suspended'].map((status) =>
        `<button type="button" data-shop-status="${status}" data-shop-id="${id}">Mark ${status}</button>`).join('');
    const box = button.getBoundingClientRect();
    menu.style.top = (window.scrollY + box.bottom + 6) + 'px';
    menu.style.left = (window.scrollX + box.right - 150) + 'px';
    document.body.appendChild(menu);
}

document.addEventListener('click', (event) => {
    const add = event.target.closest('#saAddShop');
    const view = event.target.closest('[data-shop-view]');
    const edit = event.target.closest('[data-shop-edit]');
    const more = event.target.closest('[data-shop-more]');
    const page = event.target.closest('[data-shop-page]');
    const status = event.target.closest('[data-shop-status]');
    if (add) saOpenShopForm(null);
    if (view) location.assign('/admin/shops/' + encodeURIComponent(view.dataset.shopView));
    if (edit) saOpenShopForm(saShopById(edit.dataset.shopEdit));
    if (more) saOpenShopMenu(more.dataset.shopMore, more);
    if (page) { saShopPage = Number(page.dataset.shopPage); saPaintShops(); }
    if (status) {
        const row = saShopById(status.dataset.shopId);
        document.getElementById('saShopMenu').remove();
        if (!row || row.locked) return location.assign('/admin/shops/live-shop');
        saShopSend(row.id, { ...row, status: status.dataset.shopStatus });
    }
    if (!more && !event.target.closest('#saShopMenu')) {
        const menu = document.getElementById('saShopMenu');
        if (menu) menu.remove();
    }
});
