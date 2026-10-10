async function saAdminUploadAvatarFile(file) {
    if (!file) return null;
    if (!String(file.type || '').startsWith('image/')) {
        throw new Error('Choose a PNG, JPG, or WebP image.');
    }
    if (file.size > 2 * 1024 * 1024) {
        throw new Error('Image must be under 2 MB.');
    }
    const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Could not read the image file.'));
        reader.readAsDataURL(file);
    });
    const response = await fetch('/api/admin/profile/avatar', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ data: dataUrl })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Could not upload the profile image.');
    if (data.token) {
        localStorage.setItem('mtAuthToken:admin', data.token);
        localStorage.setItem('mtAuthToken', data.token);
    }
    return data.user || null;
}

function saAdminPreviewLocalFile(file) {
    if (!file || !String(file.type || '').startsWith('image/')) return;
    const box = document.getElementById('saAdminAvatar');
    if (!box) return;
    const url = URL.createObjectURL(file);
    box.innerHTML = `<img src="${url}" alt="">`;
}

function saBindAdminAvatarInput() {
    const input = document.getElementById('saAdminAvatarFile');
    if (!input || input.dataset.bound === '1') return;
    input.dataset.bound = '1';
    input.addEventListener('change', () => {
        const file = input.files && input.files[0];
        const note = document.getElementById('saAvatarNote');
        if (!file) return;
        if (note) note.textContent = 'Uploading…';
        saAdminPreviewLocalFile(file);
        saAdminUploadAvatarFile(file)
            .then((user) => {
                if (typeof saAdminRefreshUser === 'function') saAdminRefreshUser(user);
                if (note) note.textContent = 'Profile photo updated.';
                if (typeof saShowToast === 'function') saShowToast('Profile photo updated.', 'success');
            })
            .catch((error) => {
                if (note) note.textContent = error.message || 'Upload failed.';
                if (typeof saShowToast === 'function') saShowToast(error.message || 'Upload failed.', 'error');
                if (typeof saAdminPaintAvatar === 'function') {
                    saAdminPaintAvatar(typeof saAdminUser !== 'undefined' ? saAdminUser : null);
                }
            })
            .finally(() => {
                input.value = '';
            });
    });
}
