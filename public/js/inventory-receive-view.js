function receiveMarkup() {
    return `
    <div id="recvWrap">
    <div id="recvDone" class="card recv-done" hidden>
        <div class="card-title">Stock receipt saved</div>
        <p class="wl-hint" id="recvDoneText">Purchase posted to stock and the supplier ledger.</p>
        <div class="actions">
            <button type="button" class="primary" id="recvPrintQr">Print QR Labels</button>
            <button type="button" class="ghost" id="recvPrintInv">Print Supplier Invoice</button>
            <button type="button" class="ghost" id="recvNew">New Receipt</button>
        </div>
    </div>
    <form id="recvForm" autocomplete="off">
    <div class="split recv-layout">
        <div class="card">
            <div class="card-title">Stock In / Purchase Receipt</div>
            <p class="wl-hint">Receive the base catalog item, then enter every color on this invoice.</p>
            <div class="field">
                <label>Select Product *</label>
                <div class="list-search">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>
                    <input id="recvSearch" name="recvSearch" placeholder="Search catalog by name, SKU or barcode..." autocomplete="off">
                    <input id="recvProductId" name="recvProductId" type="hidden" autocomplete="off">
                    <input id="recvVoucherId" name="recvVoucherId" type="hidden" autocomplete="off">
                    <div id="recvHits" class="search-hits" hidden></div>
                </div>
            </div>
            <p id="recvOnHand" class="wl-hint">Select a catalog item to receive stock.</p>
            <div id="recvPickCard" class="recv-pick" hidden>
                <img id="recvThumb" class="hero-img" alt="Product">
                <div class="hero-meta">
                    <h3 id="recvPickTitle">Product</h3>
                    <p id="recvPickFabric"></p>
                    <span id="recvColorTag" class="recv-color-tag">Colors are entered in the batch table</span>
                </div>
            </div>
            <p id="recvMeta" class="wl-hint" hidden></p>
            <div class="grid-2">
                <div class="field"><label>Purchase Unit</label>
                    <select id="recvBuyUnit" name="recvBuyUnit" autocomplete="off">
                        <option>Meter</option><option>Gaz</option><option>Suit</option>
                        <option>Piece</option><option>Set</option>
                    </select></div>
                <div class="field"><label>Selling Unit</label>
                    <select id="recvSellUnit" name="recvSellUnit" autocomplete="off" disabled>
                        <option>Gaz</option>
                    </select></div>
            </div>
            <div class="field">
                <label>Select Supplier *</label>
                <select id="recvSupplierId" name="recvSupplierId" autocomplete="off">
                    <option value="">Select supplier</option>
                </select>
            </div>
            <div class="grid-2">
                <div class="field"><label>Invoice / Receiving Date *</label>
                    <input id="recvDate" name="recvDate" type="date" required autocomplete="off"></div>
                <div class="field"><label>Reference Bill No. *</label>
                    <input id="recvBill" name="recvBill" required placeholder="INV-1042" autocomplete="off"></div>
            </div>
            ${typeof recvProofField === 'function' ? recvProofField(
        'recvInvoiceFile', 'recvInvoiceImage', 'recvInvoicePrev', 'recvInvoiceHint',
        'Invoice Bill Photo / Scan', 'Attach supplier paper invoice'
    ) : ''}
            ${typeof recvVariantsMarkup === 'function' ? recvVariantsMarkup() : ''}
            <div id="recvConvert" class="inv-total-badge">Received 0 Meter = 0 Gaz available for POS</div>
        </div>
        ${typeof recvFinanceMarkup === 'function' ? recvFinanceMarkup() : ''}
    </div>
    </form>
    ${typeof recvVouchersMarkup === 'function' ? recvVouchersMarkup() : ''}
    <div id="recvConfirm" class="modal-back">
        <div class="modal-card">
            <div class="card-title">Confirm stock receipt</div>
            <p id="recvConfirmBody" class="wl-hint"></p>
            <div class="actions">
                <button type="button" class="ghost" id="recvConfirmNo">Cancel</button>
                <button type="button" class="primary" id="recvConfirmYes">Confirm &amp; Save</button>
            </div>
        </div>
    </div>
    </div>`;
}
