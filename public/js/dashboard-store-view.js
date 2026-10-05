function dashboardStoreMarkup() {
    return `
        <section class="card dash-store" id="oscCard">
            <div class="card-title">Online Store Control</div>
            <form id="oscForm" class="osc-grid" autocomplete="off">
                <div class="osc-row">
                    <div>
                        <strong>Product Visibility</strong>
                        <span id="oscVisibleLabel">ON</span>
                    </div>
                    <label class="osc-switch">
                        <input id="oscVisible" name="oscVisible" type="checkbox" role="switch" autocomplete="off">
                        <span></span>
                    </label>
                </div>
                <div class="osc-row">
                    <div>
                        <strong>Show on Markithon Marketplace</strong>
                        <span id="oscMarketLabel">ON</span>
                    </div>
                    <label class="osc-switch">
                        <input id="oscMarket" name="oscMarket" type="checkbox" role="switch" autocomplete="off">
                        <span></span>
                    </label>
                </div>
                <div class="osc-row">
                    <label for="oscStock">Stock Visibility</label>
                    <select id="oscStock" name="oscStock" autocomplete="off">
                        <option value="exact">Show exact quantity</option>
                        <option value="instock">Show 'In Stock' only</option>
                    </select>
                </div>
                <div class="osc-row">
                    <div>
                        <strong>Featured Product Status</strong>
                        <span id="oscFeaturedLabel">OFF</span>
                    </div>
                    <label class="osc-switch">
                        <input id="oscFeatured" name="oscFeatured" type="checkbox" role="switch" autocomplete="off">
                        <span></span>
                    </label>
                </div>
                <div class="osc-row">
                    <div>
                        <strong>Online Orders Acceptance</strong>
                        <span id="oscOrdersLabel">ON</span>
                    </div>
                    <label class="osc-switch">
                        <input id="oscOrders" name="oscOrders" type="checkbox" role="switch" autocomplete="off">
                        <span></span>
                    </label>
                </div>
                <div class="osc-row osc-status">
                    <span>Shop Status</span>
                    <div class="seg" role="radiogroup" aria-label="Shop Status">
                        <button type="button" data-oscshop="open">Open</button>
                        <button type="button" data-oscshop="closed">Temporarily Closed</button>
                    </div>
                </div>
            </form>
        </section>`;
}
