const ShopProfile = require('../models/ShopProfile');
const ShopDigitalSetup = require('../models/ShopDigitalSetup');
const ShopSubscription = require('../models/ShopSubscription');
const VendorAccount = require('../models/VendorAccount');
const { findPlan, limitsForShop } = require('./subscriptionPlans');

function mapLink(profile) {
    if (profile.latitude && profile.longitude) {
        return 'https://www.google.com/maps?q=' + profile.latitude + ',' + profile.longitude;
    }
    const query = [profile.shopAddress, profile.marketName, profile.storeLocation]
        .filter(Boolean).join(', ');
    return query
        ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query)
        : '';
}

async function resolveVendor(profile, vendorId) {
    if (vendorId) {
        const byId = await VendorAccount.findByPk(vendorId);
        if (byId) return byId;
    }
    if (profile && profile.shopName) {
        const byName = await VendorAccount.findOne({ where: { shopName: profile.shopName } });
        if (byName) return byName;
    }
    return VendorAccount.findOne({ order: [['createdAt', 'ASC']] });
}

async function loadLiveParts(vendorId) {
    const [profile, digital, subscription] = await Promise.all([
        ShopProfile.findOne({ where: { ShopId: 1 } }),
        ShopDigitalSetup.findOne({ where: { ShopId: 1 } }),
        ShopSubscription.findOne({ where: { ShopId: 1 } })
    ]);
    const vendor = await resolveVendor(profile, vendorId);
    return { profile, digital, subscription, vendor };
}

function presentLiveShop(parts) {
    const { profile, digital, subscription, vendor } = parts;
    if (!profile) return null;
    const approved = Boolean(digital && digital.isApproved);
    const pack = subscription?.selectedPackage || 'Basic';
    const cycle = subscription?.billingCycle || 'monthly';
    const address = [profile.shopNumber, profile.marketName, profile.shopAddress]
        .filter(Boolean).join(', ');
    let status = 'Pending';
    if (vendor && vendor.status === 'Suspended') status = 'Suspended';
    else if (approved || (vendor && vendor.status === 'Active') || profile.isSetupCompleted) {
        status = 'Active';
    }
    return {
        id: vendor ? vendor.id : 'live-shop',
        name: profile.shopName,
        owner: profile.ownerName,
        phone: profile.phoneNumber || '',
        package: pack,
        months: cycle === 'yearly' ? 12 : 1,
        status,
        email: profile.emailAddress || vendor?.email || '',
        shopkeeperId: vendor?.shopkeeperId || '',
        imageUrl: profile.imageUrl || vendor?.imageUrl || '',
        locked: true,
        profile: {
            storeName: profile.shopName,
            ownerName: profile.ownerName,
            cnic: profile.ownerCnic || '',
            shopSku: profile.shopSku || '',
            phone: profile.phoneNumber || '',
            whatsapp: profile.whatsappNumber || digital?.whatsappNumber || '',
            email: profile.emailAddress || '',
            address,
            marketName: profile.marketName || '',
            shopNumber: profile.shopNumber || '',
            location: profile.storeLocation || '',
            landmark: profile.landmarkNote || '',
            map: mapLink(profile),
            shopType: profile.shopType || '',
            businessType: profile.businessType || '',
            latitude: profile.latitude || null,
            longitude: profile.longitude || null,
            website: profile.websiteUrl || digital?.websiteUrl || '',
            imageUrl: profile.imageUrl || vendor?.imageUrl || '',
            coverBanner: (digital && (digital.coverBanner || (Array.isArray(digital.heroBanners) && digital.heroBanners[0]))) || '',
            setup: profile.isSetupCompleted ? 'Completed' : 'Incomplete',
            approved: approved || (vendor && vendor.status === 'Active'),
            shopkeeperId: vendor?.shopkeeperId || '',
            vendorStatus: vendor?.status || '',
            productTypes: Array.isArray(profile.productTypes) ? profile.productTypes : [],
            subscription: subscription ? {
                selectedPackage: pack,
                billingCycle: cycle,
                monthlyPrice: subscription.monthlyPrice,
                yearlyPrice: subscription.yearlyPrice,
                productLimit: subscription.productLimit,
                orderLimit: subscription.orderLimit,
                paymentMethod: subscription.paymentMethod,
                paymentStatus: subscription.paymentStatus,
                transactionReference: subscription.transactionReference
            } : null
        }
    };
}

async function buildLiveShop(vendorId) {
    return presentLiveShop(await loadLiveParts(vendorId));
}

async function updateLiveShop(body, vendorId) {
    const parts = await loadLiveParts(vendorId);
    if (!parts.profile) return null;
    const status = String(body.status || '').trim();
    if (['Active', 'Pending', 'Suspended'].includes(status)) {
        let digital = parts.digital;
        if (!digital) {
            digital = await ShopDigitalSetup.create({ ShopId: 1, isApproved: false });
        }
        const approved = status === 'Active';
        await digital.update({ isApproved: approved });
        await parts.profile.update({ isSetupCompleted: approved });
        if (parts.vendor) {
            await parts.vendor.update({
                status: status === 'Suspended'
                    ? 'Suspended'
                    : (approved ? 'Active' : 'Pending Admin Approval')
            });
        }
    }
    if (body.package || body.selectedPackage || body.billingCycle) {
        let sub = parts.subscription;
        if (!sub) sub = await ShopSubscription.create({ ShopId: 1 });
        const planId = body.selectedPackage || body.package || sub.selectedPackage;
        const plan = findPlan(planId);
        const billingCycle = body.billingCycle === 'yearly' ? 'yearly' : 'monthly';
        const limits = limitsForShop(plan, sub);
        await sub.update({
            selectedPackage: plan?.id || planId,
            monthlyPrice: plan?.monthlyPrice || 0,
            yearlyPrice: plan?.yearlyPrice || 0,
            billingCycle,
            productLimit: limits.productLimit,
            orderLimit: limits.orderLimit,
            paymentStatus: (plan?.monthlyPrice || 0) === 0 ? 'free' : (sub.paymentStatus || 'active')
        });
    }
    return presentLiveShop(await loadLiveParts(parts.vendor && parts.vendor.id));
}

module.exports = { buildLiveShop, updateLiveShop, presentLiveShop, loadLiveParts };
