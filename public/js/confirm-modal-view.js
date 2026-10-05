function confirmDelMarkup() {
    return `
    <div id="confirmDel" class="modal-back" hidden>
        <div class="modal-card confirm-del-card" role="dialog" aria-modal="true" aria-labelledby="confirmDelTitle">
            <div class="card-title" id="confirmDelTitle">Delete record</div>
            <p class="confirm-del-name" id="confirmDelName"></p>
            <p class="wl-hint" id="confirmDelText">Are you sure you want to delete this record? This action cannot be undone.</p>
            <div class="actions">
                <button type="button" class="ghost" id="confirmDelNo" autocomplete="off">Cancel</button>
                <button type="button" class="confirm-del-yes" id="confirmDelYes" autocomplete="off">Delete</button>
            </div>
        </div>
    </div>`;
}
