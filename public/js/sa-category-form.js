function saCatToast(message, isError) {
    let el = document.getElementById('saCatToast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'saCatToast';
        el.className = 'sa-cat-toast';
        document.body.appendChild(el);
    }
    el.textContent = message || '';
    el.classList.toggle('is-error', Boolean(isError));
    el.classList.add('on');
    clearTimeout(saCatToast._t);
    saCatToast._t = setTimeout(() => el.classList.remove('on'), 2400);
}

async function saCatApi(url, method, body) {
    const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json();
    if (!response.ok) {
        const note = document.getElementById('saFormNote');
        const msg = data.message || 'Request failed.';
        if (note) note.textContent = msg;
        else saCatToast(msg, true);
        return null;
    }
    const modal = document.getElementById('saShopModal');
    if (modal) modal.remove();
    saCatToast(data.message || 'Saved.');
    if (body && body.shopType) saCatOpen[body.shopType] = true;
    else if (data.shopType) saCatOpen[data.shopType] = true;
    await saMountCategories();
    return data;
}

function saCatModalFields(shopType, mode, parents) {
    const options = (parents || []).map((name) =>
        `<option value="${saText(name)}">${saText(name)}</option>`).join('');
    if (mode === 'sub') {
        return `<label>Shop Type</label>
            <input id="saFormShopType" value="${saText(shopType)}" disabled>
            <label>Parent Main Category</label>
            <select id="saFormParent" required>
                <option value="">Select category</option>${options}
            </select>
            <label>Subcategory Name</label>
            <input id="saFormCatName" name="categoryName" autocomplete="off" required
                placeholder="e.g. Shalwar Kameez">`;
    }
    if (mode === 'edit') {
        return `<label>Category Name</label>
            <input id="saFormCatName" name="categoryName" autocomplete="off" required
                placeholder="e.g. Cotton">`;
    }
    return `<label>Shop Type</label>
        <input id="saFormShopType" value="${saText(shopType)}" disabled>
        <label>Category Name</label>
        <input id="saFormCatName" name="categoryName" autocomplete="off" required
            placeholder="e.g. Men's Clothing">`;
}

function saWireCatModal() {
    document.getElementById('saFormCancel').onclick = () => document.getElementById('saShopModal').remove();
}

function saOpenAddCategory(shopType) {
    saShopModal('Add New Main Category', saCatModalFields(shopType, 'add'),
        '<button type="button" id="saFormCancel">Cancel</button><button class="sa-add" type="submit">Create Category</button>');
    saWireCatModal();
    document.querySelector('#saShopModal form').onsubmit = (event) => {
        event.preventDefault();
        saCatApi('/api/admin/categories', 'POST', {
            shopType,
            name: document.getElementById('saFormCatName').value
        });
    };
}

function saOpenAddSubcategory(shopType, parentName) {
    const group = saCatGroup(shopType);
    const parents = (group && group.categories || []).map((row) => row.name);
    if (!parents.length) {
        saCatToast('Add a main category first.', true);
        return;
    }
    saShopModal('Add Subcategory', saCatModalFields(shopType, 'sub', parents),
        '<button type="button" id="saFormCancel">Cancel</button><button class="sa-add" type="submit">Save Subcategory</button>');
    saWireCatModal();
    const parent = document.getElementById('saFormParent');
    if (parentName && parents.includes(parentName)) parent.value = parentName;
    document.querySelector('#saShopModal form').onsubmit = (event) => {
        event.preventDefault();
        saCatApi('/api/admin/subcategories', 'POST', {
            shopType,
            parent: parent.value,
            name: document.getElementById('saFormCatName').value
        });
    };
}

function saOpenCatEdit(hit) {
    if (hit.sub) return;
    const id = hit.cat.id;
    const shopType = hit.group.shopType;
    saShopModal('Edit Category Name', saCatModalFields(shopType, 'edit'),
        '<button type="button" id="saFormCancel">Cancel</button><button class="sa-add" type="submit">Update Category Name</button>');
    const input = document.getElementById('saFormCatName');
    input.value = hit.cat.name;
    input.focus();
    input.select();
    saWireCatModal();
    document.querySelector('#saShopModal form').onsubmit = (event) => {
        event.preventDefault();
        saCatApi('/api/admin/categories/' + encodeURIComponent(id), 'PUT', {
            name: input.value,
            shopType
        });
    };
}

async function saCatDelete(id, kindHint) {
    const hit = saCatFind(id);
    if (!hit) return;
    const kind = (hit.sub || kindHint === 'subcategory') ? 'Subcategory' : 'Category';
    const label = hit.sub ? hit.sub.name : hit.cat.name;
    if (!window.confirm('Are you sure you want to delete this ' + kind + '?\n\n"' + label + '"')) return;
    await saCatApi('/api/admin/categories/' + encodeURIComponent(id), 'DELETE', {
        shopType: hit.group.shopType
    });
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
    if (sub) saOpenAddSubcategory(sub.dataset.catSub, sub.dataset.catParent || '');
    if (edit) {
        const hit = saCatFind(edit.dataset.catEdit);
        if (hit) saOpenCatEdit(hit);
    }
    if (del) saCatDelete(del.dataset.catDel, del.dataset.catKind || '');
});
