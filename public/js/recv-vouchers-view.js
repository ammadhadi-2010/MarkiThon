function recvVouchersMarkup() {
    return `
    <div class="card recv-voucher-card" id="recvVoucherCard">
        <div class="card-title">Recent Stock Receipts / Vouchers</div>
        <div class="table-wrap">
            <table class="recv-voucher-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Voucher / Ref Bill No.</th>
                        <th>Supplier</th>
                        <th>Product &amp; Colors</th>
                        <th>Total Qty</th>
                        <th>Amount &amp; Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody id="recvVoucherBody">
                    <tr><td colspan="7" class="empty">Loading stock receipts...</td></tr>
                </tbody>
            </table>
        </div>
    </div>
    <div id="recvVoucherDel" class="modal-back">
        <div class="modal-card">
            <div class="card-title">Delete Receipt</div>
            <p id="recvVoucherDelText" class="wl-hint">Are you sure you want to delete voucher #... ?</p>
            <div class="actions">
                <button type="button" class="ghost" id="recvVoucherDelNo">Cancel</button>
                <button type="button" class="primary" id="recvVoucherDelYes">Delete Receipt</button>
            </div>
        </div>
    </div>`;
}
