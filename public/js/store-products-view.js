function storeProductsMarkup() {
    return `
        <section class="card os-card" id="osProductsCard">
            <div class="os-card-head os-prod-head">
                <div>
                    <div class="card-title">Product Control</div>
                    <p class="wl-hint">Manage product visibility, pricing and featured status on your website.</p>
                </div>
                <div class="os-toolbar">
                    <div class="os-tool-row">
                        <a class="os-public-btn" id="osViewPublic" href="/ammadhadistor" target="_blank" rel="noopener">View Public Store</a>
                        <select id="osCatFilter" name="osCatFilter" autocomplete="off">
                            <option value="">All Categories</option>
                        </select>
                    </div>
                    <div class="os-tool-row">
                        <div class="field list-search os-search">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/>
                            </svg>
                            <input id="osSearch" name="osSearch" placeholder="Search products..." autocomplete="off">
                        </div>
                        <select id="osStatusFilter" name="osStatusFilter" autocomplete="off">
                            <option value="">All Status</option>
                            <option value="published">Published</option>
                            <option value="hidden">Hidden</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="table-wrap os-table-wrap">
                <table class="os-table">
                    <thead>
                        <tr>
                            <th class="os-check"><input id="osCheckAll" name="osCheckAll" type="checkbox" autocomplete="off"></th>
                            <th>Product</th>
                            <th>Website Status</th>
                            <th>Online Price</th>
                            <th>Discount Price</th>
                            <th>Featured</th>
                            <th>Stock Status</th>
                            <th>Order</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="osTable"></tbody>
                </table>
            </div>
            <div class="os-foot">
                <span id="osPageLabel">Showing 0 of 0 products</span>
                <div class="os-pager" id="osPager"></div>
            </div>
        </section>`;
}
