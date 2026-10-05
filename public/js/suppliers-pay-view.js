function suppliersQuickPayMarkup() {
    return `
        <div class="card recv-finance" id="supQuickPayCard">
            <div class="card-title">Supplier Payment &amp; Installment Details</div>
            <p class="wl-hint">Send installment payments against remaining mill dues. Register new suppliers from Inventory.</p>
            <form id="supQuickPayForm" autocomplete="off">
                <input id="supQuickRef" name="supQuickRef" type="hidden" autocomplete="off">
                <input id="supQuickDate" name="supQuickDate" type="hidden" autocomplete="off">
                <div class="field">
                    <label for="supQuickSupplier">Select Supplier</label>
                    <select id="supQuickSupplier" name="supQuickSupplier" autocomplete="off">
                        <option value="">Select supplier</option>
                    </select>
                </div>
                <div class="grid-2">
                    <div class="field">
                        <label for="supQuickStatus">Payment Status</label>
                        <select id="supQuickStatus" name="supQuickStatus" autocomplete="off">
                            <option value="partial">Partial Installment</option>
                            <option value="full">Full Settlement</option>
                        </select>
                    </div>
                    <div class="field">
                        <label for="supQuickMethod">Payment Method</label>
                        <select id="supQuickMethod" name="supQuickMethod" autocomplete="off">
                            <option value="Cash">Cash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="JazzCash">JazzCash</option>
                            <option value="EasyPaisa">EasyPaisa</option>
                        </select>
                    </div>
                </div>
                <div class="field">
                    <label for="supQuickAmt">Amount Paid Now</label>
                    <input id="supQuickAmt" name="supQuickAmt" type="number" min="0" step="0.01" placeholder="0" autocomplete="off">
                </div>
                <p id="supQuickDue" class="wl-hint">Ledger balance due: Rs. 0</p>
                <p id="supQuickBillHint" class="wl-hint"></p>
                <div class="field">
                    <label>Payment Slip / Transfer Proof</label>
                    <div class="recv-proof">
                        <img id="supQuickPrev" class="recv-proof-img" alt="Payment slip" hidden>
                        <span id="supQuickHint">Attach payment screenshot</span>
                    </div>
                    <input id="supQuickFile" name="supQuickFile" type="file" accept="image/*" autocomplete="off">
                    <input id="supQuickProof" name="supQuickProof" type="hidden" autocomplete="off">
                </div>
                <div class="actions">
                    <button type="submit" class="primary">Record Payment</button>
                </div>
            </form>
        </div>`;
}
