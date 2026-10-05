const MP_CATEGORIES = [
    ['Lawn', 'https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?auto=format&fit=crop&w=400&q=80'],
    ['Suits', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80'],
    ['Fabrics', 'https://images.unsplash.com/photo-1558171813-4d70ee78b90f?auto=format&fit=crop&w=400&q=80'],
    ['Bedsheets', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=400&q=80'],
    ['Blankets', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=400&q=80'],
    ['Garments', 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=400&q=80'],
    ['Shoes', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80'],
    ['Home & Living', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80'],
    ['Beauty', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80'],
    ['More', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80']
];

function mpCategoriesMarkup() {
    const cards = MP_CATEGORIES.map((row) => `
        <a class="mp-cat" href="#categories" data-mpq="${row[0]}">
            <img src="${row[1]}" alt="">
            <span><strong>${row[0]}</strong></span>
        </a>`).join('');
    return `
    <section class="mp-block" id="categories">
        <div class="mp-head">
            <div>
                <h2>Explore Categories</h2>
            </div>
            <a href="#categories">View All Categories</a>
        </div>
        <div class="mp-cats">${cards}</div>
    </section>`;
}
