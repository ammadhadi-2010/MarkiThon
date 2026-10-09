function renderProductTypes() {
    document.querySelectorAll('#obTypeGrid .ob-type').forEach((card) => {
        card.classList.toggle('on', obProductTypes.includes(card.dataset.ptype));
    });
    const label = document.getElementById('obSelectedLabel');
    const tags = document.getElementById('obTags');
    if (label) label.textContent = 'Selected Categories (' + obProductTypes.length + ')';
    if (tags) {
        tags.innerHTML = obProductTypes.map((name) => `
            <span class="ob-tag">${name}
                <button type="button" data-unpick="${name}" aria-label="Remove">×</button>
            </span>`).join('');
    }
}

function toggleProductType(name) {
    if (obProductTypes.includes(name)) {
        obProductTypes = obProductTypes.filter((item) => item !== name);
    } else obProductTypes = obProductTypes.concat(name);
    renderProductTypes();
}

function obTypeCardMarkup(row) {
    const name = row.name || '';
    const icon = row.icon || '📁';
    const hint = Number(row.subCount) > 0
        ? (row.subCount + ' subcategor' + (row.subCount === 1 ? 'y' : 'ies'))
        : 'Main category';
    return `
        <button type="button" class="ob-type" data-ptype="${name}" data-catid="${row.id || ''}" autocomplete="off">
            <span class="ob-tick">✓</span>
            <span class="ob-type-icon">${icon}</span>
            <strong>${name}</strong>
            <small>${hint}</small>
        </button>`;
}

function paintObTypeGrid(categories) {
    const grid = document.getElementById('obTypeGrid');
    if (!grid) return;
    const rows = Array.isArray(categories) ? categories : [];
    grid.innerHTML = rows.map(obTypeCardMarkup).join('')
        || '<p class="empty">No categories for this shop type yet. Ask Super Admin to add main categories.</p>';
    if (typeof renderProductTypes === 'function') renderProductTypes();
}

function onboardingStep2Markup() {
    return `
        <form id="obForm2" class="ob-panel" data-obstep="2" hidden autocomplete="off">
            <div class="ob-type-grid" id="obTypeGrid"></div>
            <p class="ob-label" id="obTypeHint">Select one or more categories for your shop type.</p>
            <div class="ob-selected">
                <p class="ob-label" id="obSelectedLabel">Selected Categories (0)</p>
                <div class="ob-tags" id="obTags"></div>
            </div>
            <div class="ob-actions spread">
                <button type="button" class="ghost" id="obBack">← Back</button>
                <div class="ob-actions-right">
                    <button type="button" class="ghost" id="obCancel2">Cancel</button>
                    <button type="submit" class="primary" id="obNext2">Next →</button>
                </div>
            </div>
        </form>`;
}

async function loadObCategoriesForShopType(shopType) {
    const type = shopType || (typeof obShopType === 'string' ? obShopType : 'Clothing & Fashion');
    const hint = document.getElementById('obTypeHint');
    if (hint) hint.textContent = 'Loading categories for ' + type + '…';
    try {
        const data = await api.get('/api/categories?shopType=' + encodeURIComponent(type));
        const rows = data.categories || [];
        const names = rows.map((row) => row.name);
        if (typeof obProductTypes !== 'undefined') {
            obProductTypes = obProductTypes.filter((name) => names.includes(name));
        }
        paintObTypeGrid(rows);
        if (hint) {
            hint.textContent = rows.length
                ? 'Select one or more categories for ' + type + '.'
                : 'No admin categories yet for ' + type + '.';
        }
        return rows;
    } catch (error) {
        paintObTypeGrid([]);
        if (hint) hint.textContent = error.message || 'Could not load categories.';
        throw error;
    }
}
