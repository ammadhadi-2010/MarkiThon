function storeOrderDetailMarkup() {
    return `
        <div class="os-od-back" id="osOrdDrawer" hidden>
            <section class="os-od-sheet" role="dialog" aria-labelledby="osOdTitle">
                <div class="os-od-head">
                    <div class="os-od-id">
                        <span class="os-od-ico" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="8" r="3.5"/><path d="M5 19c1.5-3.5 4-5 7-5s5.5 1.5 7 5"/>
                            </svg>
                        </span>
                        <div>
                            <div class="os-od-title-row">
                                <h2 class="os-od-label">Order Details</h2>
                                <span id="osOdStatus"></span>
                            </div>
                            <p class="os-od-num" id="osOdTitle">#—</p>
                            <p class="os-od-when" id="osOdWhen"></p>
                        </div>
                    </div>
                    <div class="os-od-quick">
                        <a class="os-od-btn call" id="osOdCall" href="#" target="_self">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M6 4h3l2 5-2 1a12 12 0 0 0 6 6l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 6a2 2 0 0 1 2-2z"/>
                            </svg>
                            Call
                        </a>
                        <a class="os-od-btn wa" id="osOdWa" href="#" target="_blank" rel="noopener">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3zm4.7 12.6c-.2.6-1.2 1.1-1.6 1.1-.4 0-.8.2-2.7-.6-2.3-1-3.8-3.4-3.9-3.6-.1-.2-1-1.3-1-2.5s.6-1.8.9-2 .3-.3.5-.3h.4c.1 0 .3 0 .4.3l.6 1.5c.1.2 0 .3 0 .5l-.3.5c-.1.1-.2.3 0 .5.3.5.8 1.1 1.3 1.5.6.5 1.2.8 1.5.9.2.1.4.1.5-.1l.5-.6c.1-.1.3-.1.5 0l1.6.8c.2.1.3.2.3.4s-.1 1.2-.3 1.4z"/>
                            </svg>
                            WhatsApp
                        </a>
                        <button type="button" class="os-od-btn print" id="osOdPrint">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M6 9V3h12v6M6 17H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/>
                                <rect x="6" y="13" width="12" height="8" rx="1"/>
                            </svg>
                            Print Invoice
                        </button>
                        <button type="button" class="os-ord-close" id="osOrdDrawerClose">Close</button>
                    </div>
                </div>
                <div class="os-od-card">
                    <div class="os-od-card-h">
                        <strong class="os-od-sec">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="8" r="3.5"/><path d="M5 19c1.5-3.5 4-5 7-5s5.5 1.5 7 5"/>
                            </svg>
                            Customer Information
                        </strong>
                        <button type="button" class="os-od-edit" id="osOdEdit">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>
                            </svg>
                            Edit
                        </button>
                    </div>
                    <div class="os-od-cust-grid">
                        <div id="osOdCust"></div>
                        <div class="os-od-addr" id="osOdAddr"></div>
                    </div>
                </div>
                <div class="os-od-card">
                    <div class="os-od-card-h">
                        <strong class="os-od-sec">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/>
                                <path d="M3 4h2l2.4 11h10.2l2-7H7"/>
                            </svg>
                            Order Items
                        </strong>
                    </div>
                    <div class="os-od-table-wrap">
                        <table class="os-od-table">
                            <thead>
                                <tr>
                                    <th class="os-od-col-prod">Product</th>
                                    <th class="os-od-col-num">Qty</th>
                                    <th class="os-od-col-num">Unit Price</th>
                                    <th class="os-od-col-num">Discount</th>
                                    <th class="os-od-col-num">Total</th>
                                </tr>
                            </thead>
                            <tbody id="osOdItems"></tbody>
                        </table>
                    </div>
                </div>
                <div class="os-od-card os-od-paywrap">
                    <div class="os-od-split">
                        <div id="osOdPay"></div>
                        <div id="osOdSum"></div>
                    </div>
                </div>
                <div class="os-od-card" id="osOdShip"></div>
                <div class="os-od-card">
                    <strong class="os-od-sec">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
                        </svg>
                        Status Update
                    </strong>
                    <ol class="os-od-time" id="osOdTime"></ol>
                    <div class="os-od-acts">
                        <button type="button" class="os-od-danger" data-osordact="Cancelled">Cancel Order</button>
                        <button type="button" class="os-od-mark blue" data-osordact="Confirmed">Mark Confirmed</button>
                        <button type="button" class="os-od-mark purple" data-osordact="Dispatched">Mark Dispatched</button>
                        <button type="button" class="os-od-mark green" data-osordact="Completed">Mark Completed</button>
                    </div>
                </div>
            </section>
        </div>
        <div class="modal-back" id="osOdCustModal" hidden>
            <form class="modal-card" id="osOdCustForm" autocomplete="off">
                <div class="card-title">Edit Customer</div>
                <div class="field"><label>Name *</label>
                    <input id="osOdName" name="osOdName" required autocomplete="off"></div>
                <div class="field"><label>Phone</label>
                    <input id="osOdPhone" name="osOdPhone" autocomplete="off"></div>
                <div class="field"><label>WhatsApp</label>
                    <input id="osOdWhatsapp" name="osOdWhatsapp" autocomplete="off"></div>
                <div class="field"><label>Delivery Address</label>
                    <textarea id="osOdAddress" name="osOdAddress" rows="3" autocomplete="off"></textarea></div>
                <div class="actions">
                    <button type="button" class="os-ord-cancel" id="osOdCustCancel">Cancel</button>
                    <button type="submit" class="os-ord-submit">Save Customer</button>
                </div>
            </form>
        </div>`;
}
