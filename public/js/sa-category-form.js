async function saCatApi(url, method, body) {
    const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json();
    if (!response.ok) {
        const note = document.getElementById('saFormNote');
        if (note) note.textContent = data.message || 'Request failed.';
        else {
            saCatFlash = data.message || 'Request failed.';
            saPaintCategories();
        }
        return null;
    }
    const modal = document.getElementById('saShopModal');
    if (modal) modal.remove();
    saCatFlash = data.message || 'Saved.';
    if (data.shopTypes) saCatTree = data.shopTypes;
    else await saMountCategories();
    saPaintCategories();
    return data;
}

function saCatModalFields(shopType, mode, parents) {
    const options = (parents || []).map((name) =>
        `<option value="${saText(name)}">${saText(name)}</option>`).join('');
    if (mode === 'sub') {
        return `<label>Shop Type</label>
            <input value="${saText(shopType)}" disabled>
            <label>Main Category</label>
            <select id="saFormParent" required>
                <option value="">Select category</option>${options}
            </select>
            <label>Subcategory Name</label>
            <input id="saFormCatName" autocomplete="off" required placeholder="e.g. Shalwar Kameez">`;
    }
    if (mode === 'edit') {
        return `<label>Name</label>
            <input id="saFormCatName" autocomplete="off" required>`;
    }
    return `<label>Shop Type</label>
        <input value="${saText(shopType)}" disabled>
        <label>Main Category Name</label>
        <input id="saFormCatName" autocomplete="off" required placeholder="e.g. Men's Clothing">`;
}

function saOpenAddCategory(shopType) {
    saShopModal('Add Category — ' + saText(shopType), saCatModalFields(shopType, 'add'),
        '<button type="button" id="saFormCancel">Cancel</button><button class="sa-add" type="submit">Save Category</button>');
    document.getElementById('saFormCancel').onclick = () => document.getElementById('saShopModal').remove();
    document.querySelector('#saShopModal form').onsubmit = (event) => {
        event.preventDefault();
        saCatApi('/api/admin/categories', 'POST', {
            shopType,
            name: document.getElementById('saFormCatName').value
        });
    };
}

function saOpenAddSubcategory(shopType) {
    const group = saCatGroup(shopType);
    const parents = (group && group.categories || []).map((row) => row.name);
    if (!parents.length) {
        saCatFlash = 'Add a main category first.';
        saPaintCategories();
        return;
    }
    saShopModal('Add Subcategory — ' + saText(shopType), saCatModalFields(shopType, 'sub', parents),
        '<button type="button" id="saFormCancel">Cancel</button><button class="sa-add" type="submit">Save Subcategory</button>');
    document.getElementById('saFormCancel').onclick = () => document.getElementById('saShopModal').remove();
    document.querySelector('#saShopModal form').onsubmit = (event) => {
        event.preventDefault();
        saCatApi('/api/admin/categories/sub', 'POST', {
            shopType,
            parent: document.getElementById('saFormParent').value,
            name: document.getElementById('saFormCatName').value
        });
    };
}

function saOpenCatEdit(hit) {
    const label = hit.sub ? hit.sub.name : hit.cat.name;
    const id = hit.sub ? hit.sub.id : hit.cat.id;
    if (!hit.sub && hit.cat.locked) {
        saCatFlash = 'Standard categories cannot be renamed.';
        saPaintCategories();
        return;
    }
    saShopModal('Edit ' + saText(label), saCatModalFields('', 'edit'),
        '<button type="button" id="saFormCancel">Cancel</button><button class="sa-add" type="submit">Save</button>');
    document.getElementById('saFormCatName').value = label;
    document.getElementById('saFormCancel').onclick = () => document.getElementById('saShopModal').remove();
    document.querySelector('#saShopModal form').onsubmit = (event) => {
        event.preventDefault();
        saCatApi('/api/admin/categories/' + encodeURIComponent(id), 'PUT', {
            name: document.getElementById('saFormCatName').value
        });
    };
}

async function saCatDelete(id) {
    const hit = saCatFind(id);
    if (!hit) return;
    if (!hit.sub && hit.cat.locked) {
        saCatFlash = 'Standard categories cannot be deleted.';
        saPaintCategories();
        return;
    }
    const label = hit.sub ? hit.sub.name : hit.cat.name;
    if (!window.confirm('Delete "' + label + '"?')) return;
    await saCatApi('/api/admin/categories/' + encodeURIComponent(id), 'DELETE');
}

document.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-cat-toggle]');
    const add = event.target.closest('[data-cat-add]');
    const sub = event.target.closest('[data-cat-sub]');
    const edit = event.target.closest('[data-cat-edit]');
    const del = event.target.closest('[data-cat-del]');
    if (toggle) {
        const key = toggle.dataset.catToggle;
        saCatOpen[key] = !saCatOpen[key];
        saPaintCategories();
    }
    if (add) saOpenAddCategory(add.dataset.catAdd);
    if (sub) saOpenAddSubcategory(sub.dataset.catSub);
    if (edit) {
        const hit = saCatFind(edit.dataset.catEdit);
        if (hit) saOpenCatEdit(hit);
    }
    if (del) saCatDelete(del.dataset.catDel);
});
