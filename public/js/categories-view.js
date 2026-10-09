function categoriesMarkup() {
    return `
    <div class="card">
        <div class="rp-page-bar">
            <button type="button" class="ghost" id="catBack">Back to Inventory</button>
            <div class="card-title">Category Management</div>
            ${catalogPageActions('category')}
        </div>
        <p class="empty">Main categories come from Super Admin for your shop type (locked).
            Add subcategories under a main category for this shop only.</p>
        <form id="catForm" class="grid-2" autocomplete="off" style="margin:14px 0">
            <input id="catEditOriginal" name="catEditOriginal" type="hidden" autocomplete="off">
            <div class="field"><label>Main Category</label>
                <select id="catParent" name="catParent" required>
                    <option value="">Select main category</option>
                </select>
            </div>
            <div class="field"><label>Subcategory Name</label>
                <input id="catName" name="catName" required placeholder="e.g. Shalwar Kameez" autocomplete="off">
            </div>
            <div class="actions" style="align-items:flex-end;grid-column:1/-1">
                <button type="button" class="ghost" id="catCancel">Cancel</button>
                <button type="submit" class="primary" id="catSaveBtn">Save Subcategory</button>
            </div>
        </form>
        <div class="table-wrap">
            <table>
                <thead>
                    <tr><th>Name</th><th>Type</th><th>Parent</th><th>Actions</th></tr>
                </thead>
                <tbody id="catTable"></tbody>
            </table>
        </div>
    </div>`;
}
