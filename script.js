// المنتجات المبدئية
const initialProducts = [
    {
        id: 1,
        name: "تيشرت أوفر سايز مطبوع",
        price: 450,
        discountPrice: 350,
        stock: 15,
        sizes: ["M", "L", "XL"],
        colors: ["أسود", "أبيض"],
        category: "men",
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80",
        desc: "قطن 100% عالي الجودة بتصميم عصري ومريح."
    },
    {
        id: 2,
        name: "فستان صيفي مشجر",
        price: 650,
        discountPrice: null,
        stock: 8,
        sizes: ["S", "M", "L"],
        colors: ["أحمر", "أزرق"],
        category: "women",
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=500&q=80",
        desc: "فستان أنيق وخفيف مناسب للخروجات والمناسبات."
    }
];

function getProducts() {
    const stored = localStorage.getItem('asa_products');
    if (!stored) {
        localStorage.setItem('asa_products', JSON.stringify(initialProducts));
        return initialProducts;
    }
    try { return JSON.parse(stored); } catch (e) { return initialProducts; }
}

let products = getProducts();
let cart = JSON.parse(localStorage.getItem('asa_cart')) || [];

// إعدادات المتجر الإفتراضية
function loadSiteSettings() {
    const bg = localStorage.getItem('asa_hero_bg') || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80';
    const title = localStorage.getItem('asa_hero_title') || 'تشكيلة أزياء A.S.A الجديدة';
    const sub = localStorage.getItem('asa_hero_sub') || 'أناقة وجودة تناسب ذوقك العصري';

    const heroBanner = document.querySelector('.hero-banner');
    if (heroBanner) {
        heroBanner.style.backgroundImage = `linear-gradient(rgba(17,24,39,0.8), rgba(17,24,39,0.8)), url('${bg}')`;
        const titleEl = heroBanner.querySelector('h1');
        const subEl = heroBanner.querySelector('p');
        if (titleEl) titleEl.textContent = title;
        if (subEl) subEl.textContent = sub;
    }

    // تعبئة حقول الإعدادات في صفحة الأدمن
    const inputBg = document.getElementById('settingHeroBg');
    const inputTitle = document.getElementById('settingHeroTitle');
    const inputSub = document.getElementById('settingHeroSub');

    if (inputBg) inputBg.value = bg;
    if (inputTitle) inputTitle.value = title;
    if (inputSub) inputSub.value = sub;
}

function saveSiteSettings(e) {
    e.preventDefault();
    const bg = document.getElementById('settingHeroBg').value;
    const title = document.getElementById('settingHeroTitle').value;
    const sub = document.getElementById('settingHeroSub').value;
    const newPass = document.getElementById('settingNewPass').value;

    localStorage.setItem('asa_hero_bg', bg);
    localStorage.setItem('asa_hero_title', title);
    localStorage.setItem('asa_hero_sub', sub);

    if (newPass.trim() !== '') {
        localStorage.setItem('asa_admin_pass', newPass.trim());
        alert('تم حفظ الإعدادات وتغيير كلمة السر بنجاح!');
    } else {
        alert('تم حفظ إعدادات الواجهة بنجاح!');
    }

    loadSiteSettings();
}

// عرض المنتجات في الواجهة
function renderProducts(filter = 'all') {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    grid.innerHTML = '';
    const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 20px;">لا توجد منتجات حالياً.</p>';
        return;
    }

    filtered.forEach(p => {
        const hasDiscount = p.discountPrice && Number(p.discountPrice) < Number(p.price);
        const finalPrice = hasDiscount ? p.discountPrice : p.price;

        grid.innerHTML += `
            <div class="product-card">
                ${hasDiscount ? '<span class="sale-badge">عرض خاص</span>' : ''}
                <img src="${p.image}" class="product-img" alt="${p.name}" onclick="openProductDetail(${p.id})">
                <div class="product-info">
                    <h4 onclick="openProductDetail(${p.id})" style="cursor:pointer;">${p.name}</h4>
                    <div class="product-price">
                        ${finalPrice} ج.م
                        ${hasDiscount ? `<span class="old-price">${p.price} ج.م</span>` : ''}
                    </div>
                    <small style="color: #6b7280; margin-bottom: 8px;">قطع متبقية: ${p.stock || 'متوفر'}</small>
                    <button class="add-cart-btn" onclick="addToCart(${p.id}, event)"><i class="fa-solid fa-plus"></i> إضافة للسلة</button>
                </div>
            </div>
        `;
    });
}

function filterProducts(cat) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (window.event && window.event.target) window.event.target.classList.add('active');
    renderProducts(cat);
}

// السلة والتنبيهات
function addToCart(id, event) {
    if (event) event.stopPropagation();
    const item = products.find(p => p.id === id);
    if (item) {
        cart.push(item);
        updateCart();
        showToast('تمت الإضافة للسلة بنجاح!');
    }
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function updateCart() {
    localStorage.setItem('asa_cart', JSON.stringify(cart));
    const cartCount = document.getElementById('cartCount');
    if (cartCount) cartCount.textContent = cart.length;

    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    if (!cartItems) return;

    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const itemPrice = (item.discountPrice && Number(item.discountPrice) < Number(item.price)) ? item.discountPrice : item.price;
        total += Number(itemPrice);
        cartItems.innerHTML += `
            <div class="cart-item">
                <div>
                    <strong>${item.name}</strong><br>
                    <small>${itemPrice} ج.م</small>
                </div>
                <button class="btn-delete" onclick="removeFromCart(${index})">&times;</button>
            </div>
        `;
    });

    if (cartTotal) cartTotal.textContent = total + ' ج.م';
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

function toggleCart() {
    const modal = document.getElementById('cartModal');
    if (modal) modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function checkout() {
    if (cart.length === 0) return alert('السلة فارغة!');
    let msg = "مرحباً A.S.A، أود طلب المنتجات التالية:\n";
    cart.forEach(item => {
        const p = (item.discountPrice && Number(item.discountPrice) < Number(item.price)) ? item.discountPrice : item.price;
        msg += `- ${item.name} (${p} ج.م)\n`;
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}

// تكبير الصورة Lightbox
function openImageZoom(src) {
    const modal = document.getElementById('imageZoomModal');
    const img = document.getElementById('zoomedImg');
    if (modal && img) {
        img.src = src;
        modal.style.display = 'flex';
    }
}

function closeImageZoom() {
    const modal = document.getElementById('imageZoomModal');
    if (modal) modal.style.display = 'none';
}

// فتح تفاصيل المنتج والمنتجات المشابهة
function openProductDetail(id) {
    const p = products.find(prod => prod.id === id);
    if (!p) return;

    const hasDiscount = p.discountPrice && Number(p.discountPrice) < Number(p.price);
    const finalPrice = hasDiscount ? p.discountPrice : p.price;
    const related = products.filter(item => item.category === p.category && item.id !== p.id);

    let relatedHTML = related.map(r => `
        <div class="related-item" onclick="openProductDetail(${r.id})" style="cursor:pointer; display:inline-block; margin-left:10px; text-align:center;">
            <img src="${r.image}" style="width:70px; height:70px; object-fit:cover; border-radius:6px;">
            <p style="font-size:0.75rem; margin-top:2px;">${r.name}</p>
            <strong style="font-size:0.8rem; color:var(--accent-color);">${r.discountPrice || r.price} ج.م</strong>
        </div>
    `).join('');

    const modalBody = document.getElementById('productDetailBody');
    if (modalBody) {
        modalBody.innerHTML = `
            <div class="product-detail-container">
                <img src="${p.image}" class="detail-img" style="width:100%; height:250px; object-fit:cover; border-radius:8px; cursor:zoom-in;" onclick="openImageZoom('${p.image}')" title="اضغط لتكبير الصورة">
                <h2 style="margin-top:10px;">${p.name}</h2>
                <div class="product-price" style="font-size:1.3rem; margin:5px 0;">
                    ${finalPrice} ج.م ${hasDiscount ? `<span class="old-price">${p.price} ج.م</span>` : ''}
                </div>
                <p style="font-size:0.9rem; opacity:0.8; margin-bottom:10px;">${p.desc || 'لا يوجد وصف متاح.'}</p>
                <div style="margin:4px 0;"><strong>المقاسات:</strong> ${Array.isArray(p.sizes) ? p.sizes.map(s => `<span class="badge-tag">${s}</span>`).join(' ') : (p.sizes || 'عام')}</div>
                <div style="margin:4px 0;"><strong>الألوان:</strong> ${Array.isArray(p.colors) ? p.colors.map(c => `<span class="badge-tag">${c}</span>`).join(' ') : (p.colors || 'عام')}</div>
                <div style="margin:4px 0; color:var(--success-color);"><strong>المخزون:</strong> ${p.stock || 0} قطعة متوفرة</div>

                <button class="add-cart-btn" style="width:100%; padding:10px; font-size:1rem; margin-top:12px;" onclick="addToCart(${p.id}); closeProductDetail();">
                    <i class="fa-solid fa-cart-plus"></i> إضافة إلى السلة
                </button>

                <h4 style="margin-top:15px; border-top:1px solid #eee; padding-top:10px;"><i class="fa-solid fa-tags"></i> منتجات مشابهة</h4>
                <div style="overflow-x:auto; white-space:nowrap; padding:5px 0;">${relatedHTML || '<p style="font-size:0.85rem; color:#888;">لا توجد منتجات مشابهة.</p>'}</div>
            </div>
        `;
    }

    const modal = document.getElementById('productDetailModal');
    if (modal) modal.style.display = 'flex';
}

function closeProductDetail() {
    const modal = document.getElementById('productDetailModal');
    if (modal) modal.style.display = 'none';
}

// التحكم في التبويبات بالأدمن
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    const activeContent = document.getElementById(`tab-${tabId}`);
    if (activeContent) activeContent.classList.add('active');

    if (window.event && window.event.target) window.event.target.classList.add('active');
}

function renderAdminProducts() {
    const grid = document.getElementById('adminProductsGrid');
    if (!grid) return;

    grid.innerHTML = '';
    products.forEach(p => {
        const hasDiscount = p.discountPrice && Number(p.discountPrice) < Number(p.price);

        grid.innerHTML += `
            <div class="admin-prod-card">
                <img src="${p.image}" alt="${p.name}" onclick="openImageZoom('${p.image}')" title="اضغط للتكبير">
                <h4>${p.name}</h4>
                <div><strong>السعر:</strong> ${hasDiscount ? `${p.discountPrice} ج.م (عرض)` : `${p.price} ج.م`}</div>
                <small>المخزون: <strong>${p.stock || 0} قطعة</strong></small>
                <div class="card-actions">
                    <button class="btn-edit" onclick="editProduct(${p.id})"><i class="fa-solid fa-pen"></i> تعديل</button>
                    <button class="btn-delete" onclick="deleteProduct(${p.id})"><i class="fa-solid fa-trash"></i> حذف</button>
                </div>
            </div>
        `;
    });
}

function saveProduct(e) {
    e.preventDefault();
    const editId = document.getElementById('editProductId').value;

    const prodData = {
        id: editId ? Number(editId) : Date.now(),
        name: document.getElementById('prodName').value,
        category: document.getElementById('prodCategory').value,
        price: document.getElementById('prodPrice').value,
        discountPrice: document.getElementById('prodDiscountPrice').value || null,
        stock: document.getElementById('prodStock').value,
        sizes: document.getElementById('prodSizes').value.split(',').map(s => s.trim()).filter(s => s),
        colors: document.getElementById('prodColors').value.split(',').map(c => c.trim()).filter(c => c),
        image: document.getElementById('prodImage').value,
        desc: document.getElementById('prodDesc').value
    };

    if (editId) {
        const index = products.findIndex(p => p.id === Number(editId));
        if (index !== -1) products[index] = prodData;
        alert('تم تعديل المنتج بنجاح!');
    } else {
        products.push(prodData);
        alert('تم إضافة المنتج بنجاح!');
    }

    localStorage.setItem('asa_products', JSON.stringify(products));
    resetForm();
    renderAdminProducts();
    switchTab('products-list');
}

function editProduct(id) {
    const p = products.find(prod => prod.id === id);
    if (!p) return;

    document.getElementById('editProductId').value = p.id;
    document.getElementById('prodName').value = p.name;
    document.getElementById('prodCategory').value = p.category;
    document.getElementById('prodPrice').value = p.price;
    document.getElementById('prodDiscountPrice').value = p.discountPrice || '';
    document.getElementById('prodStock').value = p.stock || '';
    document.getElementById('prodSizes').value = Array.isArray(p.sizes) ? p.sizes.join(', ') : p.sizes || '';
    document.getElementById('prodColors').value = Array.isArray(p.colors) ? p.colors.join(', ') : p.colors || '';
    document.getElementById('prodImage').value = p.image;
    document.getElementById('prodDesc').value = p.desc || '';

    document.getElementById('formTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> تعديل بيانات المنتج';
    switchTab('add-product');
}

function resetForm() {
    const form = document.getElementById('productForm');
    if (form) form.reset();
    document.getElementById('editProductId').value = '';
    document.getElementById('formTitle').innerHTML = '<i class="fa-solid fa-square-plus"></i> إضافة منتج جديد';
}

function deleteProduct(id) {
    if (confirm('هل أنت تأكد من حذف هذا المنتج؟')) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('asa_products', JSON.stringify(products));
        renderAdminProducts();
    }
}

function logoutAdmin() {
    localStorage.removeItem('isAdmin');
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    loadSiteSettings();
    renderProducts();
    updateCart();
    renderAdminProducts();
});