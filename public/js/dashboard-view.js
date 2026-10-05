function dashboardMarkup() {
    return `
    <div class="dash-wrap">
        <section class="card dash-chart">
            <div class="card-title" style="justify-content:space-between">
                <span>Sales Overview</span>
                <div class="seg">
                    <button type="button" class="active" data-grain="daily">Daily</button>
                    <button type="button" data-grain="weekly">Weekly</button>
                    <button type="button" data-grain="monthly">Monthly</button>
                </div>
            </div>
            <div class="chart-box">
                <div class="chart-tip" hidden></div>
                <canvas id="salesLine" width="560" height="220" aria-label="Sales overview chart"></canvas>
            </div>
        </section>
        <section class="card dash-cat">
            <div class="card-title">Sales by Product Category</div>
            <div class="donut-wrap">
                <div class="chart-box donut-box">
                    <canvas id="salesDonut" width="220" height="220" aria-label="Category chart"></canvas>
                </div>
                <div class="legend" id="catLegend"></div>
            </div>
        </section>
        <section class="card dash-stats">
            <div class="card-title">Quick Stats (This Month)</div>
            <div class="stat-list">
                <div class="stat-item"><div class="icon-badge ib-green">Rs</div><div><span>Total Sales</span><strong id="stSales">Rs. 0</strong></div><em class="growth" id="gSales">+0%</em></div>
                <div class="stat-item"><div class="icon-badge ib-orange">⬇</div><div><span>Total Purchases</span><strong id="stBuy">Rs. 0</strong></div><em class="growth" id="gBuy">+0%</em></div>
                <div class="stat-item"><div class="icon-badge ib-violet">◆</div><div><span>Net Profit</span><strong id="stProfit">Rs. 0</strong></div><em class="growth" id="gProfit">+0%</em></div>
                <div class="stat-item"><div class="icon-badge ib-rose">💸</div><div><span>Shop Expenses</span><strong id="stExpenses">Rs. 0</strong></div><em class="growth" id="gExpenses"></em></div>
                <div class="stat-item"><div class="icon-badge ib-blue">☰</div><div><span>Total Orders</span><strong id="stOrders">0</strong></div><em class="growth" id="gOrders">+0%</em></div>
            </div>
        </section>
        <section class="card dash-top">
            <div class="card-title">Top Selling Products</div>
            <div class="table-wrap">
                <table>
                    <thead><tr><th>#</th><th>Product</th><th>Quantity Sold</th><th>Total Sales</th></tr></thead>
                    <tbody id="topTable"></tbody>
                </table>
            </div>
        </section>
        <section class="card dash-reports">
            <div class="card-title">Recent Reports</div>
            <div id="dlList"></div>
            <button type="button" class="full-btn" id="viewAllReports">View All Reports</button>
        </section>
        <section class="card dash-branch">
            <div class="card-title">Sales by Shop / Branch</div>
            <div class="table-wrap">
                <table>
                    <thead><tr><th>#</th><th>Shop Name</th><th>Total Sales</th></tr></thead>
                    <tbody id="branchTable"></tbody>
                </table>
            </div>
        </section>
        ${typeof dashboardStoreMarkup === 'function' ? dashboardStoreMarkup() : ''}
    </div>`;
}
