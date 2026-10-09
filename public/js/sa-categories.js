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
    const edit = saCatIcon('<path d="M4 20h4L18 10l-4-4L4 16v4z"/>');
    const del = saCatIcon('<path d="M6 7h12M9 7V5h6v2m-8 3v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V10"/>');
    return `<span class="sa-cat-chip">
        <em>${saText(sub.name)}</em>
        <button type="button" data-cat-edit="${saText(sub.id)}" title="Edit" aria-label="Edit">${edit}</button>
        <button type="button" data-cat-del="${saText(sub.id)}" title="Delete" aria-label="Delete">${del}</button>
    </span>`;
}

function saCatSection(cat) {
    const edit = saCatIcon('<path d="M4 20h4L18 10l-4-4L4 16v4z"/>');
    const del = saCatIcon('<path d="M6 7h12M9 7V5h6v2m-8 3v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V10"/>');
    const chips = (cat.subcategories || []).map((sub) => saCatChip(sub)).join('')
        || '<span class="sa-muted sa-cat-empty">No subcategories yet.</span>';
    const tools = cat.locked
        ? '<span class="sa-cat-lock">Standard</span>'
        : `<button type="button" data-cat-edit="${saText(cat.id)}" title="Edit">${edit}</button>
           <button type="button" data-cat-del="${saText(cat.id)}" title="Delete">${del}</button>`;
    return `<div class="sa-cat-section">
        <div class="sa-cat-section-head">
            <strong>${saText(cat.name)}</strong>
            <div class="sa-cat-mini">${tools}</div>
        </div>
        <div class="sa-cat-chips">${chips}</div>
    </div>`;
}

function saCatCard(group) {
    const open = Boolean(saCatOpen[group.shopType]);
    const body = open
        ? `<div class="sa-cat-body">${(group.categories || []).map(saCatSection).join('')
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
