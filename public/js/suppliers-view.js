function suppliersMarkup() {
    return `
    <div class="split">
        ${typeof suppliersQuickPayMarkup === 'function' ? suppliersQuickPayMarkup() : ''}
        <div class="card">
            <div class="card-title">Supplier List</div>
            <div class="list-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>
                <input id="listSearch" name="listSearch" type="text" placeholder="Search supplier..." autocomplete="off">
            </div>
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Supplier Name</th>
                            <th>Phone</th>
                            <th>Total Due Balance</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="supplierTable"></tbody>
                </table>
            </div>
            <div id="supplierEmpty" class="empty">No suppliers yet. Register a mill from Inventory → Add Supplier.</div>
        </div>
    </div>
    ${typeof suppliersLedgerMarkup === 'function' ? suppliersLedgerMarkup() : ''}
`;
}
