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
    return `<span class="sa-cat-chip">
        <em>${saText(sub.name)}</em>
        <button type="button" class="sa-cat-x" data-cat-del="${saText(sub.id)}"
            data-cat-kind="subcategory" title="Delete subcategory" aria-label="Delete ${saText(sub.name)}">×</button>
    </span>`;
}

function saCatSection(cat, shopType) {
    const type = saText(shopType);
    const subs = cat.subcategories || [];
    const chips = subs.length
        ? subs.map(saCatChip).join('')
        : `<button type="button" class="sa-cat-inline-add" data-cat-sub="${type}" data-cat-parent="${saText(cat.name)}">+ Add Subcategory</button>`;
    return `<div class="sa-cat-section">
        <div class="sa-cat-section-head">
            <div class="sa-cat-section-title">
                <span class="sa-cat-folder" aria-hidden="true">${saText(cat.icon || '📁')}</span>
                <strong>${saText(cat.name)}</strong>
                ${cat.locked ? '<span class="sa-cat-lock">Standard</span>' : ''}
            </div>
            <button type="button" class="sa-cat-x is-row" data-cat-del="${saText(cat.id)}"
                data-cat-kind="category" title="Delete category" aria-label="Delete ${saText(cat.name)}">×</button>
        </div>
        <div class="sa-cat-chips">${chips}</div>
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
    for (const group of saCatTree) {
        for (const cat of group.categories || []) {
            if (cat.id === id) return { group, cat, sub: null };
            for (const sub of cat.subcategories || []) {
                if (sub.id === id) return { group, cat, sub };
            }
        }
    }
    return null;
}
