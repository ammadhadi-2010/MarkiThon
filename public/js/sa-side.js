function saQuickActions() {
    return `<section class="sa-card">
        <h3>Quick Actions</h3>
        <button class="sa-action" type="button" data-sa="shops">Review Shops</button>
        <button class="sa-action" type="button" data-sa="products">View Products</button>
        <button class="sa-action" type="button" data-sa="categories">View Categories</button>
        <button class="sa-action" type="button" data-sa="complaints">Support Queue</button>
    </section>`;
}

function saActivity(items) {
    const rows = items.map((item) => `<li><div><strong>${saText(item.title)}</strong><span class="sa-muted">${saText(item.text)}</span></div><span class="sa-muted">${saText(item.time)}</span></li>`).join('')
        || '<li>No recent marketplace activity.</li>';
    return `<section class="sa-card"><h3>Recent Activity</h3><ul class="sa-feed">${rows}</ul></section>`;
}

function saApprovals(rows) {
    const list = rows.map((row) => `<li>
        <div><strong>${saText(row.name)}</strong><div class="sa-muted">Pending approval · ${saText(row.wait)}${row.owner ? ' · ' + saText(row.owner) : ''}</div></div>
        <div>
            <button class="sa-approve" type="button" data-decide="${row.id}" data-status="approved">Approve</button>
            <button class="sa-reject" type="button" data-decide="${row.id}" data-status="rejected">Reject</button>
        </div>
    </li>`).join('') || '<li>No vendors registered for approval yet.</li>';
    return `<section class="sa-card"><div class="sa-head"><h3>Shop Approvals</h3></div><ul class="sa-feed">${list}</ul></section>`;
}

function saHealth(rows) {
    const list = rows.map((row) => `<li><span>${row.name}</span><span class="sa-ok">${row.state}</span></li>`).join('');
    return `<section class="sa-card"><div class="sa-head"><h3>System Health</h3><span class="sa-ok">Healthy</span></div><ul class="sa-health">${list}</ul></section>`;
}

function saMiniStats(stats) {
    return `<section class="sa-card">
        <h3>Marketplace Statistics</h3>
        <p>Total shops <strong>${stats.shops}</strong></p>
        <p>Total orders <strong>${stats.orders}</strong></p>
        <p>Today's sales <strong>${saMoney(stats.todaySales)}</strong></p>
        <p class="sa-note">Counts are read from live records. Stock rules stay inside each shop.</p>
    </section>`;
}
