function saHead(title, text) {
    return `<div class="sa-hello"><h1>${title}</h1><p class="sa-muted">${text}</p></div>`;
}

function saRoute(id, data) {
    if (id === 'shops') return '<div id="saShops"></div>';
    if (id === 'products') return '<div id="saProducts"></div>';
    if (id === 'orders') return '<div id="saOrders"></div>';
    if (id === 'customers') return '<div id="saCustomers"></div>';
    if (id === 'categories') return '<div id="saCategories"></div>';
    if (id === 'website') return '<div id="saCms"></div>';
    if (id === 'reports') {
        return `${saHead('Reports', 'Sales totals for the last seven days.')}
            ${saStatCards(data.stats)}
            <div class="sa-mid">
                <section class="sa-card">${saSalesChart(data.series)}</section>
                ${saMiniStats(data.stats)}
                ${saHealth(data.health)}
            </div>`;
    }
    if (id === 'complaints') return '<div id="saTickets"></div>';
    if (id === 'subscriptions') {
        return typeof saSubscriptionsMarkup === 'function'
            ? saSubscriptionsMarkup(null)
            : '<section class="sa-card"><h2>Subscription packages are unavailable.</h2></section>';
    }
    if (id === 'settings') {
        return `${saHead('Profile Settings', 'Manage Super Admin identity, contact details, and password.')}
            <div class="sa-low">
                ${typeof saAdminPassMarkup === 'function' ? saAdminPassMarkup() : ''}
                ${saHealth(data.health)}
            </div>`;
    }
    return '';
}
