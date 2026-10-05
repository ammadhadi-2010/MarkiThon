function expensesMarkup() {
    return `
    <div class="split">
        <div class="card">
            <div class="card-title">Add Expense</div>
            <form id="exForm" autocomplete="off">
                <div class="field"><label for="exTitle">Title</label>
                    <input id="exTitle" name="exTitle" required placeholder="Shop rent" autocomplete="off"></div>
                <div class="field"><label for="exCategory">Category</label>
                    <select id="exCategory" name="exCategory" autocomplete="off">
                        <option>Staff Salary</option>
                        <option>Staff Advance / Udhaar</option>
                        <option>Shop Rent &amp; Bills</option>
                        <option>Guest Hospitality / Tea</option>
                        <option>Delivery &amp; Transport</option>
                        <option selected>General Shop Expense</option>
                    </select></div>
                <div class="field" id="exStaffWrap" hidden>
                    <label for="exStaffId">Staff Member Name</label>
                    <select id="exStaffId" name="exStaffId" autocomplete="off">
                        <option value="">Select staff member</option>
                    </select>
                </div>
                <div class="grid-2">
                    <div class="field"><label for="exAmount">Amount (PKR)</label>
                        <input id="exAmount" name="exAmount" type="number" step="0.01" required placeholder="0" autocomplete="off"></div>
                    <div class="field"><label for="exDate">Date</label>
                        <input id="exDate" name="exDate" type="date" autocomplete="off"></div>
                </div>
                <div class="field"><label for="exNote">Note</label>
                    <input id="exNote" name="exNote" placeholder="Optional note" autocomplete="off"></div>
                <p id="exSalaryHint" class="wl-hint" hidden></p>
                <div class="actions"><button type="submit" class="primary">Save Expense</button></div>
            </form>
        </div>
        <div class="card">
            <div class="card-title">Expense List</div>
            <div class="table-wrap">
                <table>
                    <thead><tr><th>Date</th><th>Title</th><th>Category</th><th>Staff</th><th>Amount</th></tr></thead>
                    <tbody id="exTable"></tbody>
                </table>
            </div>
            <div class="summary-row grand"><span>Total</span><span id="exTotal">0</span></div>
        </div>
    </div>
    <div class="card" id="exStaffCard" style="margin-top:18px">
        <div class="card-title">Staff Account Ledger</div>
        <p class="wl-hint">Advances this month are deducted automatically when you save a salary payment.</p>
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Staff Member Name</th>
                        <th>Total Base Salary</th>
                        <th>Advance Taken This Month</th>
                        <th>Remaining Net Salary Payable</th>
                    </tr>
                </thead>
                <tbody id="exStaffTable"></tbody>
            </table>
        </div>
    </div>`;
}
