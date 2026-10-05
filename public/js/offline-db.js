const IDB_NAME = 'markithon-offline';
const IDB_VERSION = 1;
const IDB_STORES = ['products', 'sales_transactions', 'stock_movements', 'ledger_entries'];

function idbOpen() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(IDB_NAME, IDB_VERSION);
        req.onupgradeneeded = () => {
            const db = req.result;
            IDB_STORES.forEach((name) => {
                if (!db.objectStoreNames.contains(name)) {
                    db.createObjectStore(name, { keyPath: 'id' });
                }
            });
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

function idbTx(store, mode, work) {
    return idbOpen().then((db) => new Promise((resolve, reject) => {
        const tx = db.transaction(store, mode);
        const os = tx.objectStore(store);
        const req = work(os);
        tx.oncomplete = () => resolve(req ? req.result : undefined);
        tx.onerror = () => reject(tx.error);
        if (req) {
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        }
    }));
}

function idbGetAll(store) {
    return idbTx(store, 'readonly', (os) => os.getAll()).then((rows) => rows || []);
}

function idbGet(store, id) {
    return idbTx(store, 'readonly', (os) => os.get(id));
}

function idbPut(store, record) {
    return idbTx(store, 'readwrite', (os) => os.put(record));
}

function idbDelete(store, id) {
    return idbTx(store, 'readwrite', (os) => os.delete(id));
}

async function idbReplaceAll(store, rows) {
    const db = await idbOpen();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite');
        const os = tx.objectStore(store);
        os.clear();
        (rows || []).forEach((row) => os.put(row));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

function offlineId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isNetworkError(error) {
    const msg = String((error && error.message) || error || '');
    return !navigator.onLine || /offline|failed to fetch|networkerror|load failed/i.test(msg);
}
