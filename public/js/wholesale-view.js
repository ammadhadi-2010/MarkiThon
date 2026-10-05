function wholesaleMarkup() {
    return `
    <div class="card">
        <div class="card-title">New Wholesale Order</div>
        <form id="wsForm" autocomplete="off">
            <div class="ws-head">
                <div class="field">
                    <label>Wholesaler</label>
                    <select id="wsCustomer" name="wsCustomer" autocomplete="off"></select>
                </div>
                <div class="field">
                    <label>Phone</label>
                    <input id="wsPhone" name="wsPhone" placeholder="0333-1112222" autocomplete="off">
                </div>
                <button type="button" class="primary" id="wsViewCustomer">View</button>
            </div>
            <div class="field list-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>
                <input id="wsSearch" name="wsSearch" placeholder="Search product by name, SKU or barcode..." autocomplete="off">
                <div id="wsHits" class="search-hits" hidden></div>
            </div>
            <div class="table-wrap pos-cart-wrap">
                <table class="pos-cart">
                    <colgroup>
                        <col class="pos-col-num">
                        <col class="pos-col-prod">
                        <col class="pos-col-rate">
                        <col class="pos-col-qty">
                        <col class="pos-col-total">
                        <col class="pos-col-act">
                    </colgroup>
                    <thead>
                        <tr>
                            <th class="pos-num">#</th>
                            <th>Product</th>
                            <th class="pos-num">Rate (Rs.)</th>
                            <th>Qty</th>
                            <th class="pos-num">Total (Rs.)</th>
                            <th class="pos-num">Action</th>
                        </tr>
                    </thead>
                    <tbody id="wsLines"></tbody>
                </table>
            </div>
            <div class="split" style="margin-top:16px">
                <div>
                    <div class="grid-2">
                        <div class="field"><label>Discount</label>
                            <input id="wsDiscount" name="wsDiscount" type="number" step="0.01" value="0" autocomplete="off"></div>
                        <div class="field"><label>Type</label>
                            <select id="wsDiscountType" name="wsDiscountType" autocomplete="off">
                                <option value="percent">%</option>
                                <option value="flat">Flat Rs.</option>
                            </select></div>
                    </div>
                    <div class="field"><label>Notes</label>
                        <textarea id="wsNotes" name="wsNotes" placeholder="Bulk order notes" autocomplete="off"></textarea></div>
                </div>
                <div>
                    <div class="summary-row"><span>Sub Total</span><strong id="wsSub">0</strong></div>
                    <div class="summary-row"><span>Discount</span><strong id="wsDiscVal">0</strong></div>
                    <div class="summary-row grand"><span>Grand Total</span><span id="wsGrand">0</span></div>
                    <label>Payment Method</label>
                    <div class="pay-row">
                        <button type="button" class="pay-btn active" data-pay="Cash">Cash</button>
                        <button type="button" class="pay-btn" data-pay="Bank Transfer">Bank Transfer</button>
                        <button type="button" class="pay-btn" data-pay="JazzCash">JazzCash</button>
                        <button type="button" class="pay-btn" data-pay="EasyPaisa">EasyPaisa</button>
                    </div>
                    <div class="print-actions">
                        <button type="submit" class="ghost">Save Order</button>
                        <button type="button" class="primary" id="wsPrint">Print Bill</button>
                    </div>
                </div>
            </div>
        </form>
    </div>
    <div class="card" style="margin-top:18px">
        <div class="card-title">Order History</div>
        <div class="table-wrap bills-wrap">
            <table>
                <thead><tr><th>Order</th><th>Wholesaler</th><th>Total</th><th>Pay</th><th class="col-actions">Action</th></tr></thead>
                <tbody id="wsOrders"></tbody>
            </table>
        </div>
    </div>`;
}
