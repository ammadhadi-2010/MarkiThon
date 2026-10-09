let saCatTree = [];
let saCatOpen = {};
let saCatFlash = '';

function saCatIcon(svg) {
    return saSvg(svg);
}

function saCatActions(shopType) {
    const type = saText(shopType);
    return `
        <div class="sa-cat-actions" onclick="event.stopPropagation()">
            <button type="button" class="sa-cat-btn is-add" data-cat-add="${type}">+ Add Category</button>
            <button type="button" class="sa-cat-btn is-sub" data-cat-sub="${type}">+ Add Subcategory</button>
        </div>`;
}

function saCatChip(sub) {
    return `<span class="sa-cat-chip" data-sub-id="${saText(sub.id)}">
        <em>${saText(sub.name)}</em>
        <button type="button" class="sa-cat-x" data-cat-del="${saText(sub.id)}"
            data-cat-kind="subcategory" title="Delete subcategory" aria-label="Delete ${saText(sub.name)}">×</button>
    </span>`;
}

function saCatQuickAdd(shopType, parentName) {
    return `<form class="sa-cat-quick" data-cat-quick="1" data-shop-type="${saText(shopType)}"
        data-parent="${saText(parentName)}">
        <input name="subName" autocomplete="off" maxlength="80" placeholder="+ Add Subcategory" required>
        <button type="submit" title="Add subcategory">Add</button>
    </form>`;
}

function saCatSection(cat, shopType) {
    const type = saText(shopType);
    const chips = (cat.subcategories || []).map(saCatChip).join('');
    const pen = saCatIcon('<path d="M4 20h4L18 10l-4-4L4 16v4z"/>');
    return `<div class="sa-cat-section" data-cat-id="${saText(cat.id)}">
        <div class="sa-cat-section-head">
            <div class="sa-cat-section-title">
                <span class="sa-cat-folder" aria-hidden="true">${saText(cat.icon || '📁')}</span>
                <strong>${saText(cat.name)}</strong>
                <button type="button" class="sa-cat-edit" data-cat-edit="${saText(cat.id)}"
                    title="Edit category name" aria-label="Edit ${saText(cat.name)}">${pen}</button>
                ${cat.locked ? '<span class="sa-cat-lock">Standard</span>' : ''}
            </div>
            <button type="button" class="sa-cat-x is-row" data-cat-del="${saText(cat.id)}"
                data-cat-kind="category" title="Delete category" aria-label="Delete ${saText(cat.name)}">×</button>
        </div>
        <div class="sa-cat-chips">
            ${chips}
            ${saCatQuickAdd(type, cat.name)}
        </div>
    </div>`;
}

function saCatCard(group) {
    const open = Boolean(saCatOpen[group.shopType]);
    const body = open
        ? `<div class="sa-cat-body">${(group.categories || []).map((cat) => saCatSection(cat, group.shopType)).join('')
            || '<p class="sa-muted">No categories yet. Add the first main category.</p>'}</div>`
        : '';
    return `<article class="sa-cat-card${open ? ' is-open' : ''}" data-cat-type="${saText(group.shopType)}">
        <button type="button" class="sa-cat-head" data-cat-toggle="${saText(group.shopType)}">
            <span class="sa-cat-ico" aria-hidden="true">${group.icon || '🏪'}</span>
            <span class="sa-cat-meta">
                <strong>${saText(group.shopType)}</strong>
                <small>${saCount(group.count)} categories</small>
            </span>
            <span class="sa-cat-chev" aria-hidden="true">${open ? '▾' : '▸'}</span>
        </button>
        ${saCatActions(group.shopType)}
        ${body}
    </article>`;
}

function saPaintCategories() {
    const mark = saCatIcon('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/>');
    const root = document.getElementById('saCategories');
    if (!root) return;
    root.innerHTML = `
        <div class="sa-shop-head">
            <div class="sa-shop-title">
                <div class="sa-shop-mark">${mark}</div>
                <div>
                    <h1>Categories</h1>
                    <p class="sa-muted">Shop-type hierarchy with main categories and subcategories.</p>
                </div>
            </div>
        </div>
        <div class="sa-cat-tree">${saCatTree.map(saCatCard).join('')}</div>
        <p class="sa-note-line" id="saCatNote">${saText(saCatFlash)}</p>`;
    saCatFlash = '';
}

async function saMountCategories() {
    const response = await fetch('/api/admin/categories');
    const data = await response.json();
    saCatTree = data.shopTypes || [];
    if (!Object.keys(saCatOpen).length && saCatTree[0]) {
        saCatOpen[saCatTree[0].shopType] = true;
    }
    saPaintCategories();
}

function saCatGroup(shopType) {
    return saCatTree.find((row) => row.shopType === shopType);
}

function saCatFind(id) {
    const key = String(id || '');
    for (const group of saCatTree) {
        for (const cat of group.categories || []) {
            if (cat.id === key) return { group, cat, sub: null };
            for (const sub of cat.subcategories || []) {
                if (sub.id === key) return { group, cat, sub };
            }
        }
    }
    return null;
}

function saCatDropLocal(id) {
    const hit = saCatFind(id);
    if (!hit) return;
    if (hit.sub) {
        hit.cat.subcategories = (hit.cat.subcategories || []).filter((row) => row.id !== id);
    } else {
        hit.group.categories = (hit.group.categories || []).filter((row) => row.id !== id);
        hit.group.count = hit.group.categories.length;
    }
}
