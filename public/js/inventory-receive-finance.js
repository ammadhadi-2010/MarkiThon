function recvFinanceMarkup() {
    return `
        <div class="card recv-finance">
            <div class="card-title">Purchase, Payment &amp; Selling Rates</div>
            <section class="recv-step">
                <h4>1. Purchase Rate</h4>
                <div class="recv-rate-grid">
                    <div class="field">
                        <label id="recvRateLabel" for="recvPurchase">Purchase Rate (Per Unit)</label>
                        <input id="recvPurchase" name="recvPurchase" type="number" min="0" step="0.01" placeholder="0" autocomplete="off">
                    </div>
                    <div class="field">
                        <label id="recvQtyLabel" for="recvQtySync">Total Quantity (Meters/Gaz)</label>
                        <input id="recvQtySync" name="recvQtySync" type="number" min="0" step="0.01" placeholder="0" autocomplete="off" readonly>
                    </div>
                    <div class="field">
                        <label for="recvAmount">Total Purchase Amount</label>
                        <input id="recvAmount" name="recvAmount" type="number" min="0" step="0.01" placeholder="0" autocomplete="off">
                    </div>
                </div>
                <div id="recvTotal" class="inv-total-badge">Purchase Total: Rs. 0</div>
                <p class="wl-hint">Quantity follows the color batch grand total. Amount is rate × quantity and can be rounded.</p>
            </section>
            <section class="recv-step">
                <h4>2. Payment Details</h4>
                <div class="grid-2">
                    <div class="field">
                        <label>Payment Status</label>
                        <select id="recvPayMode" name="recvPayMode" autocomplete="off">
                            <option value="full">Paid (Cash / Bank)</option>
                            <option value="credit">Unpaid (Credit)</option>
                            <option value="partial">Partial Payment</option>
                        </select>
                    </div>
                    <div class="field" id="recvMethodField">
                        <label>Pay Method</label>
                        <select id="recvPayMethod" name="recvPayMethod" autocomplete="off">
                            <option>Cash</option>
                            <option>Bank</option>
                        </select>
                    </div>
                </div>
                <div id="recvPaidWrap" class="field" hidden>
                    <label>Amount Paid Now</label>
                    <input id="recvPaidNow" name="recvPaidNow" type="number" min="0" step="0.01" placeholder="0" autocomplete="off">
                </div>
                <p id="recvBalance" class="wl-hint">Ledger balance due: Rs. 0</p>
                <div id="recvPayProofWrap">
                    ${typeof recvProofField === 'function' ? recvProofField(
        'recvPayProofFile', 'recvPayProofImage', 'recvPayProofPrev', 'recvPayProofHint',
        'Payment Slip / Transfer Proof', 'Attach payment screenshot'
    ) : ''}
                    <p class="wl-hint">This slip is saved on this installment. Later installments are recorded in Suppliers → Ledger.</p>
                </div>
            </section>
            <section class="recv-step">
                <h4>3. Selling Rates</h4>
                <div class="field"><label>Wholesale Selling Rate</label>
                    <input id="recvWholesale" name="recvWholesale" type="number" min="0" step="0.01" placeholder="0" autocomplete="off"></div>
                <div class="field"><label>Retail Selling Rate</label>
                    <input id="recvRetail" name="recvRetail" type="number" min="0" step="0.01" placeholder="0" autocomplete="off"></div>
                <div class="field"><label>Target / Min Selling Rate</label>
                    <input id="recvMinRate" name="recvMinRate" type="number" min="0" step="0.01" placeholder="Optional" autocomplete="off">
                    <p class="wl-hint">POS shows this as Min: Rs. during bargaining. Cashiers can still override below it.</p>
                </div>
                <p class="wl-hint">Previous catalog rates are pre-filled and stay editable for this receipt.</p>
                <div class="profit-box">
                    <h4>Profit Margin (per unit)</h4>
                    <div class="profit-row"><span>Wholesale Profit</span><strong class="good" id="recvWsProfit">Rs.0 (0%)</strong></div>
                    <div class="profit-row"><span>Retail Profit</span><strong class="retail" id="recvRtProfit">Rs.0 (0%)</strong></div>
                </div>
            </section>
            <div class="actions recv-save-actions">
                <button type="button" class="ghost" id="recvCancel">Clear Receipt</button>
                <button type="submit" class="primary" id="recvSave">Save Stock Receipt</button>
            </div>
        </div>`;
}
