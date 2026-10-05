function suppliersLedgerMarkup() {
    return `
    <div id="supLedgerCard" class="card recv-finance" hidden style="margin-top:18px">
        <div class="card-title">Ledger History
            <button type="button" class="ghost" id="supLedgerClose">Close</button>
        </div>
        <p id="supLedgerName" class="wl-hint">Open a supplier to view purchase and payment history.</p>
        <div class="sup-ledger-stats">
            <div class="sup-stat"><span>Total stock purchase</span><strong id="supStatPurchase">Rs. 0</strong></div>
            <div class="sup-stat"><span>Paid at Stock In</span><strong id="supStatInitial">Rs. 0</strong></div>
            <div class="sup-stat"><span>Installments paid</span><strong id="supStatInstall">Rs. 0</strong></div>
            <div class="sup-stat due"><span>Due Amount</span><strong id="supStatDue">Rs. 0</strong></div>
        </div>
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Voucher / Bill No.</th>
                        <th>Purchase</th>
                        <th>Paid</th>
                        <th>Due Amount</th>
                    </tr>
                </thead>
                <tbody id="supBillRows"></tbody>
            </table>
        </div>
        <div class="card-title" style="margin-top:12px">Ledger entries</div>
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Entry</th>
                        <th>Debit</th>
                        <th>Credit</th>
                        <th>Voucher / Ref</th>
                        <th>Method / Txn</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody id="supLedgerRows"></tbody>
            </table>
        </div>
    </div>`;
}
