/** Legacy demo customer phones kept only for one-time purge matching. */
function featuredCustomers() {
    return [
        { phone: '0321-2283344' },
        { phone: '0300-1234567' },
        { phone: '0312-9876543' },
        { phone: '0307-7654321' },
        { phone: '0333-1234567' },
        { phone: '0300-9876543' },
        { phone: '0321-9876540' },
        { phone: '0311-4556677' },
        { phone: '0300-7778899' },
        { phone: '0333-7889900' }
    ];
}

function row() {
    return {};
}

const CUST_AREAS = [];
const CUST_NAMES = [];

module.exports = { featuredCustomers, row, CUST_AREAS, CUST_NAMES };
