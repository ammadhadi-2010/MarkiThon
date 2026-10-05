let dashGrain = 'daily';
let summaryCache = null;

function pct(value) {
    const n = Number(value) || 0;
    const sign = n >= 0 ? '+' : '';
    return `${sign}${n}%`;
}

function paintSummary(data) {
    document.getElementById('stSales').textContent = money(data.totalSales);
    document.getElementById('stBuy').textContent = money(data.totalPurchases);
    document.getElementById('stProfit').textContent = money(data.netProfit);
    const expEl = document.getElementById('stExpenses');
    if (expEl) expEl.textContent = money(data.totalExpenses);
    document.getElementById('stOrders').textContent = data.totalOrders || 0;
    document.getElementById('gSales').textContent = pct(data.growth && data.growth.sales);
    document.getElementById('gBuy').textContent = pct(data.growth && data.growth.purchases);
    document.getElementById('gProfit').textContent = pct(data.growth && data.growth.profit);
    document.getElementById('gOrders').textContent = pct(data.growth && data.growth.orders);
}

async function loadSummary() {
    const line = document.getElementById('salesLine');
    showChartStatus(line, 'Loading sales overview...');
    summaryCache = await api.get('/api/reports/sales/summary');
    paintSummary(summaryCache);
    if (dashGrain === 'daily') drawLineChart(line, summaryCache.points || []);
}

async function loadOverview() {
    const line = document.getElementById('salesLine');
    showChartStatus(line, 'Loading sales overview...');
    if (dashGrain === 'daily' && summaryCache && summaryCache.points) {
        drawLineChart(line, summaryCache.points);
        return;
    }
    const data = await api.get(`/api/reports/sales/overview?grain=${dashGrain}`);
    drawLineChart(line, data.points || []);
}

async function loadCategories() {
    const donut = document.getElementById('salesDonut');
    showChartStatus(donut, 'Loading categories...');
    const data = await api.get('/api/reports/sales/by-category');
    const rows = data.rows || [];
    drawDonut(donut, rows);
    const colors = ['#3b82f6', '#22c55e', '#eab308', '#f97316', '#a855f7', '#06b6d4', '#f43f5e'];
    document.getElementById('catLegend').innerHTML = rows.map((row, i) => `
        <div><span><i class="dot" style="background:${colors[i % colors.length]}"></i>${escapeHtml(row.name)}</span><strong>${row.percent}%</strong></div>
    `).join('');
}

async function loadTopSelling() {
    const data = await api.get('/api/reports/sales/top-selling');
    const rows = data.rows || [];
    document.getElementById('topTable').innerHTML = rows.map((row, i) => `
        <tr>
            <td>${i + 1}</td>
            <td class="prod-cell">
                <img class="thumb" src="${escapeHtml(row.imageUrl || '')}" alt="" onerror="this.style.opacity=0.2">
                <span>${escapeHtml(row.title)}</span>
            </td>
            <td>${row.qty} ${escapeHtml(row.unit || 'm')}</td>
            <td>${money(row.total)}</td>
        </tr>
    `).join('') || '<tr><td colspan="4" class="empty">No sales yet.</td></tr>';
    document.getElementById('branchTable').innerHTML = `
        <tr><td>1</td><td>Ammad Hadi Stor</td><td>${document.getElementById('stSales').textContent}</td></tr>`;
}

async function loadDownloads() {
    const rows = await api.get('/api/reports/sales/recent-downloads');
    document.getElementById('dlList').innerHTML = (rows || []).map((row) => `
        <div class="dl-row">
            <span>${escapeHtml(row.title)}<span class="sku">${escapeHtml(row.rangeLabel || '')}</span></span>
            <button type="button" class="ghost" data-dl="${escapeHtml(row.reportType)}">⬇</button>
        </div>
    `).join('');
}

async function refreshDashboard() {
    await loadSummary();
    await Promise.all([loadOverview(), loadCategories(), loadTopSelling(), loadDownloads()]);
}

function bindDashboard() {
    const root = document.getElementById('view-dashboard');
    root.querySelectorAll('[data-grain]').forEach((btn) => btn.addEventListener('click', () => {
        dashGrain = btn.dataset.grain;
        root.querySelectorAll('[data-grain]').forEach((b) => b.classList.toggle('active', b === btn));
        loadOverview().catch((e) => showToast(e.message));
    }));
    document.getElementById('dlList').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-dl]');
        if (!btn) return;
        window.open(`/api/reports/export?type=${encodeURIComponent(btn.dataset.dl)}`, '_blank');
    });
    document.getElementById('viewAllReports').addEventListener('click', () => showView('reports'));
    if (typeof bindDashboardStore === 'function') bindDashboardStore();
    window.addEventListener('resize', () => {
        if (!root.classList.contains('active')) return;
        loadOverview().catch(() => {});
        loadCategories().catch(() => {});
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('view-dashboard');
    root.innerHTML = dashboardMarkup();
    disableAutofill(root);
    bindDashboard();
    refreshDashboard().catch((e) => showToast(e.message));
});
