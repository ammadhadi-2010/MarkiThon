function featuredCustomers() {
    return [
        row('Bilal Ahmed', '0312-9876543', 'House # 12, Street 3, Model Town, Multan',
            'Model Town', true, 'Active', 8, 18450, '2026-09-24'),
        row('Ayesha Khan', '0321-2283344', 'Mohalla Gulshan, Multan',
            'Gulshan', false, 'Active', 5, 12700, '2026-09-23'),
        row('Usman Ali', '0300-1234567', 'Street 5, Rahim Abad, Multan',
            'Rahimabad', false, 'Active', 12, 28550, '2026-09-22'),
        row('Sana Fatima', '0307-7654321', 'Qasim Pur, Multan',
            'Qasim Pur', false, 'Active', 3, 7800, '2026-09-21'),
        row('Zain Sheikh', '0333-1234567', 'Model Town, Multan',
            'Model Town', false, 'Active', 6, 15600, '2026-09-20'),
        row('Hina Butt', '0300-9876543', 'Bosan Road, Multan',
            'Bosan Road', false, 'Active', 2, 5450, '2026-09-19'),
        row('Farhan Ali', '0321-9876540', 'Shah Rukn-e-Alam, Multan',
            'Shah Rukn-e-Alam', false, 'Active', 7, 16200, '2026-09-18'),
        row('Nadia Malik', '0311-4556677', 'Cantt Area, Multan',
            'Cantt Area', false, 'Inactive', 1, 2100, '2026-09-17'),
        row('Tahir Mehmood', '0300-7778899', 'Khanewal Road, Multan',
            'Khanewal Road', false, 'Active', 9, 22300, '2026-09-16'),
        row('Rabia Noor', '0333-7889900', 'Bohar Wali, Multan',
            'Bohar Wali', false, 'Active', 3, 8750, '2026-09-15')
    ];
}

function row(name, phone, address, area, vip, status, orders, purchase, day) {
    return {
        name,
        phone,
        whatsapp: phone,
        address,
        area,
        vip,
        status,
        totalOrders: orders,
        totalPurchase: purchase,
        lastOrderAt: new Date(day + 'T12:00:00'),
        ShopId: 1
    };
}

const CUST_AREAS = [
    'Model Town', 'Gulshan', 'Rahimabad', 'Qasim Pur', 'Bosan Road',
    'Shah Rukn-e-Alam', 'Cantt Area', 'Khanewal Road', 'Bohar Wali', 'New Multan'
];

const CUST_NAMES = [
    'Hamza Tariq', 'Iqra Shah', 'Ali Raza', 'Maha Javed', 'Omar Farooq',
    'Saba Noor', 'Kashif Ali', 'Laraib Khan', 'Noman Iqbal', 'Hira Saeed',
    'Asad Malik', 'Zara Qureshi', 'Faisal Amin', 'Mehwish Tariq', 'Danish Raza',
    'Amina Bibi', 'Shahid Khan', 'Komal Fatima', 'Rizwan Ahmed', 'Bushra Ali'
];

module.exports = { featuredCustomers, row, CUST_AREAS, CUST_NAMES };
