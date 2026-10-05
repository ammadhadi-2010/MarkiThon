function invoiceModalMarkup() {
    return `
    <div class="invoice-back print-thermal" id="invoiceBack">
        <div class="invoice-frame">
            <div class="inv-modal-head">
            <div class="inv-format" id="invFormatBar">
                <label class="inv-format-opt">
                    <input type="radio" name="invPrintFormat" value="thermal" checked autocomplete="off">
                    POS Thermal Printer (80mm / 58mm)
                </label>
                <label class="inv-format-opt">
                    <input type="radio" name="invPrintFormat" value="a4" autocomplete="off">
                    Standard A4 Page / Desk Printer
                </label>
            </div>
            <button type="button" class="inv-close-x" id="invCloseX" aria-label="Close">×</button>
            </div>
            <div class="inv-preview-scroll">
            <div class="inv-sheet thermal-slip printable-area" id="printable-receipt">
                <header class="inv-brand">
                    <p class="inv-platform">MarkiThon — www.markithon.com</p>
                    <div class="inv-shop-block">
                        <p class="slip-shop" id="invShopName">Ammad Hadi Stor</p>
                        <p class="slip-contact" id="invShopContact"></p>
                    </div>
                </header>
                <div class="slip-dash inv-rule"></div>
                <p class="slip-num" id="invNumber">Invoice</p>
                <p id="invDate"></p>
                <p class="pay-badge" id="invPay"></p>
                <div class="slip-dash inv-rule"></div>
                <p id="invCustName"></p>
                <p id="invCustPhone"></p>
                <div class="slip-dash inv-rule"></div>
                <table class="slip-table inv-thermal-table">
                    <thead>
                        <tr>
                            <th>Qty</th>
                            <th>Item</th>
                            <th>Rate</th>
                            <th>Amt</th>
                        </tr>
                    </thead>
                    <tbody id="invItems"></tbody>
                </table>
                <table class="inv-a4-table">
                    <thead>
                        <tr>
                            <th>Sr #</th>
                            <th>Description / Color</th>
                            <th>Quantity / Meters</th>
                            <th>Rate</th>
                            <th>Total Amount</th>
                        </tr>
                    </thead>
                    <tbody id="invA4Items"></tbody>
                </table>
                <div class="slip-dash inv-rule inv-thermal-only"></div>
                <div class="inv-finance">
                    <div class="slip-row"><span>Subtotal</span><span id="invSub">0</span></div>
                    <div class="slip-row"><span>Tax</span><span id="invTax">0</span></div>
                    <div class="slip-row"><span>Discount</span><span id="invDisc">0</span></div>
                    <div class="slip-row"><span>Paid</span><span id="invPaid">0</span></div>
                    <div class="slip-row slip-grand"><span>Grand Total</span><span id="invGrand">0</span></div>
                </div>
                <div class="slip-dash inv-rule"></div>
                <div class="inv-barcode-wrap">
                    <div id="invBarcodeMount" class="inv-barcode-svg"></div>
                    <span id="invBarcodeText"></span>
                </div>
                <p class="slip-thanks">Thank you for shopping at Ammad Hadi Stor.</p>
                <div id="invQrMount" class="qr-sheet" hidden></div>
            </div>
            </div>
            <div class="invoice-actions">
                <button type="button" class="primary" id="invPrint">Print Receipt</button>
                <button type="button" class="ghost" id="invClose">Close</button>
            </div>
        </div>
    </div>`;
}
