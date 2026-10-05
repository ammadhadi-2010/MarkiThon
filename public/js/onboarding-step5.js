let obStaffCache = [];

function staffPayload() {
    return {
        fullName: document.getElementById('obStaffName').value,
        phone: document.getElementById('obStaffPhone').value,
        role: document.getElementById('obStaffRole').value,
        salary: document.getElementById('obStaffSalary').value
    };
}

function renderStaffTable() {
    const tbody = document.getElementById('obStaffTable');
    if (!tbody) return;
    tbody.innerHTML = obStaffCache.map((row, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${escapeHtml(row.fullName)}</td>
            <td>${escapeHtml(row.phone)}</td>
            <td>${escapeHtml(row.role)}</td>
            <td>Rs. ${Number(row.salary || 0).toLocaleString()}</td>
            <td><span class="ob-status">${escapeHtml(row.status || 'Active')}</span></td>
            <td class="col-actions">
                <button type="button" class="ob-icon-btn" data-staff-edit="${row.id}" title="Edit">✎</button>
                <button type="button" class="ob-icon-btn danger" data-staff-del="${row.id}" title="Delete">🗑</button>
            </td>
        </tr>`).join('') || '<tr><td colspan="7" class="empty">No staff members yet.</td></tr>';
}

function paintAccess(keys) {
    const enabled = Array.isArray(keys) ? keys : [];
    document.querySelectorAll('#obAccessRow input[type="checkbox"]').forEach((box) => {
        box.checked = enabled.includes(box.value);
    });
}

async function loadStaffStep() {
    const data = await api.get('/api/onboarding/step-4/staff');
    obStaffCache = Array.isArray(data.rows) ? data.rows : [];
    renderStaffTable();
    paintAccess(data.accessPermissions);
}

function openStaffModal(row) {
    document.getElementById('obStaffEditId').value = row ? row.id : '';
    document.getElementById('obStaffModalTitle').textContent = row ? 'Edit Staff Member' : 'Add Staff Member';
    document.getElementById('obStaffName').value = row ? row.fullName : '';
    document.getElementById('obStaffPhone').value = row ? row.phone : '';
    document.getElementById('obStaffRole').value = row ? row.role : 'Salesman';
    document.getElementById('obStaffSalary').value = row ? row.salary : '';
    document.getElementById('obStaffModal').classList.add('open');
}

async function saveStaffMember(event) {
    event.preventDefault();
    const id = document.getElementById('obStaffEditId').value;
    const payload = staffPayload();
    const data = id
        ? await api.put(`/api/onboarding/step-4/staff/${id}`, payload)
        : await api.post('/api/onboarding/step-4/staff', payload);
    showToast(data.message);
    document.getElementById('obStaffModal').classList.remove('open');
    document.getElementById('obStaffForm').reset();
    await loadStaffStep();
}

function selectedAccess() {
    return [...document.querySelectorAll('#obAccessRow input:checked')].map((box) => box.value);
}

async function saveOnboardingStep5(event) {
    event.preventDefault();
    const data = await api.post('/api/onboarding/step-4/permissions', {
        accessPermissions: selectedAccess()
    });
    showToast(data.message);
    await loadOnboardingStep1();
    showObStep(6);
}

function bindOnboardingStep5() {
    document.getElementById('obAddStaff').addEventListener('click', () => openStaffModal(null));
    document.getElementById('obStaffCancel').addEventListener('click', () => {
        document.getElementById('obStaffModal').classList.remove('open');
    });
    document.getElementById('obStaffForm').addEventListener('submit', (event) => {
        saveStaffMember(event).catch((err) => showToast(err.message));
    });
    document.getElementById('obStaffTable').addEventListener('click', async (event) => {
        const editId = event.target.closest('[data-staff-edit]')?.dataset.staffEdit;
        const delId = event.target.closest('[data-staff-del]')?.dataset.staffDel;
        if (editId) {
            const row = obStaffCache.find((s) => String(s.id) === String(editId));
            if (row) openStaffModal(row);
        }
        if (delId) {
            if (!confirm('Remove this staff member?')) return;
            try {
                showToast((await api.del(`/api/onboarding/step-4/staff/${delId}`)).message);
                await loadStaffStep();
            } catch (error) { showToast(error.message); }
        }
    });
    document.getElementById('obBack5').addEventListener('click', () => showObStep(4));
    document.getElementById('obCancel5').addEventListener('click', () => {
        loadStaffStep().catch((err) => showToast(err.message));
    });
    document.getElementById('obForm5').addEventListener('submit', (event) => {
        saveOnboardingStep5(event).catch((err) => showToast(err.message));
    });
}
