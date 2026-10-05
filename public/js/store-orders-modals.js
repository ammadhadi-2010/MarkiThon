function storeOrderDrawerMarkup() {
    return typeof storeOrderDetailMarkup === 'function' ? storeOrderDetailMarkup() : '';
}

function storeOrderManualMarkup() {
    return `
        <div class="modal-back" id="osOrdManual" hidden>
            <form class="modal-card" id="osOrdManualForm" autocomplete="off">
                <div class="card-title">Create Manual Order</div>
                <p class="wl-hint">Add a walk-in or WhatsApp order for Ammad Hadi Stor.</p>
                <div class="field">
                    <label>Customer Name *</label>
                    <input id="osManName" name="osManName" required placeholder="Customer name" autocomplete="off">
                </div>
                <div class="field">
                    <label>Phone Number</label>
                    <input id="osManPhone" name="osManPhone" placeholder="0300-1234567" autocomplete="off">
                </div>
                <div class="field">
                    <label>Item Title</label>
                    <input id="osManItem" name="osManItem" placeholder="Bedsheet / Blanket" autocomplete="off">
                </div>
                <div class="os-ord-grid">
                    <div class="field">
                        <label>Quantity *</label>
                        <input id="osManQty" name="osManQty" type="number" min="1" value="1" required autocomplete="off">
                    </div>
                    <div class="field">
                        <label>Total (Rs.) *</label>
                        <input id="osManTotal" name="osManTotal" type="number" min="0" step="1" required placeholder="0" autocomplete="off">
                    </div>
                </div>
                <div class="field">
                    <label>Payment</label>
                    <select id="osManPay" name="osManPay" autocomplete="off">
                        <option value="Paid">Paid</option>
                        <option value="COD">COD</option>
                    </select>
                </div>
                <div class="actions">
                    <button type="button" class="os-ord-cancel" id="osManCancel">Cancel</button>
                    <button type="submit" class="os-ord-submit">Create Order</button>
                </div>
            </form>
        </div>`;
}
