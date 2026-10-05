function custOpenForm(row) {
    const modal = document.getElementById('custFormModal');
    document.getElementById('custFormTitle').textContent = row ? 'Edit Customer' : 'Add New Customer';
    document.getElementById('custFormId').value = row ? row.id : '';
    document.getElementById('custFormName').value = row ? row.name : '';
    document.getElementById('custFormPhone').value = row ? row.phone : '';
    document.getElementById('custFormWa').value = row ? row.whatsapp : '';
    document.getElementById('custFormAddr').value = row ? row.address : '';
    document.getElementById('custFormArea').value = row ? row.area : '';
    document.getElementById('custFormStatus').value = row && row.status === 'Inactive' ? 'Inactive' : 'Active';
    document.getElementById('custFormVip').checked = Boolean(row && row.vip);
    modal.hidden = false;
    modal.classList.add('open');
}

function custCloseForm() {
    const modal = document.getElementById('custFormModal');
    modal.classList.remove('open');
    modal.hidden = true;
}

function custFormBody() {
    return {
        name: document.getElementById('custFormName').value,
        phone: document.getElementById('custFormPhone').value,
        whatsapp: document.getElementById('custFormWa').value,
        address: document.getElementById('custFormAddr').value,
        area: document.getElementById('custFormArea').value,
        status: document.getElementById('custFormStatus').value,
        vip: document.getElementById('custFormVip').checked
    };
}

function bindCustForm() {
    const modal = document.getElementById('custFormModal');
    const form = document.getElementById('custForm');
    const cancel = document.getElementById('custFormCancel');
    const add = document.getElementById('custAddBtn');
    if (add && !add.dataset.bound) {
        add.dataset.bound = '1';
        add.addEventListener('click', () => custOpenForm(null));
    }
    if (cancel && !cancel.dataset.bound) {
        cancel.dataset.bound = '1';
        cancel.addEventListener('click', custCloseForm);
    }
    if (form && !form.dataset.bound) {
        form.dataset.bound = '1';
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const id = document.getElementById('custFormId').value;
            const body = custFormBody();
            const data = id
                ? await api.put('/api/retail/customers/' + id, body)
                : await api.post('/api/retail/customers', body);
            showToast(data.message);
            custCloseForm();
            await loadCustDash({ keepPage: true });
            if (custDetailId && typeof paintCustDetail === 'function') {
                paintCustDetail(custFind(custDetailId));
            }
        });
    }
    if (modal && !modal.dataset.bound) {
        modal.dataset.bound = '1';
        modal.addEventListener('click', (event) => {
            if (event.target === modal) custCloseForm();
        });
    }
}
