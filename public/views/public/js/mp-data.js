const MP_SLIDES = [
    {
        image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1600&q=80',
        alt: 'Premium Fabrics',
        title: 'Premium Fabrics',
        text: 'For a better tomorrow',
        cta: 'Shop Now',
        href: '/#shops'
    },
    {
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
        alt: 'Summer Sale',
        title: 'Summer Sale',
        text: 'Selected styles on offer',
        cta: 'Shop Now',
        href: '/#trending'
    },
    {
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80',
        alt: 'Season fashion display',
        title: 'New Arrivals',
        text: 'Fresh styles from local shops',
        cta: 'Shop Now',
        href: '/#categories'
    }
];

const MP_PRODUCTS = [
    {
        id: 'lawn-suit',
        title: 'Premium Lawn Suit',
        retailPrice: 6000,
        salePrice: 4500,
        stock: 18,
        unit: 'Suit',
        variants: ['Small', 'Medium', 'Large'],
        images: [
            'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'
        ],
        shopName: 'Ammad Hadi Stor',
        rating: '4.8',
        reviews: 124,
        desc: 'Soft premium lawn with a clean drape. Ideal for daily wear and Eid outfits.',
        delivery: 'Delivery in 2 - 4 working days across Pakistan. Cash on delivery available.',
        returns: 'Exchange or return within 7 days if the item is unused and tagged.',
        tag: 'new'
    },
    {
        id: 'cotton-sheet',
        title: 'Premium Cotton Bed Sheet Set',
        tagline: 'Luxury Comfort for Your Home',
        category: 'Bed Sheets',
        retailPrice: 2400,
        salePrice: 1800,
        stock: 12,
        unit: 'Set',
        variants: ['Single', 'Double', 'Queen', 'King'],
        sizeOn: 'Double',
        colors: [['Navy', '#1e3a5f'], ['Sage', '#6b8f71'], ['Blush', '#e7b7b0'], ['Cream', '#f3e6d0']],
        images: [
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1616627561839-074385245ff6?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?auto=format&fit=crop&w=1400&q=80'
        ],
        featureLine: 'Premium Cotton · Soft · Breathable · Durable',
        highlights: [
            ['100% Premium Cotton', 'Soft, breathable & skin friendly'],
            ['Long Lasting Quality', 'Durable fabric, stays fresh'],
            ['Easy Care', 'Machine washable'],
            ['Perfect for All Seasons', 'Keeps you cool in summer & warm in winter']
        ],
        shopName: 'Ammad Hadi Stor',
        rating: '4.8',
        reviews: 124,
        desc: 'Luxury cotton bed sheet set with a soft hand feel and a durable weave.',
        delivery: 'Estimated Delivery: 2 - 4 Working Days',
        returns: '7 Days Easy Return. Hassle-free returns and exchanges.',
        tag: 'new'
    },
    {
        id: 'wool-blanket',
        title: 'Warm Blanket',
        retailPrice: 3750,
        salePrice: 2800,
        stock: 12,
        unit: 'Piece',
        variants: ['Single', 'Double'],
        images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=80'],
        shopName: 'Al-Noor Bedsheets',
        rating: '4.8',
        reviews: 76,
        desc: 'Warm winter blanket with a soft inner lining.',
        delivery: 'Shipped within 24 hours from Multan.',
        returns: 'Exchange for size only. Quality issues are replaced.',
        tag: 'best'
    },
    {
        id: 'takiya',
        title: 'Pillow (Takiya)',
        retailPrice: 1500,
        salePrice: 1200,
        stock: 40,
        unit: 'Piece',
        variants: ['Standard', 'Firm'],
        images: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?auto=format&fit=crop&w=900&q=80'],
        shopName: 'Khan Fabrics',
        rating: '4.5',
        desc: 'Fibre-filled pillow with a washable cover.',
        delivery: 'Usually arrives in 2 working days.',
        returns: 'Unopened pillows can be returned in 7 days.',
        tag: 'new'
    },
    {
        id: 'mens-suit',
        title: "Men's Suit",
        retailPrice: 7800,
        salePrice: 6500,
        stock: 6,
        unit: 'Suit',
        variants: ['38', '40', '42'],
        images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80'],
        shopName: 'Usman Textiles',
        rating: '4.4',
        desc: 'Tailored men\'s suit in breathable fabric.',
        delivery: 'Stitched items ship in 3 - 5 days.',
        returns: 'Alterations supported. Full refund if unused.',
        tag: 'best'
    },
    {
        id: 'kids-set',
        title: 'Kids Garment',
        retailPrice: 1800,
        salePrice: 1450,
        stock: 22,
        unit: 'Set',
        variants: ['2-3Y', '4-5Y', '6-7Y'],
        images: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=80'],
        shopName: 'Ammad Hadi Stor',
        rating: '4.6',
        desc: 'Soft kids set for everyday wear.',
        delivery: 'Fast dispatch from Ammad Hadi Stor.',
        returns: 'Size exchange within 7 days.',
        tag: 'sale'
    },
    {
        id: 'wash-wear',
        title: 'Wash & Wear Fabric',
        retailPrice: 1500,
        salePrice: 1350,
        stock: 30,
        unit: 'Meter',
        variants: ['White', 'Beige'],
        images: ['https://images.unsplash.com/photo-1558171813-4d70ee78b90f?auto=format&fit=crop&w=900&q=80'],
        shopName: 'Ammad Hadi Stor',
        rating: '4.6',
        reviews: 52,
        desc: 'Easy-care wash and wear fabric for daily stitching.',
        delivery: 'Ships in 2 working days.',
        returns: 'Unused than can be returned in 5 days.',
        tag: 'best'
    },
    {
        id: 'sports-shoes',
        title: 'Sports Shoes',
        retailPrice: 4500,
        salePrice: 3999,
        stock: 14,
        unit: 'Pair',
        variants: ['40', '41', '42'],
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'],
        shopName: 'Fashion Hub',
        rating: '4.8',
        reviews: 41,
        desc: 'Lightweight sports shoes for everyday wear.',
        delivery: 'Delivery in 3 - 5 working days.',
        returns: 'Size exchange within 7 days if unused.',
        tag: 'new'
    }
];

const MP_REVIEWS = [
    {
        name: 'Ayesha Khan',
        text: 'Amazing experience! The quality is great and delivery was on time. Highly recommended.',
        stars: '4.9',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80'
    },
    {
        name: 'Usman Raza',
        text: 'Finally a platform that supports local shops. Love the variety and prices.',
        stars: '5.0',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80'
    },
    {
        name: 'Fatima S.',
        text: 'The best online shopping experience I\'ve had in Pakistan. Keep it up!',
        stars: '4.8',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80'
    },
    {
        name: 'Ali Ahmed',
        text: 'Easy to use, great products and excellent customer support.',
        stars: '4.7',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd722bf5d?auto=format&fit=crop&w=120&q=80'
    }
];

function mpFindProduct(id) {
    const live = typeof mpLiveProducts !== 'undefined'
        ? mpLiveProducts.find((row) => String(row.id) === String(id))
        : null;
    if (live) return live;
    return MP_PRODUCTS.find((row) => row.id === id) || MP_PRODUCTS[0];
}

function mpByTag(tag) {
    return MP_PRODUCTS.filter((row) => row.tag === tag);
}
