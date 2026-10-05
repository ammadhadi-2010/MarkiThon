function custStatCard(id, label, tone, path) {
    return `<article class="cust-stat ${tone}">
        <span class="cust-stat-ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${path}</svg>
        </span>
        <div>
            <p>${label}</p>
            <strong id="${id}">0</strong>
        </div>
    </article>`;
}

function customersMarkup() {
    return `
        <section class="card os-card cust-page" id="custPage">
            <div class="os-card-head os-ord-head cust-head">
                <div>
                    <div class="card-title">Customers</div>
                    <p class="wl-hint">Manage your customers, view purchase history and keep track of your loyal clients.</p>
                </div>
                <button type="button" class="os-public-btn" id="custAddBtn">+ Add New Customer</button>
            </div>
            <div class="cust-stats">
                ${custStatCard('custStatTotal', 'Total Customers', 'blue',
                    '<circle cx="9" cy="8" r="3"/><path d="M3 19c1.2-3 3.2-4.5 6-4.5S16.8 16 18 19"/><circle cx="17" cy="8" r="2.4"/><path d="M17 13.5c2 .3 3.5 1.6 4.4 3.5"/>')}
                ${custStatCard('custStatBuy', 'Total Purchases', 'green',
                    '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M3 4h2l2.4 11h10.2l2-7H7"/>')}
                ${custStatCard('custStatAov', 'Average Order Value', 'purple',
                    '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M7 8V6a5 5 0 0 1 10 0v2"/>')}
                ${custStatCard('custStatActive', 'Active Customers', 'teal',
                    '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>')}
            </div>
            <div class="cust-tools">
                <div class="field list-search os-search">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/>
                    </svg>
                    <input id="custSearch" name="custSearch" placeholder="Search by name, phone, or address..."
                        autocomplete="off">
                </div>
                <select id="custKind" name="custKind" autocomplete="off">
                    <option value="all">All Customers</option>
                    <option value="vip">VIP</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                <select id="custArea" name="custArea" autocomplete="off">
                    <option value="all">All Areas</option>
                </select>
                <label class="os-ord-range">
                    Date Range
                    <select id="custRange" name="custRange" autocomplete="off">
                        <option value="30d" selected>Last 30 Days</option>
                        <option value="7d">Last 7 days</option>
                        <option value="month">This month</option>
                        <option value="all">All Dates</option>
                    </select>
                </label>
            </div>
            <div class="table-wrap os-table-wrap cust-wrap">
                <table class="os-table cust-table">
                    <thead>
                        <tr>
                            <th class="cust-check"><input type="checkbox" id="custCheckAll" autocomplete="off"></th>
                            <th>Customer</th>
                            <th>Phone / WhatsApp</th>
                            <th>Address</th>
                            <th>Total Orders</th>
                            <th>Total Purchase</th>
                            <th>Last Order</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="custTable"></tbody>
                </table>
            </div>
            <div class="cust-cards" id="custCards"></div>
            <div class="os-foot os-ord-foot">
                <span id="custPageLabel">Showing 0 of 0 customers</span>
                <div class="os-pager" id="custPager"></div>
            </div>
        </section>
        ${custFormMarkup()}
        ${custLedgerMarkup()}
        ${typeof custDetailMarkup === 'function' ? custDetailMarkup() : ''}`;
}

function custFormMarkup() {
    return `
        <div class="modal-back" id="custFormModal" hidden>
            <form class="modal-card" id="custForm" autocomplete="off">
                <div class="card-title" id="custFormTitle">Add New Customer</div>
                <input type="hidden" id="custFormId" name="custFormId" autocomplete="off">
                <div class="field"><label>Name *</label>
                    <input id="custFormName" name="custFormName" required autocomplete="off"></div>
                <div class="field"><label>Phone</label>
                    <input id="custFormPhone" name="custFormPhone" autocomplete="off"></div>
                <div class="field"><label>WhatsApp</label>
                    <input id="custFormWa" name="custFormWa" autocomplete="off"></div>
                <div class="field"><label>Address</label>
                    <input id="custFormAddr" name="custFormAddr" autocomplete="off"></div>
                <div class="field"><label>Area</label>
                    <input id="custFormArea" name="custFormArea" autocomplete="off"></div>
                <div class="field"><label>Status</label>
                    <select id="custFormStatus" name="custFormStatus" autocomplete="off">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select></div>
                <label class="cust-vip-check">
                    <input type="checkbox" id="custFormVip" name="custFormVip" autocomplete="off"> VIP customer
                </label>
                <div class="actions">
                    <button type="button" class="os-ord-cancel" id="custFormCancel">Cancel</button>
                    <button type="submit" class="os-ord-submit">Save Customer</button>
                </div>
            </form>
        </div>`;
}

function custLedgerMarkup() {
    return `
        <div class="modal-back" id="custLedgerModal" hidden>
            <div class="modal-card">
                <div class="card-title">Customer Ledger</div>
                <div class="field"><label>Customer Name</label>
                    <input id="ledgerCustName" name="ledgerCustName" autocomplete="off"></div>
                <div class="field">
                    <label>Type</label>
                    <select id="transType" name="transType" autocomplete="off">
                        <option value="PAYMENT">Payment received</option>
                        <option value="BILL">New credit bill</option>
                    </select>
                </div>
                <div class="field"><label>Amount (PKR)</label>
                    <input id="ledgerAmt" name="ledgerAmt" type="number" autocomplete="off"></div>
                <div class="field"><label>Note</label>
                    <input id="ledgerDesc" name="ledgerDesc" placeholder="Cash, Bank" autocomplete="off"></div>
                <div class="actions"><button class="primary" type="button" id="addLedgerBtn">Save Ledger Entry</button></div>
                <div class="field"><label>Find customer ledger</label>
                    <input id="searchCust" name="searchCust" autocomplete="off"></div>
                <div class="actions">
                    <button class="ghost" type="button" id="searchLedgerBtn">Search Ledger</button>
                    <button type="button" class="os-ord-cancel" id="custLedgerClose">Close</button>
                </div>
                <div class="table-wrap"><table><thead><tr><th>Type</th><th>Amount</th><th>Note</th></tr></thead>
                    <tbody id="ledgerTable"></tbody></table></div>
            </div>
        </div>`;
}
