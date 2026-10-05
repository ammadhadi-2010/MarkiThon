function custDetailMarkup() {
    return `
        <div class="cust-d-back" id="custDetail" hidden>
            <section class="cust-d-sheet" role="dialog" aria-labelledby="custDTitle">
                <div class="cust-d-top">
                    <h2 class="cust-d-title" id="custDTitle">Customer Details</h2>
                    <button type="button" class="cust-d-x" id="custDClose" aria-label="Close">×</button>
                </div>
                <div class="cust-d-hero">
                    <span class="cust-d-ava" id="custDAva">BA</span>
                    <div class="cust-d-who">
                        <p class="cust-d-name">
                            <strong id="custDName">—</strong>
                            <span class="cust-vip" id="custDVip" hidden>VIP</span>
                        </p>
                        <p class="cust-d-phone" id="custDPhone"></p>
                    </div>
                    <span id="custDStatus"></span>
                </div>
                <div class="cust-d-contact">
                    <button type="button" class="cust-d-btn call" data-cdact="call">Call</button>
                    <button type="button" class="cust-d-btn wa" data-cdact="wa">WhatsApp</button>
                    <button type="button" class="cust-d-btn msg" data-cdact="msg">Send Message</button>
                </div>
                <div class="cust-d-meta" id="custDMeta"></div>
                <div class="cust-d-kpis" id="custDKpis"></div>
                <div class="cust-d-tabs" id="custDTabs">
                    <button type="button" class="on" data-cdtab="orders">Order History</button>
                    <button type="button" data-cdtab="pays">Payment History</button>
                    <button type="button" data-cdtab="notes">Notes</button>
                </div>
                <div class="cust-d-panel" id="custDOrders"></div>
                <div class="cust-d-panel" id="custDPays" hidden></div>
                <div class="cust-d-panel" id="custDNotes" hidden></div>
                <div class="cust-d-quick">
                    <p>Quick Actions</p>
                    <div class="cust-d-qrow">
                        <button type="button" class="cust-d-btn edit" data-cdact="edit">Edit Customer</button>
                        <button type="button" class="cust-d-btn call" data-cdact="call">Call</button>
                        <button type="button" class="cust-d-btn wa" data-cdact="wa">WhatsApp</button>
                    </div>
                    <div class="cust-d-qrow">
                        <button type="button" class="cust-d-btn note" data-cdact="note">Add Note</button>
                        <button type="button" class="cust-d-btn block" data-cdact="block">Block Customer</button>
                    </div>
                </div>
            </section>
        </div>`;
}
