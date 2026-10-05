function wholesalersMarkup() {
    return `
    <div class="split">
        <div class="card">
            <div class="card-title"><span class="plus">+</span> Add Wholesaler</div>
            <p class="wl-hint">B2B clients who buy in bulk at wholesale rates.</p>
            <form id="wlForm" autocomplete="off">
                <input id="wlEditId" name="wlEditId" type="hidden" autocomplete="off">
                <div class="field"><label>Wholesaler Name</label>
                    <input id="wlName" name="wlName" required placeholder="Ahmed Traders" autocomplete="off"></div>
                <div class="field"><label>Business / Shop Name</label>
                    <input id="wlShop" name="wlShop" placeholder="Ahmed Fabric House" autocomplete="off"></div>
                <div class="grid-2">
                    <div class="field"><label>Phone</label>
                        <input id="wlPhone" name="wlPhone" required placeholder="0300-1234567" autocomplete="off"></div>
                    <div class="field"><label>Email</label>
                        <input id="wlEmail" name="wlEmail" type="email" placeholder="b2b@example.com" autocomplete="off"></div>
                </div>
                <div class="grid-2">
                    <div class="field"><label>City / Market Location</label>
                        <input id="wlCity" name="wlCity" placeholder="Lahore, Shah Alam Market" autocomplete="off"></div>
                    <div class="field"><label>Credit Limit (Rs.)</label>
                        <input id="wlCredit" name="wlCredit" type="number" min="0" step="1" value="0" autocomplete="off"></div>
                </div>
                <div class="field"><label>Notes</label>
                    <textarea id="wlNotes" name="wlNotes" placeholder="Delivery days, preferred brands..." autocomplete="off"></textarea></div>
                <div class="actions">
                    <button type="button" class="ghost" id="cancelWl">Cancel</button>
                    <button type="submit" class="primary">Save Wholesaler</button>
                </div>
            </form>
        </div>
        <div class="card">
            <div class="card-title">Wholesaler List</div>
            <div class="list-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>
                <input id="wlListSearch" name="wlListSearch" type="text" placeholder="Search wholesaler..." autocomplete="off">
            </div>
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Wholesaler</th>
                            <th>Bulk Orders</th>
                            <th>Credit Balance</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="wlTable"></tbody>
                </table>
            </div>
            <div id="wlEmpty" class="empty">No wholesalers yet. Add a B2B buyer.</div>
        </div>
    </div>
    <div id="wlLedgerCard" class="card wl-ledger" hidden>
        <div class="card-title">Wholesaler Ledger <button type="button" class="ghost" id="wlLedgerClose">Close</button></div>
        <p id="wlLedgerName" class="wl-hint"></p>
        <div class="table-wrap">
            <table>
                <thead><tr><th>Type</th><th>Amount</th><th>Note</th><th>Date</th></tr></thead>
                <tbody id="wlLedgerRows"></tbody>
            </table>
        </div>
        <form id="wlPayForm" class="wl-pay" autocomplete="off">
            <div class="field"><label>Payment (Rs.)</label>
                <input id="wlPayAmt" name="wlPayAmt" type="number" min="0.01" step="0.01" autocomplete="off"></div>
            <div class="field"><label>Note</label>
                <input id="wlPayNote" name="wlPayNote" placeholder="Cash, Bank" autocomplete="off"></div>
            <button type="submit" class="primary">Record Payment</button>
        </form>
    </div>`;
}
