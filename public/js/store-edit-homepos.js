function storeEditHomePosMarkup() {
    return `
    <section class="os-edit-sec">
        <div class="os-edit-sec-head">
            <span class="os-step">4</span>
            <div>
                <strong>Homepage Position</strong>
                <p>Control where and how this product appears on the homepage.</p>
            </div>
        </div>
        <div class="os-edit-controls">
            <div class="field">
                <label for="osEditOrder">Display Order</label>
                <input id="osEditOrder" name="osEditOrder" type="number" min="1" step="1" autocomplete="off">
                <small class="os-field-hint">Lower number = higher priority</small>
            </div>
            <div class="field">
                <label for="osEditHomeSec">Category Position</label>
                <select id="osEditHomeSec" name="osEditHomeSec" autocomplete="off">
                    <option value="featured">Featured Products</option>
                    <option value="new">New Arrivals</option>
                    <option value="sale">Sale Products</option>
                    <option value="category">Categories</option>
                </select>
            </div>
        </div>
    </section>`;
}

function osHomeSectionFromRow(row) {
    if (row.storeHomeSection) return row.storeHomeSection;
    if (row.storeFeatured) return 'featured';
    if (row.storeNewArrival) return 'new';
    if (row.storeSale) return 'sale';
    return 'featured';
}

function fillOsEditHomePos(row) {
    const order = document.getElementById('osEditOrder');
    const sec = document.getElementById('osEditHomeSec');
    if (order) order.value = Math.max(1, Number(row.storeSortOrder) || 1);
    if (sec) sec.value = osHomeSectionFromRow(row);
}

function osEditHomePayload() {
    return {
        storeSortOrder: Math.max(1, Number(document.getElementById('osEditOrder')?.value || 1)),
        storeHomeSection: document.getElementById('osEditHomeSec')?.value || 'featured'
    };
}
