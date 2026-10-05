function osOrdTabBtn(id, label) {
    return `<button type="button" class="os-ord-tab${id === 'All' ? ' on' : ''}" data-osostatus="${id}">
        ${label}<span class="os-ord-count" data-osocount="${id}">0</span>
    </button>`;
}

function storeOrdersMarkup() {
    const tabs = [
        ['All', 'All'],
        ['New', 'New'],
        ['Confirmed', 'Confirmed'],
        ['Processing', 'Processing'],
        ['Dispatched', 'Dispatched'],
        ['Completed', 'Completed'],
        ['Cancelled', 'Cancelled']
    ].map((pair) => osOrdTabBtn(pair[0], pair[1])).join('');
    return `
        <section class="card os-card" id="osOrdersCard">
            <div class="os-card-head os-ord-head">
                <div>
                    <div class="card-title">Orders</div>
                    <p class="wl-hint">Manage your online store orders and keep your customers happy.</p>
                </div>
                <button type="button" class="os-public-btn" id="osOrdCreate">+ Create Manual Order</button>
            </div>
            <div class="os-ord-tabs" id="osOrdTabs">${tabs}</div>
            <div class="os-ord-tools">
                <div class="field list-search os-search">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/>
                    </svg>
                    <input id="osOrdSearch" name="osOrdSearch"
                        placeholder="Search by order #, customer or phone..." autocomplete="off">
                </div>
                <label class="os-ord-range">
                    Date Range
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>
                    </svg>
                    <select id="osOrdRange" name="osOrdRange" autocomplete="off">
                        <option value="all">All Dates</option>
                        <option value="today">Today</option>
                        <option value="7d">Last 7 days</option>
                        <option value="month">This month</option>
                    </select>
                </label>
            </div>
            <div class="table-wrap os-table-wrap os-ord-wrap">
                <table class="os-table os-ord-table">
                    <thead>
                        <tr>
                            <th>Order #</th>
                            <th>Date &amp; Time</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody id="osOrdersTable"></tbody>
                </table>
            </div>
            <div class="os-ord-cards" id="osOrdersCards"></div>
            <div class="os-foot os-ord-foot">
                <span id="osOrdPageLabel">Showing 0 of 0 orders</span>
                <div class="os-pager" id="osOrdPager"></div>
            </div>
        </section>
        ${typeof storeOrderDrawerMarkup === 'function' ? storeOrderDrawerMarkup() : ''}
        ${typeof storeOrderManualMarkup === 'function' ? storeOrderManualMarkup() : ''}`;
}
