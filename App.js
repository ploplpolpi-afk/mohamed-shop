const STORAGE_KEYS = {
    appState: 'mohamed-shop-app-state-v1',
    orders: 'mohamed-shop-orders-v1'
};

function createDefaultProducts() {
    return [
        { id: 'p-1', name: 'تيشرت قطن ساده', type: 'تيشرت', material: 'قطن', price: 220, stock: 12, commissionPercent: 10, sellerName: 'محمد', category: 'تشرتات', images: getProductImages('تيشرت قطن ساده') },
        { id: 'p-2', name: 'تيشرت مطبوع مميز', type: 'تيشرت', material: 'قطن 100%', price: 260, stock: 8, commissionPercent: 12, sellerName: 'سارة', category: 'تشرتات', images: getProductImages('تيشرت مطبوع مميز') },
        { id: 'p-3', name: 'هودي مبطن', type: 'هودي', material: 'قماش مبطن', price: 450, stock: 5, commissionPercent: 14, sellerName: 'أحمد', category: 'هوديز', images: getProductImages('هودي مبطن') },
        { id: 'p-4', name: 'بنطلون جينز مودرن', type: 'بنطلون', material: 'جينز', price: 320, stock: 7, commissionPercent: 11, sellerName: 'ليلى', category: 'بناطيل', images: getProductImages('بنطلون جينز مودرن') },
        { id: 'p-5', name: 'فستان سهرة', type: 'فستان', material: 'قماش فخم', price: 650, stock: 3, commissionPercent: 15, sellerName: 'نورا', category: 'فساتين', images: getProductImages('فستان سهرة') }
    ];
}

function loadAppState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.appState);
        if (!raw) {
            return { role: 'buyer', products: createDefaultProducts(), sellerBalances: {}, orders: [], isLoggedIn: false, accountName: '', accountPhone: '', accountMethod: 'phone' };
        }
        const parsed = JSON.parse(raw);
        return {
            role: parsed.role || 'buyer',
            products: Array.isArray(parsed.products) && parsed.products.length ? parsed.products : createDefaultProducts(),
            sellerBalances: parsed.sellerBalances || {},
            orders: parsed.orders || [],
            isLoggedIn: Boolean(parsed.isLoggedIn),
            accountName: parsed.accountName || '',
            accountPhone: parsed.accountPhone || '',
            accountMethod: parsed.accountMethod || 'phone'
        };
    } catch (e) {
        console.error('فشل تحميل الحالة:', e);
        return { role: 'buyer', products: createDefaultProducts(), sellerBalances: {}, orders: [], isLoggedIn: false, accountName: '', accountPhone: '', accountMethod: 'phone' };
    }
}

async function hydrateCatalogFromSupabase() {
    if (typeof window.loadProductsFromSupabase !== 'function') return;
    const remoteProducts = await window.loadProductsFromSupabase();
    if (Array.isArray(remoteProducts) && remoteProducts.length) {
        APP_STATE.products = remoteProducts.map(normalizeProduct);
        persistAppState();
        if (typeof renderProductsGrid === 'function') {
            renderProductsGrid(getCatalogProducts(), 'المنتجات');
        }
    }
}

function persistAppState() {
    try {
        localStorage.setItem(STORAGE_KEYS.appState, JSON.stringify(APP_STATE));
    } catch (e) {
        console.error('فشل حفظ الحالة:', e);
    }
}

function getCatalogProducts() {
    return Array.isArray(APP_STATE.products) ? APP_STATE.products : createDefaultProducts();
}

function getProductById(productId) {
    return getCatalogProducts().find(item => item.id === productId) || null;
}

function getCatalogProductByName(name) {
    const value = (name || '').trim().toLowerCase();
    return getCatalogProducts().find(item => (item.name || '').trim().toLowerCase() === value) || null;
}

function normalizeProduct(product) {
    const safe = product || {};
    return {
        id: safe.id || `product-${Date.now()}`,
        name: safe.name || 'منتج',
        type: safe.type || 'عام',
        material: safe.material || 'غير محدد',
        price: Number(safe.price || 0),
        stock: Number(safe.stock || 0),
        commissionPercent: Number(safe.commissionPercent || 10),
        sellerName: safe.sellerName || 'متجر',
        category: safe.category || 'عام',
        images: Array.isArray(safe.images) && safe.images.length ? safe.images : getProductImages(safe.name || 'منتج')
    };
}

function persistLocalOrder(orderRecord) {
    try {
        const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.orders) || '[]');
        orders.unshift({ ...orderRecord, createdAt: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders.slice(0, 50)));
        APP_STATE.orders = orders.slice(0, 50);
        persistAppState();
    } catch (e) {
        console.error('فشل حفظ الطلب محلياً:', e);
    }
}

function decreaseStockAndUpdateBalance(productId, qty) {
    const product = getProductById(productId);
    if (!product) return;
    const nextQty = Math.max(0, Number(product.stock || 0) - Number(qty || 0));
    product.stock = nextQty;
    const sellerName = product.sellerName || 'متجر';
    const commission = Number(product.commissionPercent || 10);
    const earning = Number(product.price || 0) * Number(qty || 0) * (commission / 100);
    APP_STATE.sellerBalances[sellerName] = Number(APP_STATE.sellerBalances[sellerName] || 0) + earning;
    persistAppState();
    if (typeof window.syncProductsToSupabase === 'function') {
        window.syncProductsToSupabase(getCatalogProducts());
    }
}

const APP_STATE = loadAppState();

function openCustomerSupport() {
    window.open('https://wa.me/201029481893?text=أريد%20المساعدة%20في%20طلب%20المنتجات%20والتوصيل', '_blank', 'noopener,noreferrer');
}

function getProductImages(productName) {
    const name = (productName || '').toLowerCase();
    if (name.includes('هود') || name.includes('hoodie')) {
        return [
            'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80'
        ];
    }
    if (name.includes('ترنج') || name.includes('track') || name.includes('رياضي') || name.includes('سبورت')) {
        return [
            'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'
        ];
    }
    if (name.includes('بنطل') || name.includes('جينز') || name.includes('pants')) {
        return [
            'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'
        ];
    }
    if (name.includes('فستان') || name.includes('بلوز') || name.includes('dress')) {
        return [
            'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'
        ];
    }
    if (name.includes('تيشرت') || name.includes('shirt') || name.includes('ت شيرت')) {
        return [
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'
        ];
    }
    return [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'
    ];
}

// دالة التنقل بين الشاشات والأنيميشن الناعم
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const targetScreen = document.getElementById(screenId);
    if(targetScreen) {
        targetScreen.classList.add('active');
    }

    const header = document.querySelector('.site-header');
    if(header) {
        if(screenId === 'welcome-screen') header.style.display = 'none';
        else header.style.display = 'flex';
    }
}

// دالة فتح وقفل القوائم المنسدلة بالكروت العريضة
function toggleSubMenu(menuId) {
    const subMenu = document.getElementById(menuId);
    if(subMenu) {
        subMenu.classList.toggle('open');
    }
}

// دالة فتح صفحة المنتجات المربعات
function openProductPage(sectionName) {
    document.getElementById('current-section-title').textContent = sectionName;
    const productsGrid = document.querySelector('.products-grid');
    if(!productsGrid) return showScreen('products-screen');

    const normalized = (sectionName || '').toLowerCase();
    const products = getCatalogProducts().filter(product => {
        const haystack = `${product.name} ${product.type} ${product.material} ${product.category}`.toLowerCase();
        if (normalized.includes('تشرت') || normalized.includes('تيشرت')) return haystack.includes('تيشرت') || haystack.includes('تشرت');
        if (normalized.includes('هوديز') || normalized.includes('هودي')) return haystack.includes('هودي') || haystack.includes('hoodie');
        if (normalized.includes('بنطلون') || normalized.includes('بناطيل')) return haystack.includes('بنطلون') || haystack.includes('بناطيل');
        if (normalized.includes('ترنج')) return haystack.includes('ترنج');
        if (normalized.includes('بلوز')) return haystack.includes('بلوز');
        if (normalized.includes('دراسات') || normalized.includes('فساتين')) return haystack.includes('فستان') || haystack.includes('دراسة');
        return true;
    });

    renderProductsGrid(products, sectionName);
    showScreen('products-screen');
}

// دالة فتح صفحة الشراء ونقل اسم المنتج
function openCheckoutPage(productName) {
    document.getElementById('selected-product-name').textContent = productName;
    showScreen('checkout-screen');
}

// Set main image from thumbnail
function setMainImage(el) {
    try {
        const card = el.closest('.product-card');
        const main = card.querySelector('.product-img');
        if(!main) return;
        main.classList.add('img-switching');
        const newSrc = el.dataset.src || el.src;
        setTimeout(() => {
            main.src = newSrc;
        }, 60);
        setTimeout(() => main.classList.remove('img-switching'), 360);
    } catch(e) { console.error(e); }
}

// Scroll thumbs left/right
function thumbNav(button, dir) {
    const wrapper = button.closest('.product-card');
    if(!wrapper) return;
    const thumbs = wrapper.querySelector('.thumbs');
    if(!thumbs) return;
    const amount = Math.max(80, Math.round(thumbs.clientWidth / 3));
    thumbs.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' });
}

// Initialize lazy-loading, drag-to-scroll for thumbs
function initializeProductInteractions() {
    const images = document.querySelectorAll('.product-img');
    if('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach(en => {
                if(en.isIntersecting) {
                    const img = en.target;
                    const src = img.dataset.src;
                    if(src && img.src !== src) img.src = src;
                    obs.unobserve(img);
                }
            });
        }, { rootMargin: '200px' });
        images.forEach(i => io.observe(i));
    }

    document.querySelectorAll('.thumbs').forEach(el => {
        let down = false, startX = 0, scrollLeft = 0;
        el.addEventListener('pointerdown', (e) => {
            down = true; el.setPointerCapture(e.pointerId);
            startX = e.clientX; scrollLeft = el.scrollLeft; el.classList.add('dragging');
        });
        el.addEventListener('pointermove', (e) => {
            if(!down) return; const dx = e.clientX - startX; el.scrollLeft = scrollLeft - dx;
        });
        el.addEventListener('pointerup', (e) => { down = false; try{ el.releasePointerCapture(e.pointerId); }catch(e){} el.classList.remove('dragging'); });
        el.addEventListener('pointercancel', () => { down = false; el.classList.remove('dragging'); });
    });
}

// --- Search helpers ---
function getAllProducts() {
    return getCatalogProducts();
}

function renderProductsGrid(products, title = 'المنتجات') {
    const productsGrid = document.querySelector('.products-grid');
    if(!productsGrid) return;
    const list = Array.isArray(products) ? products : getCatalogProducts();
    productsGrid.innerHTML = list.length
        ? list.map(product => (typeof window.renderProductCard === 'function' ? window.renderProductCard(product) : '')).join('')
        : '<div class="empty-state">لا توجد منتجات حالياً</div>';
    if (title) {
        const titleEl = document.getElementById('current-section-title');
        if (titleEl) titleEl.textContent = title;
    }
    initializeProductInteractions();
}

function performSearch() {
    const q = document.getElementById('site-search-input').value.trim();
    if(!q) return showSnack('اكتب ما تريد البحث عنه');
    const list = getAllProducts();
    const lower = q.toLowerCase();
    const results = list.filter(product => `${product.name} ${product.type} ${product.material} ${product.category}`.toLowerCase().includes(lower));
    renderProductsGrid(results, `نتائج البحث: "${q}"`);
    closeSuggestions();
    showScreen('products-screen');
}

let _suggestDeb; 
function setupSearchSuggest() {
    const input = document.getElementById('site-search-input');
    const sugg = document.getElementById('search-suggestions');
    if(!input || !sugg) return;
    input.addEventListener('input', (e) => {
        clearTimeout(_suggestDeb);
        _suggestDeb = setTimeout(() => {
            const q = input.value.trim().toLowerCase();
            if(!q) return closeSuggestions();
            const items = getAllProducts();
            const matches = items.filter(product => `${product.name} ${product.type}`.toLowerCase().includes(q)).slice(0,8);
            sugg.innerHTML = matches.map(product => `<button onclick="(function(){document.getElementById('site-search-input').value='${product.name}'; performSearch();})();">${product.name} — ${product.type}</button>`).join('');
            sugg.classList.add('open'); sugg.setAttribute('aria-hidden','false');
        }, 160);
    });
    input.addEventListener('focus', () => { if(input.value.trim()) input.dispatchEvent(new Event('input')); });
    document.addEventListener('click', (e) => {
        if(!e.target.closest('.site-search')) closeSuggestions();
    });
}

function closeSuggestions() { const s = document.getElementById('search-suggestions'); if(s){ s.classList.remove('open'); s.setAttribute('aria-hidden','true'); s.innerHTML=''; } }

// Cart handling
const CART = { items: [], count: 0 };
function addToCart(productOrName, price, quantity = 1) {
    const product = typeof productOrName === 'object' ? normalizeProduct(productOrName) : getCatalogProductByName(productOrName);
    if (!product) {
        showSnack('هذا المنتج غير متوفر حالياً');
        return;
    }
    const q = Number(quantity || 1);
    const available = Number(product.stock || 0);
    if (available <= 0) {
        showSnack('نفد المخزون لهذا المنتج');
        return;
    }
    if (q > available) {
        showSnack(`الكمية المطلوبة أكبر من المخزون المتاح (${available})`);
        return;
    }
    CART.items.push({ id: product.id, name: product.name, price: Number(product.price), qty: q, seller: product.sellerName || 'متجر', commissionPercent: Number(product.commissionPercent || 10) });
    CART.count = CART.items.length;
    const cntEl = document.getElementById('cart-count');
    if(cntEl) cntEl.textContent = CART.count;
    renderCart();
    showSnack(`${product.name} أضيفت إلى السلة`);
}

function addToCartFromCard(buttonEl) {
    const card = buttonEl?.closest('.product-card');
    if (!card) return;
    const product = normalizeProduct({
        id: card.dataset.productId || '',
        name: card.dataset.name || '',
        type: card.dataset.type || '',
        material: card.dataset.material || '',
        price: Number(card.dataset.productPriceValue || card.dataset.price || 0),
        stock: Number(card.dataset.productStock || 0),
        sellerName: card.dataset.productSeller || 'متجر'
    });
    addToCart(product, 1, 1);
}

function addToCartFromModal(buttonEl) {
    const modal = buttonEl?.closest('.modal-card');
    if (!modal) return;
    const product = normalizeProduct({
        id: modal.dataset.productId || '',
        name: modal.dataset.productName || '',
        type: modal.dataset.productType || '',
        material: modal.dataset.productMaterial || '',
        price: Number(modal.dataset.productPrice || 0),
        stock: Number(modal.dataset.productStock || 0),
        sellerName: modal.dataset.productSeller || 'متجر'
    });
    const qty = Number(document.getElementById('modal-qty')?.value || 1);
    addToCart(product, qty, qty);
}

function openCart() {
    const drawer = document.getElementById('cart-drawer');
    if(drawer) { drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); }
}

function closeCart() {
    const drawer = document.getElementById('cart-drawer');
    if(drawer) { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); }
}

function renderCart() {
    const listEl = document.getElementById('cart-items-list');
    const totalEl = document.getElementById('cart-total');
    const cntEl = document.getElementById('cart-count');
    if(listEl) {
        listEl.innerHTML = CART.items.map((it, idx) => `
            <li class="cart-item">
                <div class="meta">
                    <img src="https://via.placeholder.com/120x120?text=${encodeURIComponent(it.name)}" alt="${it.name}">
                    <div>
                        <div style="font-weight:700;">${it.name}</div>
                        <div style="color:#666;">${it.price} ج.م × ${it.qty || 1} = <strong>${(Number(it.price)* (it.qty||1))} ج.م</strong></div>
                    </div>
                </div>
                <div>
                    <button onclick="removeFromCart(${idx})">إزالة</button>
                </div>
            </li>`).join('');
    }
    const total = CART.items.reduce((s,i)=> s + Number(i.price || 0) * (i.qty || 1), 0);
    if(totalEl) totalEl.textContent = total;
    if(cntEl) cntEl.textContent = CART.items.length;
}

function renderCheckoutFormFallback() {
    return `
        <div class="checkout-card">
            <h3>المنتج المحدد: <span id="selected-product-name" style="color: #ff5722;"></span> &nbsp;|&nbsp; الكمية: <span id="selected-product-quantity">1</span></h3>
            <form id="order-form" onsubmit="handleOrderSubmit(event)">
                <div class="form-group">
                    <label>اختر المقاس:</label>
                    <select id="size" required>
                        <option value="M">Medium (M)</option>
                        <option value="L">Large (L)</option>
                        <option value="XL">X-Large (XL)</option>
                        <option value="XXL">XXL</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>طريقة الدفع:</label>
                    <select id="payment" onchange="updatePaymentFields()" required>
                        <option value="الدفع عند الاستلام">الدفع عند الاستلام (كاش)</option>
                        <option value="فودافون كاش">تحويل فودافون كاش</option>
                    </select>
                </div>
                <div id="vodafone-cash-section" class="form-group" style="display:none;">
                    <label>رقم فودافون كاش:</label>
                    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                        <span id="vodafone-number-text" style="font-weight:700;color:#1d1d1d;">01029481893</span>
                        <span style="color:#555;font-size:0.95rem;">بعد التحويل، ارفع صورة الإيصال</span>
                    </div>
                </div>
                <div id="vodafone-upload-section" class="form-group" style="display:none;">
                    <label>صورة تحويل فودافون كاش:</label>
                    <input type="file" id="transfer-image" accept="image/*" capture="environment" onchange="previewTransferImage()">
                    <div id="transfer-preview" style="margin-top:8px;color:#555;font-size:0.95rem;"></div>
                </div>
                <div class="form-group">
                    <label>اسم المستلم بالكامل:</label>
                    <input type="text" id="client-name" placeholder="اكتب اسمك هنا" required>
                </div>
                <div class="form-group">
                    <label>رقم الهاتف (واتساب):</label>
                    <input type="tel" id="client-phone" placeholder="مثال: 010xxxxxxx" required>
                </div>
                <div class="form-group">
                    <label>العنوان بالتفصيل:</label>
                    <input type="text" id="client-address" placeholder="المحافظة - المركز - اسم الشارع" required>
                </div>
                <div class="form-group">
                    <label>ملاحظات إضافية (اختياري):</label>
                    <textarea id="additional-notes" rows="3" placeholder="اكتب أي ملاحظات يريد فريقنا معرفتها" style="width:100%;padding:12px;border-radius:8px;border:1px solid #ddd;background:#fafafa;"></textarea>
                </div>
                <input type="hidden" id="selected-product-price">
                <input type="hidden" id="selected-product-quantity-hidden">
                <input type="hidden" id="selected-product-raw-name">
                <input type="hidden" id="selected-product-id">
                <input type="hidden" id="selected-product-stock">
                <input type="hidden" id="selected-product-seller">
                <input type="hidden" id="client-lat">
                <input type="hidden" id="client-lon">
                <div class="form-group">
                    <label>تحديد الموقع على الخريطة (اختياري):</label>
                    <div style="display:flex;gap:8px;align-items:center;">
                        <button type="button" class="btn-map" onclick="openLocationPicker()">اختر على الخريطة</button>
                        <span id="picked-coords" style="color:#666;font-size:13px;">لم يتم اختيار موقع</span>
                    </div>
                </div>
                <button type="submit" class="btn-submit">تأكيد وإرسال الطلب</button>
            </form>
        </div>
    `;
}

function renderCheckoutForm() {
    return renderCheckoutFormFallback();
}

function updatePaymentFields() {
    const paymentMethod = document.getElementById('payment')?.value;
    const vodafoneSection = document.getElementById('vodafone-cash-section');
    const uploadSection = document.getElementById('vodafone-upload-section');
    if (paymentMethod === 'فودافون كاش') {
        if (vodafoneSection) vodafoneSection.style.display = 'block';
        if (uploadSection) uploadSection.style.display = 'block';
    } else {
        if (vodafoneSection) vodafoneSection.style.display = 'none';
        if (uploadSection) uploadSection.style.display = 'none';
    }
}

function previewTransferImage() {
    const input = document.getElementById('transfer-image');
    const preview = document.getElementById('transfer-preview');
    if (!input || !preview) return;
    const file = input.files?.[0];
    if (!file) {
        preview.textContent = '';
        return;
    }
    preview.textContent = `تم اختيار الملف: ${file.name}`;
}

function openLocationPicker() {
    if (!navigator.geolocation) return showSnack('المتصفح لا يدعم تحديد الموقع');
    showSnack('جاري تحديد موقعك...');
    navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lon = pos.coords.longitude.toFixed(6);
        const coordsText = document.getElementById('picked-coords');
        const latInput = document.getElementById('client-lat');
        const lonInput = document.getElementById('client-lon');
        if (coordsText) coordsText.textContent = `${lat}, ${lon}`;
        if (latInput) latInput.value = lat;
        if (lonInput) lonInput.value = lon;
        window.open(`https://www.google.com/maps?q=${lat},${lon}`, '_blank', 'noopener,noreferrer');
        showSnack('تم اختيار الموقع بنجاح');
    }, (err) => {
        console.error(err);
        showSnack('لم نتمكن من تحديد موقعك');
    }, { timeout: 8000 });
}

function attachCheckoutFormListener() {
    const form = document.getElementById('order-form');
    if (!form) return;
    if (form._checkoutListenerAttached) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (typeof window.handleOrderSubmit === 'function') {
            window.handleOrderSubmit(e);
        } else {
            console.error('handleOrderSubmit غير معرف');
            showSnack('حدث خطأ داخلي في النموذج، يرجى إعادة تحميل الصفحة');
        }
    });
    form._checkoutListenerAttached = true;
}

function ensureCheckoutFormRendered() {
    const container = document.querySelector('.checkout-container');
    if (!container) return;
    if (!document.getElementById('selected-product-price')) {
        if (typeof window.renderCheckoutForm === 'function') {
            container.innerHTML = window.renderCheckoutForm();
        } else {
            container.innerHTML = renderCheckoutFormFallback();
        }
    }
    attachCheckoutFormListener();
}

function removeFromCart(idx) {
    CART.items.splice(idx,1);
    renderCart();
}

function goToCheckout() {
    closeCart();
    if(CART.items.length === 0) { showSnack('السلة فارغة'); return; }
    ensureCheckoutFormRendered();

    const productNameEl = document.getElementById('selected-product-name');
    const quantityEl = document.getElementById('selected-product-quantity');
    const priceInput = document.getElementById('selected-product-price');
    const qtyHidden = document.getElementById('selected-product-quantity-hidden');
    const rawNameInput = document.getElementById('selected-product-raw-name');
    const idInput = document.getElementById('selected-product-id');
    const stockInput = document.getElementById('selected-product-stock');
    const sellerInput = document.getElementById('selected-product-seller');

    if (!productNameEl || !quantityEl || !priceInput || !qtyHidden || !rawNameInput || !idInput || !stockInput || !sellerInput) {
        console.error('Checkout form inputs missing', { productNameEl, quantityEl, priceInput, qtyHidden, rawNameInput, idInput, stockInput, sellerInput });
        showSnack('حصل خطأ داخلي في نموذج الدفع، يرجى إعادة تحميل الصفحة');
        return;
    }

    const first = CART.items[0];
    if(first) {
        const product = getProductById(first.id) || getCatalogProductByName(first.name);
        productNameEl.textContent = `${first.name} - ${first.price} ج.م`;
        quantityEl.textContent = first.qty || 1;
        priceInput.value = Number(first.price);
        qtyHidden.value = Number(first.qty || 1);
        rawNameInput.value = first.name;
        idInput.value = product?.id || '';
        stockInput.value = product?.stock || 0;
        sellerInput.value = product?.sellerName || 'متجر';
    }
    showScreen('checkout-screen');
}

function openCheckoutWith(name, price, qty, productId) {
    closeProductModal();
    ensureCheckoutFormRendered();

    const productNameEl = document.getElementById('selected-product-name');
    const quantityEl = document.getElementById('selected-product-quantity');
    const priceInput = document.getElementById('selected-product-price');
    const qtyHidden = document.getElementById('selected-product-quantity-hidden');
    const rawNameInput = document.getElementById('selected-product-raw-name');
    const idInput = document.getElementById('selected-product-id');
    const stockInput = document.getElementById('selected-product-stock');
    const sellerInput = document.getElementById('selected-product-seller');

    if (!productNameEl || !quantityEl || !priceInput || !qtyHidden || !rawNameInput || !idInput || !stockInput || !sellerInput) {
        console.error('Checkout form inputs missing', { productNameEl, quantityEl, priceInput, qtyHidden, rawNameInput, idInput, stockInput, sellerInput });
        showSnack('حصل خطأ داخلي في نموذج الدفع، يرجى إعادة تحميل الصفحة');
        return;
    }

    const product = productId ? getProductById(productId) : getCatalogProductByName(name);
    productNameEl.textContent = `${name} - ${price} ج.م`;
    quantityEl.textContent = Number(qty || 1);
    priceInput.value = Number(price);
    qtyHidden.value = Number(qty || 1);
    rawNameInput.value = name;
    idInput.value = product?.id || productId || '';
    stockInput.value = product?.stock || 0;
    sellerInput.value = product?.sellerName || 'متجر';
    showScreen('checkout-screen');
}

function showSnack(text) {
    let s = document.querySelector('.snack');
    if(!s) {
        s = document.createElement('div'); s.className = 'snack'; document.body.appendChild(s);
    }
    s.textContent = text; s.classList.add('show');
    clearTimeout(window._snackTimer);
    window._snackTimer = setTimeout(() => s.classList.remove('show'), 2000);
}

// Product detail modal
function openProductDetail(name, type, material, price, imagesJson, productId) {
    let images = [];
    try { images = typeof imagesJson === 'string' ? JSON.parse(imagesJson) : imagesJson; } catch(e) { images = []; }
    const product = productId ? getProductById(productId) : getCatalogProductByName(name);

    let modal = document.getElementById('product-modal');
    if(modal) modal.remove();
    modal = document.createElement('div'); modal.id = 'product-modal'; modal.className = 'product-modal';

    modal.innerHTML = `
        <div class="modal-card" data-product-id="${product?.id || productId || ''}" data-product-name="${name.replace(/"/g, '&quot;')}" data-product-type="${type.replace(/"/g, '&quot;')}" data-product-material="${material.replace(/"/g, '&quot;')}" data-product-price="${price}" data-product-stock="${product?.stock ?? 0}" data-product-seller="${(product?.sellerName || 'متجر').replace(/"/g, '&quot;')}">
            <button class="modal-close" onclick="closeProductModal()">✕</button>
            <div class="modal-body">
                <div class="modal-gallery">
                    <img src="${images[0] || 'https://via.placeholder.com/600x800?text='+encodeURIComponent(name)}" id="modal-main-img" alt="${name}">
                    <div class="modal-thumbs">
                        ${images.map(src => `<img src="${src}" onclick="document.getElementById('modal-main-img').src='${src}'">`).join('')}
                    </div>
                </div>
                <div class="modal-info">
                    <h2>${name}</h2>
                    <div class="product-rating"><span class="star"></span><span>${(Math.random()*1.7+3.3).toFixed(1)}</span></div>
                    <p><strong>النوع:</strong> ${type}</p>
                    <p><strong>الخامة:</strong> ${material}</p>
                    <p class="price">${price} ج.م</p>
                    <p class="stock-pill">المخزون المتاح: ${product?.stock ?? 0}</p>
                    <div class="modal-qty">
                        <label>الكمية: </label>
                        <input id="modal-qty" type="number" min="1" value="1" style="width:80px;padding:8px;border-radius:6px;border:1px solid #ddd;">
                    </div>
                    <div class="modal-actions">
                        <button class="btn-add" onclick="(function(){ const q = Number(document.getElementById('modal-qty').value||1); addToCartFromModal(this); closeProductModal(); })()">أضف إلى السلة</button>
                        <button class="btn-order primary" onclick="(function(){ const q = Number(document.getElementById('modal-qty').value||1); openCheckoutWith('${name.replace(/'/g, "\\\\'")}', ${price}, q, '${product?.id || productId || ''}'); })()">اطلب الآن</button>
                        <button class="btn-map" onclick="openMapsForDelivery()">تحديد موقع التسليم</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// helper to open product detail when invoked from a card element
function openProductDetailFromCard(buttonEl) {
    try {
        const card = buttonEl.closest('.product-card');
        if (!card) return;
        const name = card.dataset.name || card.querySelector('.product-info h3')?.textContent || 'منتج';
        const type = card.dataset.type || '';
        const material = card.dataset.material || '';
        const price = card.dataset.price || card.querySelector('.price')?.textContent || '';
        let images = [];
        try { images = JSON.parse(card.dataset.images || '[]'); } catch (e) { images = []; }
        openProductDetail(name, type, material, price, images, card.dataset.productId || '');
    } catch (e) { console.error(e); }
}

function closeProductModal() {
    const m = document.getElementById('product-modal'); if(m) m.remove();
}

function openMapsForDelivery() {
    if(!navigator.geolocation) return showSnack('المتصفح لا يدعم تحديد الموقع');
    showSnack('جاري تحديد موقعك...');
    navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude; const lon = pos.coords.longitude;
        const mapsUrl = `https://maps.google.com/?q=${lat},${lon}`;
        window.open(mapsUrl, '_blank');
    }, (err) => {
        console.error(err); showSnack('لم نتمكن من تحديد موقعك');
    }, { timeout: 8000 });
}

function toggleRoleMode() {
    openAuthModal();
}

function updateRoleButton() {
    const button = document.getElementById('role-toggle-btn');
    if (button) {
        button.textContent = APP_STATE.isLoggedIn ? (APP_STATE.role === 'seller' ? 'حساب التاجر' : 'حساب المشتري') : 'تسجيل / دخول';
    }
}

function openAuthModal() {
    closeAuthModal();
    const overlay = document.createElement('div');
    overlay.className = 'auth-modal-overlay';
    overlay.innerHTML = `
        <div class="auth-modal-card">
            <button class="modal-close" onclick="closeAuthModal()">✕</button>
            <h3>${APP_STATE.isLoggedIn ? 'تحديث الحساب' : 'إنشاء حساب أو تسجيل دخول'}</h3>
            <p>${APP_STATE.isLoggedIn ? 'يمكنك تغيير اسم الحساب أو نوعه هنا.' : 'ادخل رقم الهاتف أو البريد ثم اختر نوع الحساب.'}</p>
            <div class="auth-grid">
                <input id="auth-name" placeholder="الاسم المعروض في الطلبات" value="${(APP_STATE.accountName || '').replace(/"/g, '&quot;')}" />
                <input id="auth-phone" placeholder="رقم الهاتف أو البريد" value="${(APP_STATE.accountPhone || '').replace(/"/g, '&quot;')}" />
                <div class="auth-role-picker">
                    <button type="button" class="${APP_STATE.role === 'buyer' ? 'active' : ''}" onclick="setSelectedAuthRole('buyer')">مشتري</button>
                    <button type="button" class="${APP_STATE.role === 'seller' ? 'active' : ''}" onclick="setSelectedAuthRole('seller')">تاجر</button>
                </div>
            </div>
            <div class="auth-actions">
                <button class="btn-order primary" onclick="saveAuthAccount()">حفظ الحساب</button>
                <button class="btn-map" onclick="saveAuthAccount('google')">تسجيل بحساب Google</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

function closeAuthModal() {
    const modal = document.querySelector('.auth-modal-overlay');
    if (modal) modal.remove();
}

function setSelectedAuthRole(role) {
    APP_STATE.role = role;
    const buttons = document.querySelectorAll('.auth-role-picker button');
    buttons.forEach(btn => btn.classList.toggle('active', btn.textContent.includes(role === 'seller' ? 'تاجر' : 'مشتري')));
    persistAppState();
    updateRoleButton();
}

function saveAuthAccount(method = 'phone') {
    const name = document.getElementById('auth-name')?.value.trim() || 'زائر';
    const identifier = document.getElementById('auth-phone')?.value.trim() || '';
    const normalizedIdentifier = identifier || (method === 'google' ? 'google-user@example.com' : 'phone-user');
    APP_STATE.accountName = name;
    APP_STATE.accountPhone = normalizedIdentifier;
    APP_STATE.accountMethod = method === 'google' ? 'google' : 'phone';
    APP_STATE.isLoggedIn = Boolean(name && normalizedIdentifier);
    persistAppState();
    updateRoleButton();
    closeAuthModal();
    showSnack(APP_STATE.role === 'seller' ? 'تم حفظ حساب التاجر' : 'تم حفظ حساب المشتري');
}

function closeSellerPanel() {
    const panel = document.getElementById('seller-panel');
    if (panel) panel.remove();
}

async function submitSellerProduct(e) {
    e.preventDefault();
    const form = e.target;
    const product = normalizeProduct({
        id: `product-${Date.now()}`,
        name: form.querySelector('[name="product-name"]').value.trim(),
        type: form.querySelector('[name="product-type"]').value.trim(),
        material: form.querySelector('[name="product-material"]').value.trim(),
        price: Number(form.querySelector('[name="product-price"]').value || 0),
        stock: Number(form.querySelector('[name="product-stock"]').value || 0),
        commissionPercent: Number(form.querySelector('[name="product-commission"]').value || 10),
        sellerName: form.querySelector('[name="product-seller"]').value.trim() || 'متجر',
        category: form.querySelector('[name="product-category"]').value.trim() || 'عام',
        images: getProductImages(form.querySelector('[name="product-name"]').value.trim())
    });

    if (!product.name || product.price <= 0 || product.stock < 0) {
        showSnack('ادخل اسم المنتج والسعر والمخزون بشكل صحيح');
        return;
    }

    APP_STATE.products.unshift(product);
    persistAppState();
    if (typeof window.syncProductsToSupabase === 'function') {
        await window.syncProductsToSupabase(getCatalogProducts());
    }
    renderProductsGrid(getCatalogProducts(), 'المنتجات');
    closeSellerPanel();
    showSnack('تم إضافة المنتج ومزامنته في المتجر');
}

function openSellerPanel() {
    if (APP_STATE.role !== 'seller' || !APP_STATE.isLoggedIn) {
        showSnack('ابدأ بتسجيل حساب التاجر أولاً');
        return;
    }
    closeSellerPanel();
    const panel = document.createElement('div');
    panel.id = 'seller-panel';
    panel.className = 'seller-panel-overlay';
    const sellerSummary = Object.entries(APP_STATE.sellerBalances || {}).map(([name, value]) => `${name}: ${value.toFixed(2)} ج.م`).join(' • ') || 'لا توجد عمولات بعد';
    const totalSales = APP_STATE.orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const outOfStock = getCatalogProducts().filter(item => Number(item.stock || 0) <= 0).length;
    const lowStock = getCatalogProducts().filter(item => Number(item.stock || 0) > 0 && Number(item.stock || 0) <= 3).length;
    const productSummary = getCatalogProducts().slice(0, 6).map(product => `<div class="seller-product-item"><strong>${product.name}</strong><span>المخزون ${product.stock} • ${product.price} ج.م</span></div>`).join('');
    const recentOrders = (APP_STATE.orders || []).slice(0, 4).map(order => `<div class="seller-product-item"><strong>${order.customerName || order.customer_name || 'عميل'}</strong><span>${order.totalAmount || order.amount || 0} ج.م</span></div>`).join('');
    panel.innerHTML = `
        <div class="seller-panel-card">
            <div class="seller-panel-header">
                <h3>لوحة التاجر</h3>
                <button class="modal-close" onclick="closeSellerPanel()">✕</button>
            </div>
            <div class="seller-panel-body">
                <div class="seller-stats-grid">
                    <div class="seller-stat-card"><span>إجمالي العمولات</span><strong>${sellerSummary}</strong></div>
                    <div class="seller-stat-card"><span>إجمالي المبيعات</span><strong>${totalSales.toFixed(2)} ج.م</strong></div>
                    <div class="seller-stat-card"><span>عدد المنتجات</span><strong>${getCatalogProducts().length}</strong></div>
                    <div class="seller-stat-card"><span>المنتجات المتاحة</span><strong>${getCatalogProducts().filter(item => Number(item.stock || 0) > 0).length}</strong></div>
                    <div class="seller-stat-card"><span>نفدت من المخزون</span><strong>${outOfStock}</strong></div>
                    <div class="seller-stat-card"><span>مخزون منخفض</span><strong>${lowStock}</strong></div>
                </div>
                <form class="seller-form" onsubmit="submitSellerProduct(event)">
                    <div class="seller-form-grid">
                        <label>اسم المنتج<input name="product-name" required></label>
                        <label>النوع<input name="product-type" value="عام"></label>
                        <label>الخامة<input name="product-material" value="قطن"></label>
                        <label>السعر<input name="product-price" type="number" min="1" required></label>
                        <label>المخزون<input name="product-stock" type="number" min="0" required></label>
                        <label>اسم التاجر<input name="product-seller" value="متجر"></label>
                        <label>القسم<input name="product-category" value="عام"></label>
                        <label>نسبة العمولة %<input name="product-commission" type="number" min="0" max="100" value="10"></label>
                    </div>
                    <button class="btn-order primary" type="submit">إضافة المنتج</button>
                </form>
                <div class="seller-summary">
                    <h4>أحدث المنتجات</h4>
                    <div class="seller-products-list">${productSummary}</div>
                    <h4>أحدث الطلبات</h4>
                    <div class="seller-products-list">${recentOrders || '<div class="seller-product-item"><strong>لا توجد طلبات بعد</strong></div>'}</div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(panel);
}

const APP_GLOBALS = {
    showScreen,
    toggleSubMenu,
    openProductPage,
    openCheckoutPage,
    setMainImage,
    thumbNav,
    getAllProducts,
    performSearch,
    setupSearchSuggest,
    closeSuggestions,
    addToCart,
    openCart,
    closeCart,
    renderProductsGrid,
    renderCheckoutForm,
    renderCheckoutFormFallback,
    updatePaymentFields,
    previewTransferImage,
    openLocationPicker,
    openMapsForDelivery,
    removeFromCart,
    goToCheckout,
    openCheckoutWith,
    showSnack,
    openCustomerSupport,
    openProductDetail,
    openProductDetailFromCard,
    closeProductModal,
    toggleRoleMode,
    updateRoleButton,
    openSellerPanel,
    closeSellerPanel,
    submitSellerProduct,
    getProductById,
    decreaseStockAndUpdateBalance,
    persistLocalOrder,
    openAuthModal,
    closeAuthModal,
    setSelectedAuthRole,
    saveAuthAccount,
    simulateGoogleAuth
};
Object.assign(window, APP_GLOBALS);

// تشغيل ورص المكونات أول ما المتصفح يفتح
document.addEventListener('DOMContentLoaded', async () => {
    setupSearchSuggest();

    // رص الشاشة الافتتاحية والأقسام
    if(typeof window.renderWelcomeScreen === 'function') {
        document.getElementById('welcome-screen').innerHTML = window.renderWelcomeScreen();
    }
    if(typeof window.renderCategoriesScreen === 'function') {
        document.getElementById('categories-screen').innerHTML = window.renderCategoriesScreen();
    }

    const productsGrid = document.querySelector('.products-grid');
    if(productsGrid && typeof window.renderProductCard === 'function') {
        renderProductsGrid(getCatalogProducts(), 'المنتجات');
    }

    initializeProductInteractions();

    // رص فورم الشراء
    const checkoutContainer = document.querySelector('.checkout-container');
    if(checkoutContainer && typeof window.renderCheckoutForm === 'function') {
        checkoutContainer.innerHTML = window.renderCheckoutForm();
    }

    updateRoleButton();

    try {
        await hydrateCatalogFromSupabase();
    } catch (err) {
        console.warn('Supabase hydration skipped:', err);
    }

    // إخفاء الهيدر لو الشاشة الافتتاحية هي النشطة
    const header = document.querySelector('.site-header');
    const welcome = document.getElementById('welcome-screen');
    if(header && welcome && welcome.classList.contains('active')) {
        header.style.display = 'none';
    }
}); 