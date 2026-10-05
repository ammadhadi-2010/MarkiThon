function reportsMarkup() {
    return `
    <div class="reports-head" id="rpToolbar">
        <button type="button" class="ghost" id="rpClose" hidden>Back to Reports</button>
        <h2 id="rpHomeTitle">Reports</h2>
        <div class="card-title" id="rpModalTitle" hidden>Report</div>
        <div class="rp-head-tools">
            <div class="range-box">
                <input id="rpFrom" name="rpFrom" type="date" autocomplete="off">
                <span>—</span>
                <input id="rpTo" name="rpTo" type="date" autocomplete="off">
            </div>
            <button type="button" class="export-btn" id="rpExport">Export</button>
            <button type="button" class="primary" id="rpModalExport" hidden>Export CSV</button>
        </div>
    </div>
    <div class="report-grid" id="rpGrid"></div>
    <div class="rp-page" id="rpModal" hidden>
        <div id="rpSupplierTools" hidden>
            <div class="list-search">
                <input id="rpSupSearch" name="rpSupSearch" placeholder="Search name, phone, email, or invoice ID" autocomplete="off">
            </div>
            <div class="sup-filters">
                <button type="button" class="tab active" data-rpfilter="all">All</button>
                <button type="button" class="tab" data-rpfilter="pending">Pending Payables</button>
                <button type="button" class="tab" data-rpfilter="zero">Zero Balance</button>
            </div>
            <div class="grid-2">
                <div class="field"><label>From</label><input id="rpSupFrom" name="rpSupFrom" type="date" autocomplete="off"></div>
                <div class="field"><label>To</label><input id="rpSupTo" name="rpSupTo" type="date" autocomplete="off"></div>
            </div>
            <div class="actions" style="justify-content:flex-start">
                <button type="button" class="primary" id="rpRecordPay">+ Record Payment</button>
            </div>
        </div>
        <p id="rpSummary" class="wl-hint" hidden></p>
        <div class="rp-overview" id="rpOverview" hidden>
            <article class="rp-stat">
                <span>Total Sales Revenue</span>
                <strong id="rpRev">Rs. 0</strong>
                <small>Retail + Wholesale in range</small>
            </article>
            <article class="rp-stat">
                <span>Total Expenses</span>
                <strong id="rpExp">Rs. 0</strong>
                <small>Expenses tab entries in range</small>
            </article>
            <article class="rp-stat">
                <span>Estimated Net Profit</span>
                <strong id="rpNet">Rs. 0</strong>
                <small>Revenue − COGS − Expenses</small>
            </article>
        </div>
        <div class="table-wrap rp-table">
            <table>
                <thead id="rpHead"></thead>
                <tbody id="rpBody"></tbody>
            </table>
        </div>
    </div>
    <div id="rpPayModal" class="share-modal" hidden></div>
    <div id="rpLedModal" class="share-modal" hidden></div>`;
}

const REPORT_CARDS = [
    ['sales', 'Sales Report', 'Daily / Monthly', 'ib-blue', '📊'],
    ['purchases', 'Purchase Report', 'Supplier wise', 'ib-violet', '📄'],
    ['stock', 'Stock Report', 'Current Stock', 'ib-teal', '🏬'],
    ['profit', 'Profit Report', 'Product wise', 'ib-indigo', '📈'],
    ['low-stock', 'Low Stock Report', 'Reorder Products', 'ib-orange', '⚠️'],
    ['customers', 'Customer Report', 'Top Customers', 'ib-sky', '👥'],
    ['suppliers', 'Supplier Report', 'Supplier Payments', 'ib-green', '🔒'],
    ['expenses', 'Expense Report', 'Monthly Expenses', 'ib-rose', '💸']
];
