function colorsMarkup() {
    return `
    <div class="card">
        <div class="rp-page-bar">
            <button type="button" class="ghost" id="colorBack">Back to Inventory</button>
            <div class="card-title">Color Management</div>
            ${catalogPageActions('color')}
        </div>
        <p class="empty">Standardized colors used on master catalog products.</p>
        <form id="colorForm" class="grid-2" autocomplete="off" style="margin:14px 0">
            <div class="field"><label>Color Name</label>
                <input id="colorName" name="colorName" required placeholder="Maroon" autocomplete="off"></div>
            <div class="actions" style="align-items:flex-end">
                <button type="submit" class="primary">Save Color</button>
            </div>
        </form>
        <div class="table-wrap">
            <table>
                <thead>
                    <tr><th>Color</th><th>Type</th><th>Actions</th></tr>
                </thead>
                <tbody id="colorTable"></tbody>
            </table>
        </div>
    </div>`;
}
