function onboardingStep4Markup() {
    return `
        <form id="obForm4" class="ob-panel" data-obstep="4" hidden autocomplete="off">
            <div class="ob-bill-toggle" id="obBillToggle">
                <button type="button" class="on" data-bill="monthly">Monthly</button>
                <button type="button" data-bill="yearly">Yearly</button>
            </div>
            <input id="obSelectedPackage" name="obSelectedPackage" type="hidden" value="Basic" autocomplete="off">
            <input id="obBillingCycle" name="obBillingCycle" type="hidden" value="monthly" autocomplete="off">
            <div class="ob-plan-grid" id="obPlanGrid"></div>
            <div class="ob-actions spread">
                <button type="button" class="ghost" id="obBack4">← Back</button>
                <div class="ob-actions-right">
                    <button type="button" class="ghost" id="obCancel4">Cancel</button>
                    <button type="submit" class="primary" id="obNext4">Next →</button>
                </div>
            </div>
        </form>
        <div class="modal-back" id="obPayModal">
            <div class="modal-card ob-pay-card">
                <div class="card-title">Payment Method</div>
                <p class="ob-pay-amount" id="obPayAmount"></p>
                <div class="ob-pay-methods" id="obPayMethods">
                    <button type="button" class="ob-pay-chip on" data-pay="JazzCash">JazzCash</button>
                    <button type="button" class="ob-pay-chip" data-pay="EasyPaisa">EasyPaisa</button>
                    <button type="button" class="ob-pay-chip" data-pay="Bank Transfer">Bank Transfer</button>
                    <button type="button" class="ob-pay-chip" data-pay="Card">Card</button>
                </div>
                <div class="field" id="obTrxField">
                    <label>Transaction Reference (TRX ID) / Payment proof note</label>
                    <input id="obTrxId" name="obTrxId" autocomplete="off" placeholder="e.g. JC1234567890">
                </div>
                <div class="actions">
                    <button type="button" class="ghost" id="obPayCancel">Cancel</button>
                    <button type="button" class="primary" id="obPayConfirm">Submit Payment</button>
                </div>
            </div>
        </div>`;
}
