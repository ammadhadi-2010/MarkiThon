let dbReady = false;

function isDbReady() {
    return dbReady;
}

function markDbReady() {
    dbReady = true;
}

function markDbDown() {
    dbReady = false;
}

function isConnectionError(error) {
    const msg = String((error && error.message) || error || '');
    return /ECONNREFUSED|ETIMEDOUT|ENOTFOUND|Connection terminated|SequelizeConnection|the database system is starting|connect ECONNREFUSED/i.test(msg);
}

function voucherListError(error) {
    const connection = isConnectionError(error);
    return {
        ok: false,
        vouchers: [],
        code: connection ? 'DB_CONNECTION' : 'DB_QUERY',
        message: connection
            ? 'Database connection failed. Stock receipts will retry shortly.'
            : 'Could not load stock receipts from the database.',
        error: String((error && error.message) || 'Unknown database error')
    };
}

module.exports = {
    isDbReady,
    markDbReady,
    markDbDown,
    isConnectionError,
    voucherListError
};
