function retailMarkup() {
    return `
    <div class="card">
        <div class="card-title"><span class="plus">+</span> New Retail Bill</div>
        <form id="rtForm" autocomplete="off">
            <div class="rt-head">
                <div class="field">
                    <label>Customer</label>
                    <select id="rtCustomer" name="rtCustomer" autocomplete="off">
                        <option value="walk-in">Walk-in Customer</option>
                    </select>
                </div>
                <button type="button" class="btn-new" id="rtNewCustomer">+ New Customer</button>
            </div>
            <div class="field list-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>
                <input id="rtSearch" name="rtSearch" placeholder="Search product by name, SKU or barcode..." autocomplete="off">
                <div id="rtHits" class="search-hits" hidden></div>
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
            <th class="pos-num">Unit Price (Rs.)</th>
                            <th>Qty</th>
                            <th class="pos-num">Total (Rs.)</th>
                            <th class="pos-num">Action</th>
                        </tr>
                    </thead>
                    <tbody id="rtLines"></tbody>
                </table>
            </div>
            <div class="split" style="margin-top:16px">
                <div>
                    <div class="grid-2">
                        <div class="field"><label>Discount</label>
                            <input id="rtDiscount" name="rtDiscount" type="number" step="0.01" value="0" autocomplete="off"></div>
                        <div class="field"><label>Type</label>
                            <select id="rtDiscountType" name="rtDiscountType" autocomplete="off">
                                <option value="percent">%</option>
                                <option value="flat">Flat Rs.</option>
                            </select></div>
                    </div>
                    <div class="field"><label>Notes</label>
                        <textarea id="rtNotes" name="rtNotes" placeholder="Regular Customer" autocomplete="off"></textarea></div>
                </div>
                <div>
                    <div class="summary-row"><span>Sub Total</span><strong id="rtSub">0</strong></div>
                    <div class="summary-row"><span>Discount</span><strong id="rtDiscVal">0</strong></div>
                    <div class="summary-row grand"><span>Grand Total</span><span id="rtGrand">0</span></div>
                    <label>Payment Method</label>
                    <div class="pay-row">
                        <button type="button" class="pay-btn active" data-rtpay="Cash">Cash</button>
                        <button type="button" class="pay-btn" data-rtpay="JazzCash">JazzCash</button>
                        <button type="button" class="pay-btn" data-rtpay="EasyPaisa">EasyPaisa</button>
                        <button type="button" class="pay-btn" data-rtpay="Bank Transfer">Bank Transfer</button>
                    </div>
                    <div class="print-actions">
                        <button type="submit" class="btn-save">Save Bill</button>
                        <button type="button" class="primary" id="rtPrint">Print Bill</button>
                    </div>
                </div>
            </div>
        </form>
    </div>
    <div class="modal-back" id="rtModal">
        <div class="modal-card">
            <div class="card-title">New Customer</div>
            <form id="rtCustForm" autocomplete="off">
                <div class="field"><label>Name</label>
                    <input id="rtCustName" name="rtCustName" required autocomplete="off"></div>
                <div class="field"><label>Phone</label>
                    <input id="rtCustPhone" name="rtCustPhone" autocomplete="off"></div>
                <div class="actions">
                    <button type="button" class="ghost" id="rtCustCancel">Cancel</button>
                    <button type="submit" class="primary">Save Customer</button>
                </div>
            </form>
        </div>
    </div>
    <div class="card" style="margin-top:18px">
        <div class="card-title">Saved Bills</div>
        <div class="table-wrap bills-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Bill</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Pay</th>
                        <th class="col-actions">Action</th>
                    </tr>
                </thead>
                <tbody id="rtBills"></tbody>
            </table>
        </div>
    </div>`;
}
