const express = require('express');
const { requireRole } = require('../middleware/authGuard');
const { orders, createOrder, updateOrder } = require('../controllers/adminOrderController');
const { customers, createCustomer, updateCustomer } = require('../controllers/adminCustomerController');
const {
    categories,
    createCategory,
    createSubcategory,
    updateCategory,
    deleteCategory
} = require('../controllers/adminCategoryController');
const { tickets, ticketOne, createTicket, updateTicket, bulkTickets } = require('../controllers/adminTicketController');
const { cms, saveCms, bannerImage } = require('../controllers/adminCmsController');
const { getFooter, saveFooter } = require('../controllers/cmsFooterController');
const { getPages, savePage } = require('../controllers/cmsPagesController');
const {
    listProducts,
    setStatus,
    removeProduct,
    bulkProducts
} = require('../controllers/adminProductController');
const {
    getProfile,
    updateProfile,
    updatePassword,
    uploadAvatar
} = require('../controllers/adminProfileController');

const router = express.Router();
const adminOnly = requireRole('admin');

/* CMS reads stay public for the marketplace homepage. */
router.get('/cms/pages', getPages);
router.get('/cms/footer', getFooter);
router.get('/cms', cms);

router.get('/profile', adminOnly, getProfile);
router.put('/profile', adminOnly, updateProfile);
router.post('/profile', adminOnly, updateProfile);
router.put('/profile/password', adminOnly, updatePassword);
router.post('/profile/password', adminOnly, updatePassword);
router.post('/profile/avatar', adminOnly, uploadAvatar);
router.get('/orders', adminOnly, orders);
router.post('/orders', adminOnly, createOrder);
router.post('/orders/:id', adminOnly, updateOrder);
router.get('/customers', adminOnly, customers);
router.post('/customers', adminOnly, createCustomer);
router.post('/customers/:id', adminOnly, updateCustomer);
router.get('/categories', adminOnly, categories);
router.post('/categories', adminOnly, createCategory);
router.post('/categories/sub', adminOnly, createSubcategory);
router.post('/subcategories', adminOnly, createSubcategory);
router.put('/categories/:id', adminOnly, updateCategory);
router.post('/categories/:id', adminOnly, updateCategory);
router.delete('/categories/:id', adminOnly, deleteCategory);
router.post('/categories/:id/delete', adminOnly, deleteCategory);
router.post('/cms/pages', adminOnly, savePage);
router.put('/cms/pages', adminOnly, savePage);
router.put('/cms/footer', adminOnly, saveFooter);
router.post('/cms/image', adminOnly, bannerImage);
router.post('/cms', adminOnly, saveCms);
router.get('/support/tickets', adminOnly, tickets);
router.post('/support/tickets/bulk', adminOnly, bulkTickets);
router.post('/support/tickets', adminOnly, createTicket);
router.get('/support/tickets/:id', adminOnly, ticketOne);
router.post('/support/tickets/:id', adminOnly, updateTicket);
router.get('/products', adminOnly, listProducts);
router.post('/products/bulk', adminOnly, bulkProducts);
router.put('/products/:id/status', adminOnly, setStatus);
router.post('/products/:id/status', adminOnly, setStatus);
router.delete('/products/:id', adminOnly, removeProduct);
router.post('/products/:id/delete', adminOnly, removeProduct);

module.exports = router;
