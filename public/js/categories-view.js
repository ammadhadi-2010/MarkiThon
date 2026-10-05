function categoriesMarkup() {
    return `
    <div class="card">
        <div class="rp-page-bar">
            <button type="button" class="ghost" id="catBack">Back to Inventory</button>
            <div class="card-title">Category Management</div>
            ${catalogPageActions('category')}
        </div>
        <p class="empty">Categories for this shop type. Standard names are locked. Custom names belong to this shop only.</p>
        <form id="catForm" class="grid-2" autocomplete="off" style="margin:14px 0">
            <input id="catEditOriginal" name="catEditOriginal" type="hidden" autocomplete="off">
            <div class="field"><label>Category Name</label>
                <input id="catName" name="catName" required placeholder="Lawn" autocomplete="off"></div>
            <div class="actions" style="align-items:flex-end">
                <button type="button" class="ghost" id="catCancel">Cancel</button>
                <button type="submit" class="primary">Save Category</button>
            </div>
        </form>
        <div class="table-wrap">
            <table>
                <thead>
                    <tr><th>Category</th><th>Type</th><th>Actions</th></tr>
                </thead>
                <tbody id="catTable"></tbody>
            </table>
        </div>
        <div data-platform hidden>
            <p class="empty">Platform view: every shop type and each shop's custom categories.</p>
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr><th>Shop</th><th>Owner</th><th>Shop Type</th><th>Category</th><th>Type</th><th>Actions</th></tr>
                    </thead>
                    <tbody id="catAdminTable"></tbody>
                </table>
            </div>
        </div>
    </div>`;
}
