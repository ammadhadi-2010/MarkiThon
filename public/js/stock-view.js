function stockMarkup() {
    return `
    <div class="card">
        <div class="tabs">
            <button type="button" class="tab" data-sttab="in">Stock In</button>
            <button type="button" class="tab active" data-sttab="history">Stock History</button>
            <button type="button" class="tab" data-sttab="movement">Stock Movement</button>
        </div>
    </div>
    <div id="stInPanel" hidden>${typeof receiveMarkup === 'function' ? receiveMarkup() : ''}</div>
    <div id="stHistBlock">
        <div class="card stock-pick" id="stPickCard">
            <div class="field">
                <label>Product</label>
                <select id="stProduct" name="stProduct" autocomplete="off"></select>
            </div>
        </div>
        <div class="card" id="stHeroCard">
            <div class="product-hero">
                <img class="hero-img" id="stImage" alt="Product">
                <div class="hero-meta">
                    <h3 id="stTitle">Select a product</h3>
                    <p id="stSub">Category | Brand</p>
                    <div class="stock-now" id="stCurrent">Current Stock: 0 m</div>
                </div>
                <span class="in-stock" id="stBadge">In Stock</span>
            </div>
        </div>
        <div class="card" style="margin-top:16px" id="stLogCard">
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Quantity</th>
                            <th>Balance</th>
                            <th>Ref.</th>
                        </tr>
                    </thead>
                    <tbody id="stTable"></tbody>
                </table>
            </div>
            <button type="button" class="full-btn" id="stFull">View Full Stock Movement</button>
        </div>
    </div>`;
}
