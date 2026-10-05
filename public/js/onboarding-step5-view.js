function onboardingStep5Markup() {
    const roles = ['Manager', 'Salesman', 'Inventory Staff', 'Helper', 'Accountant'];
    const access = ['Owner', 'Manager', 'Salesman', 'Inventory Staff', 'Accountant'];
    return `
        <form id="obForm5" class="ob-panel" data-obstep="5" hidden autocomplete="off">
            <div class="ob-staff-bar">
                <p class="ob-label" style="margin:0">Staff list</p>
                <button type="button" class="primary" id="obAddStaff">+ Add Staff Member</button>
            </div>
            <div class="table-wrap bills-wrap">
                <table class="ob-staff-table">
                    <thead>
                        <tr>
                            <th>#</th><th>Name</th><th>Phone</th><th>Role</th>
                            <th>Salary</th><th>Status</th><th class="col-actions">Action</th>
                        </tr>
                    </thead>
                    <tbody id="obStaffTable"></tbody>
                </table>
            </div>
            <div class="ob-access">
                <p class="ob-label">Access Permissions</p>
                <div class="ob-access-row" id="obAccessRow">
                    ${access.map((key) => `
                        <label class="ob-access-chip">
                            <input type="checkbox" name="obAccess${key.replace(/\s/g, '')}"
                                value="${key}" checked autocomplete="off">
                            ${key}
                        </label>`).join('')}
                </div>
            </div>
            <div class="ob-actions spread">
                <button type="button" class="ghost" id="obBack5">← Back</button>
                <div class="ob-actions-right">
                    <button type="button" class="ghost" id="obCancel5">Cancel</button>
                    <button type="submit" class="primary" id="obNext5">Next →</button>
                </div>
            </div>
        </form>
        <div class="modal-back" id="obStaffModal">
            <div class="modal-card">
                <div class="card-title" id="obStaffModalTitle">Add Staff Member</div>
                <form id="obStaffForm" autocomplete="off">
                    <input type="hidden" id="obStaffEditId" name="obStaffEditId" autocomplete="off">
                    <div class="field"><label>Name *</label>
                        <input id="obStaffName" name="obStaffName" required placeholder="Staff name" autocomplete="off"></div>
                    <div class="field"><label>Phone *</label>
                        <input id="obStaffPhone" name="obStaffPhone" required placeholder="0301-1112222" autocomplete="off"></div>
                    <div class="field"><label>Role *</label>
                        <select id="obStaffRole" name="obStaffRole" required autocomplete="off">
                            ${roles.map((r) => `<option value="${r}">${r}</option>`).join('')}
                        </select></div>
                    <div class="field"><label>Salary (Rs.)</label>
                        <input id="obStaffSalary" name="obStaffSalary" type="number" min="0" step="0.01"
                            placeholder="15000" autocomplete="off"></div>
                    <div class="actions">
                        <button type="button" class="ghost" id="obStaffCancel">Cancel</button>
                        <button type="submit" class="primary">Save Staff</button>
                    </div>
                </form>
            </div>
        </div>`;
}
