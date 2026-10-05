function brandsMarkup() {
    return `
    <div class="card">
        <div class="rp-page-bar">
            <button type="button" class="ghost" id="brandBack">Back to Inventory</button>
            <div class="card-title">Brand Management</div>
            ${catalogPageActions('brand')}
        </div>
        <p class="empty">Brands for this shop type. Standard names are locked. Custom names belong to this shop only.</p>
        <form id="brandForm" class="grid-2" autocomplete="off" style="margin:14px 0">
            <div class="field"><label>Brand Name</label>
                <input id="brandName" name="brandName" required placeholder="Gul Ahmed" autocomplete="off"></div>
            <div class="actions" style="align-items:flex-end">
                <button type="submit" class="primary">Save Brand</button>
            </div>
        </form>
        <div class="table-wrap">
            <table>
                <thead>
                    <tr><th>Brand</th><th>Type</th><th>Actions</th></tr>
                </thead>
                    <tbody id="brandTable"></tbody>
            </table>
        </div>
        <div data-platform hidden>
            <p class="empty">Platform view: every shop type and each shop's custom brands.</p>
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr><th>Shop</th><th>Owner</th><th>Shop Type</th><th>Brand</th><th>Type</th><th>Actions</th></tr>
                    </thead>
                    <tbody id="brandAdminTable"></tbody>
                </table>
            </div>
        </div>
    </div>`;
}
