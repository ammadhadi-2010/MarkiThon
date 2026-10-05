function saStatus(value) {
    const key = String(value || 'New').toLowerCase().replace(/\s+/g, '-');
    return `<span class="sa-pill is-${key}">${value}</span>`;
}

function saShopsTable(shops) {
    const rows = shops.map((shop) => `<tr>
        <td>${saText(shop.name)}</td><td>${saText(shop.owner)}</td><td>${saStatus(shop.status)}</td>
        <td>${shop.products}</td><td>${shop.joined}</td>
    </tr>`).join('') || '<tr><td colspan="5">No shops yet.</td></tr>';
    return `<div class="sa-scroll"><table class="sa-table">
        <thead><tr><th>Shop Name</th><th>Owner</th><th>Status</th><th>Products</th><th>Joined</th></tr></thead>
        <tbody>${rows}</tbody>
    </table></div>`;
}

function saProductsTable(products) {
    const rows = (products || []).map((item) => `<tr>
        <td>${saText(item.title)}</td><td>${saText(item.category)}</td>
        <td>${saMoney(item.price)}</td><td>${saStatus(item.status)}</td>
    </tr>`).join('') || '<tr><td colspan="4">No products yet.</td></tr>';
    return `<div class="sa-scroll"><table class="sa-table">
        <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody>
    </table></div>`;
}

function saCustomersTable(customers) {
    const rows = (customers || []).map((row) => `<tr>
        <td>${saText(row.name)}</td><td>${saText(row.contact)}</td>
        <td>${saText(row.kind)}</td><td>${saStatus(row.status)}</td><td>${saText(row.joined)}</td>
    </tr>`).join('') || '<tr><td colspan="5">No customers yet.</td></tr>';
    return `<div class="sa-scroll"><table class="sa-table">
        <thead><tr><th>Name</th><th>Contact</th><th>Type</th><th>Status</th><th>Joined</th></tr></thead>
        <tbody>${rows}</tbody>
    </table></div>`;
}

function saOrdersTable(orders) {
    const rows = orders.map((order) => `<tr>
        <td>${saText(order.number)}</td><td>${saText(order.customer)}</td><td>${saMoney(order.total)}</td>
        <td>${saStatus(order.status)}</td><td>${order.date}</td>
    </tr>`).join('') || '<tr><td colspan="5">No marketplace orders yet.</td></tr>';
    return `<div class="sa-scroll"><table class="sa-table">
        <thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>${rows}</tbody>
    </table></div>`;
}
