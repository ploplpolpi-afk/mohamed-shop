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

function openAuthScreen() {
    showScreen('auth-screen');
    renderAuthScreen();
}

function updateAuthUI(user) {
    currentUser = user;
    const authBtn = document.getElementById('auth-btn');
    const userLabel = document.getElementById('user-label');
    if(authBtn) {
        authBtn.textContent = user ? 'حسابي' : 'دخول';
    }
    if(userLabel) {
        userLabel.textContent = user ? `مرحباً، ${user.email}` : '';
    }
    if(document.getElementById('auth-screen')?.classList.contains('active')) {
        renderAuthScreen();
    }
}

async function refreshAuthState() {
    if(!window.supabaseClient?.auth) return;
    const { data } = await window.supabaseClient.auth.getSession();
    const user = data?.session?.user || null;
    updateAuthUI(user);
}

async function handleAuthSubmit(event, mode) {
    event.preventDefault();
    const form = document.getElementById('auth-form');
    if(!form) return;
    const email = document.getElementById('auth-email')?.value.trim();
    const password = document.getElementById('auth-password')?.value;
    if(!email || !password) {
        return showSnack('اكتب البريد وكلمة المرور');
    }
    const button = event.target.closest('button');
    const originalText = button?.textContent || '';
    if(button) button.disabled = true;

    try {
        let result;
        if(mode === 'signup') {
            result = await window.supabaseClient.auth.signUp({ email, password });
        } else {
            result = await window.supabaseClient.auth.signInWithPassword({ email, password });
        }

        if(result.error) throw result.error;
        await refreshAuthState();

        if(mode === 'signup') {
            showSnack('تم إنشاء الحساب. تحقق من بريدك إذا كان مطلوباً.');
        } else {
            showSnack('تم تسجيل الدخول بنجاح');
            showScreen('categories-screen');
        }
    } catch (err) {
        console.error('Auth error:', err);
        showSnack(err?.message || 'حدث خطأ أثناء التسجيل');
    } finally {
        if(button) {
            button.disabled = false;
            button.textContent = originalText;
        }
    }
}

async function signOutUser() {
    if(!window.supabaseClient?.auth) return;
    await window.supabaseClient.auth.signOut();
    updateAuthUI(null);
    showSnack('تم تسجيل الخروج');
    showScreen('categories-screen');
}

function renderAuthScreen() {
    const container = document.querySelector('.auth-container');
    if(!container) return;
    if(currentUser) {
        container.innerHTML = `
            <div class="auth-card">
                <h3>حسابك</h3>
                <p>البريد الإلكتروني: <strong>${currentUser.email}</strong></p>
                <p>يمكنك متابعة التسوق أو تسجيل الخروج.</p>
                <div class="auth-actions">
                    <button class="btn-primary" onclick="showScreen('categories-screen')">متابعة التسوق</button>
                    <button class="btn-order primary" onclick="signOutUser()">تسجيل الخروج</button>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="auth-card">
            <p class="auth-note">سجل الدخول أو أنشئ حساب جديد باستخدام البريد الإلكتروني وكلمة المرور.</p>
            <form id="auth-form" onsubmit="handleAuthSubmit(event,'login')">
                <div class="form-group">
                    <label>البريد الإلكتروني</label>
                    <input type="email" id="auth-email" placeholder="مثال: name@example.com" required>
                </div>
                <div class="form-group">
                    <label>كلمة المرور</label>
                    <input type="password" id="auth-password" placeholder="أدخل كلمة المرور" minlength="6" required>
                </div>
                <div class="auth-actions">
                    <button type="submit" class="btn-submit">دخول</button>
                    <button type="button" class="btn-primary" onclick="handleAuthSubmit(event,'signup')">تسجيل جديد</button>
                </div>
            </form>
        </div>
    `;
}

// دالة فتح صفحة المنتجات المربعات
function openProductPage(sectionName) {
    document.getElementById('current-section-title').textContent = sectionName;
    const productsGrid = document.querySelector('.products-grid');
    if(!productsGrid) return showScreen('products-screen');

    // توليد منتجات تجريبية حسب القسم المحدد
    const products = [];
    const name = sectionName || '';

    if(name.includes('تشرت') || name.includes('تيشرت') ) {
        products.push(['تيشرت قطن ساده', 'تيشرت', 'قطن', '220']);
        products.push(['تيشرت مطبوع مميز', 'تيشرت', 'قطن 100%', '260']);
        products.push(['تيشرت اوفر سايز', 'تيشرت', 'قماش خفيف', '240']);
    } else if(name.includes('هوديز')) {
        products.push(['هودي مبطن', 'هودي', 'قماش مبطن', '450']);
        products.push(['هودي بسيط', 'هودي', 'قطن مخلوط', '400']);
    } else if(name.includes('بنطلون') || name.includes('بناطيل')) {
        products.push(['بنطلون جينز مودرن', 'بنطلون', 'جينز', '320']);
        products.push(['بنطلون قماش كلاسيك', 'بنطلون', 'قماش', '290']);
    } else if(name.includes('ترنج')) {
        products.push(['ترنج رياضي مريح', 'ترنج', 'بولستر', '380']);
        products.push(['ترنج براند', 'ترنج', 'قطن مبطن', '420']);
    } else if(name.includes('بلوزات') || name.includes('بلوز')) {
        products.push(['بلوزة شيفون أنيقة', 'بلوزة', 'شيفون', '330']);
        products.push(['بلوزة قطنية', 'بلوزة', 'قطن', '260']);
    } else if(name.includes('دراسات') || name.includes('فساتين')) {
        products.push(['فستان سهرة', 'فستان', 'قماش فخم', '650']);
        products.push(['فستان يومي', 'فستان', 'قطن', '420']);
    } else {
        products.push(['تيشرت كاجوال راقي', 'تيشرت', 'قطن 100%', '250']);
        products.push(['تيشرت أوفر سايز بيسك', 'تيشرت', 'قطن مصري فاخر', '280']);
    }

    // بناء الكروت
    productsGrid.innerHTML = products.map(p => renderProductCard(p[0], p[1], p[2], p[3])).join('');

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
    const all = [];
    const push = p => all.push(p);
    push(['تيشرت قطن ساده','تيشرت','قطن','220']);
    push(['تيشرت مطبوع مميز','تيشرت','قطن 100%','260']);
    push(['تيشرت اوفر سايز','تيشرت','قماش خفيف','240']);
    push(['هودي مبطن','هودي','قماش مبطن','450']);
    push(['هودي بسيط','هودي','قطن مخلوط','400']);
    push(['بنطلون جينز مودرن','بنطلون','جينز','320']);
    push(['بنطلون قماش كلاسيك','بنطلون','قماش','290']);
    push(['ترنج رياضي مريح','ترنج','بولستر','380']);
    push(['ترنج براند','ترنج','قطن مبطن','420']);
    push(['بلوزة شيفون أنيقة','بلوزة','شيفون','330']);
    push(['بلوزة قطنية','بلوزة','قطن','260']);
    push(['فستان سهرة','فستان','قماش فخم','650']);
    push(['فستان يومي','فستان','قطن','420']);
    push(['تيشرت كاجوال راقي','تيشرت','قطن 100%','250']);
    push(['تيشرت أوفر سايز بيسك','تيشرت','قطن مصري فاخر','280']);
    return all;
}

function performSearch() {
    const q = document.getElementById('site-search-input').value.trim();
    if(!q) return showSnack('اكتب ما تريد البحث عنه');
    const list = getAllProducts();
    const lower = q.toLowerCase();
    const results = list.filter(p => (p[0]+ ' ' + p[1] + ' ' + p[2]).toLowerCase().includes(lower));
    const productsGrid = document.querySelector('.products-grid');
    if(!productsGrid) return;
    productsGrid.innerHTML = results.map(p => renderProductCard(p[0], p[1], p[2], p[3])).join('') || '<div style="padding:30px; text-align:center; color:#777">لم نعثر على منتجات مطابقة</div>';
    document.getElementById('current-section-title').textContent = `نتائج البحث: "${q}"`;
    closeSuggestions();
    showScreen('products-screen');
    initializeProductInteractions();
}

let _suggestDeb; 
let currentUser = null;
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
            const matches = items.filter(p => p[0].toLowerCase().includes(q) || p[1].toLowerCase().includes(q)).slice(0,8);
            sugg.innerHTML = matches.map(m => `<button onclick="(function(){document.getElementById('site-search-input').value='${m[0]}'; performSearch();})();">${m[0]} — ${m[1]}</button>`).join('');
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
function addToCart(name, price, quantity = 1) {
    const q = Number(quantity || 1);
    CART.items.push({ name, price, qty: q });
    CART.count = CART.items.length;
    const cntEl = document.getElementById('cart-count');
    if(cntEl) cntEl.textContent = CART.count;
    renderCart();
    showSnack(`${name} أضيفت إلى السلة`);
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
                    <select id="payment" required>
                        <option value="الدفع عند الاستلام">الدفع عند الاستلام (كاش)</option>
                        <option value="فودافون كاش">تحويل فودافون كاش</option>
                    </select>
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
                <input type="hidden" id="selected-product-price">
                <input type="hidden" id="selected-product-quantity-hidden">
                <input type="hidden" id="selected-product-raw-name">
                <div class="form-group">
                    <label>تحديد الموقع على الخريطة (اختياري):</label>
                    <div style="display:flex;gap:8px;align-items:center;">
                        <button type="button" class="btn-map" onclick="openLocationPicker()">اختر على الخريطة</button>
                        <span id="picked-coords" style="color:#666;font-size:13px;">لم يتم اختيار موقع</span>
                    </div>
                    <input type="hidden" id="client-lat">
                    <input type="hidden" id="client-lon">
                </div>
                <button type="submit" class="btn-submit">تأكيد وإرسال الطلب</button>
            </form>
        </div>
    `;
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
    if(!currentUser) { showSnack('يجب تسجيل الدخول أولاً'); openAuthScreen(); return; }
    ensureCheckoutFormRendered();

    const productNameEl = document.getElementById('selected-product-name');
    const quantityEl = document.getElementById('selected-product-quantity');
    const priceInput = document.getElementById('selected-product-price');
    const qtyHidden = document.getElementById('selected-product-quantity-hidden');
    const rawNameInput = document.getElementById('selected-product-raw-name');

    if (!productNameEl || !quantityEl || !priceInput || !qtyHidden || !rawNameInput) {
        console.error('Checkout form inputs missing', { productNameEl, quantityEl, priceInput, qtyHidden, rawNameInput });
        showSnack('حصل خطأ داخلي في نموذج الدفع، يرجى إعادة تحميل الصفحة');
        return;
    }

    const first = CART.items[0];
    if(first) {
        productNameEl.textContent = `${first.name} - ${first.price} ج.م`;
        quantityEl.textContent = first.qty || 1;
        priceInput.value = Number(first.price);
        qtyHidden.value = Number(first.qty || 1);
        rawNameInput.value = first.name;
    }
    showScreen('checkout-screen');
}

function openCheckoutWith(name, price, qty) {
    closeProductModal();
    ensureCheckoutFormRendered();

    const productNameEl = document.getElementById('selected-product-name');
    const quantityEl = document.getElementById('selected-product-quantity');
    const priceInput = document.getElementById('selected-product-price');
    const qtyHidden = document.getElementById('selected-product-quantity-hidden');
    const rawNameInput = document.getElementById('selected-product-raw-name');

    if (!productNameEl || !quantityEl || !priceInput || !qtyHidden || !rawNameInput) {
        console.error('Checkout form inputs missing', { productNameEl, quantityEl, priceInput, qtyHidden, rawNameInput });
        showSnack('حصل خطأ داخلي في نموذج الدفع، يرجى إعادة تحميل الصفحة');
        return;
    }

    productNameEl.textContent = `${name} - ${price} ج.م`;
    quantityEl.textContent = Number(qty || 1);
    priceInput.value = Number(price);
    qtyHidden.value = Number(qty || 1);
    rawNameInput.value = name;
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
function openProductDetail(name, type, material, price, imagesJson) {
    let images = [];
    try { images = typeof imagesJson === 'string' ? JSON.parse(imagesJson) : imagesJson; } catch(e) { images = []; }

    let modal = document.getElementById('product-modal');
    if(modal) modal.remove();
    modal = document.createElement('div'); modal.id = 'product-modal'; modal.className = 'product-modal';

    modal.innerHTML = `
        <div class="modal-card">
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
                    <div class="modal-qty">
                        <label>الكمية: </label>
                        <input id="modal-qty" type="number" min="1" value="1" style="width:80px;padding:8px;border-radius:6px;border:1px solid #ddd;">
                    </div>
                    <div class="modal-actions">
                        <button class="btn-add" onclick="(function(){ const q = Number(document.getElementById('modal-qty').value||1); addToCart('${name}', ${price}, q); closeProductModal(); })()">أضف إلى السلة</button>
                        <button class="btn-order primary" onclick="(function(){ const q = Number(document.getElementById('modal-qty').value||1); openCheckoutWith('${name.replace(/'/g, "\\\\'")}', ${price}, q); })()">اطلب الآن</button>
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
        openProductDetail(name, type, material, price, images);
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

// تشغيل ورص المكونات أول ما المتصفح يفتح
document.addEventListener('DOMContentLoaded', () => {
    setupSearchSuggest();

    // رص الشاشة الافتتاحية والأقسام
    if(typeof renderWelcomeScreen === 'function') {
        document.getElementById('welcome-screen').innerHTML = renderWelcomeScreen();
    }
    if(typeof renderCategoriesScreen === 'function') {
        document.getElementById('categories-screen').innerHTML = renderCategoriesScreen();
    }
    
    // رص كروت المنتجات
    const productsGrid = document.querySelector('.products-grid');
    if(productsGrid && typeof renderProductCard === 'function') {
        productsGrid.innerHTML = 
            renderProductCard('تيشرت كاجوال راقي', 'شبابي مطبوع', 'قطن 100%', '250') +
            renderProductCard('تيشرت أوفر سايز بيسك', 'مريح سادة', 'قطن مصري فاخر', '280');
    }

    initializeProductInteractions();

    // رص فورم الشراء
    const checkoutContainer = document.querySelector('.checkout-container');
    if(checkoutContainer && typeof renderCheckoutForm === 'function') {
        checkoutContainer.innerHTML = renderCheckoutForm();
    }

    // رصد حالة المصادقة للمستخدم عند التحميل
    refreshAuthState();
    if(window.supabaseClient?.auth?.onAuthStateChange) {
        window.supabaseClient.auth.onAuthStateChange((_event, session) => {
            const user = session?.user || null;
            updateAuthUI(user);
            if(user) showSnack('مرحباً بعودتك');
        });
    }

    // إخفاء الهيدر لو الشاشة الافتتاحية هي النشطة
    const header = document.querySelector('.site-header');
    const welcome = document.getElementById('welcome-screen');
    if(header && welcome && welcome.classList.contains('active')) {
        header.style.display = 'none';
    }
}); 