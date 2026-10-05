function saText(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}

function saMoney(value) {
    return 'Rs. ' + Math.round(Number(value) || 0).toLocaleString('en');
}

function saCount(value) {
    return Math.round(Number(value) || 0).toLocaleString('en');
}

function saGrowth(added, total) {
    const next = Number(added) || 0;
    const before = Math.max(0, (Number(total) || 0) - next);
    if (!before) return 0;
    return Math.round((next / before) * 100);
}

function saChange(current, previous) {
    const now = Number(current) || 0;
    const prev = Number(previous) || 0;
    if (!prev) return 0;
    return Math.round(((now - prev) / prev) * 100);
}

function saIcon(path) {
    return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2" aria-hidden="true">${path}</svg>`;
}

function saTrend(percent, note) {
    const value = Math.round(Number(percent) || 0);
    const down = value < 0;
    return `<div class="sa-trend"><span class="${down ? 'sa-down' : 'sa-up'}">${down ? '↓' : '↑'} ${Math.abs(value)}%</span><em>${note}</em></div>`;
}

function saStat(tone, icon, label, value, percent, note) {
    return `<article class="sa-card sa-stat sa-tone-${tone}">
        <div class="sa-stat-top"><div class="sa-ico">${icon}</div><span>${label}</span></div>
        <strong>${value}</strong>
        ${saTrend(percent, note)}
    </article>`;
}

function saStatCards(stats) {
    const shop = saIcon('<path d="M4 20V9l8-5 8 5v11"/><path d="M9 20v-6h6v6"/>');
    const active = saIcon('<path d="M4 10h16l-1.4 4H5.4L4 10z"/><path d="M6 14v6h12v-6"/><path d="M6 10l1.5-5h9L18 10"/>');
    const box = saIcon('<path d="M3 8l9-4 9 4-9 4L3 8z"/><path d="M3 8v8l9 4 9-4V8"/><path d="M12 12v8"/>');
    const cart = saIcon('<circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M3 4h2l2.4 11h10.8l2-7H7"/>');
    const user = saIcon('<circle cx="12" cy="8" r="3"/><path d="M5 19c1.4-3 3.4-4.5 7-4.5S17.6 16 19 19"/>');
    const tag = saIcon('<path d="M4 12V5h7l9 9-7 7-9-9z"/><circle cx="8.5" cy="8.5" r="1.2" fill="#fff" stroke="none"/>');
    return `<div class="sa-stats">
        ${saStat('blue', shop, 'Total Shops', saCount(stats.shops), saGrowth(stats.freshShops, stats.shops), '+' + saCount(stats.freshShops) + ' new this month')}
        ${saStat('green', active, 'Active Shops', saCount(stats.active), saGrowth(stats.active, stats.shops), saCount(stats.pending) + ' pending approval')}
        ${saStat('purple', box, 'Total Products', saCount(stats.products), saGrowth(stats.freshProducts, stats.products), '+' + saCount(stats.freshProducts) + ' this month')}
        ${saStat('orange', cart, 'Total Orders', saCount(stats.orders), saChange(stats.ordersToday, stats.ordersYesterday), '+' + saCount(stats.ordersToday) + ' today')}
        ${saStat('cyan', user, 'Total Customers', saCount(stats.customers), saGrowth(stats.freshCustomers, stats.customers), '+' + saCount(stats.freshCustomers) + ' this month')}
        ${saStat('pink', tag, "Today's Sales", saMoney(stats.todaySales), saChange(stats.todaySales, stats.yesterdaySales), 'vs. yesterday')}
    </div>`;
}

function saWelcome() {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const clock = now.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' });
    const icon = saIcon('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>');
    return `<div class="sa-hello">
        <div><h1>Welcome Back, Admin!</h1><p class="sa-muted">Here's what's happening with your marketplace today.</p></div>
        <div class="sa-date"><span class="sa-cal">${icon}</span><div><strong>${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}</strong><span>${days[now.getDay()]}, ${clock}</span></div></div>
    </div>`;
}
