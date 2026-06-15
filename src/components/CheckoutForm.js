function renderCheckoutForm() {
    return `
        <div class="checkout-card">
            <h3>المنتج المحدد: <span id="selected-product-name" style="color: #ff5722;"></span> &nbsp;|&nbsp; الكمية: <span id="selected-product-quantity">1</span></h3>
            <form id="order-form">
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

// دالة التعامل مع إرسال الفورم وحفظها في السيرفر والواتساب
async function handleOrderSubmit(e) {
    e.preventDefault();
    
    const rawProductName = document.getElementById('selected-product-raw-name').value || document.getElementById('selected-product-name').textContent;
    const price = Number(document.getElementById('selected-product-price').value || '0');
    const quantity = Number(document.getElementById('selected-product-quantity-hidden').value || document.getElementById('selected-product-quantity').textContent || '1');
    const orderData = {
        productName: rawProductName,
        displayName: document.getElementById('selected-product-name').textContent,
        price: price,
        quantity: quantity,
        size: document.getElementById('size').value,
        payment: document.getElementById('payment').value,
        name: document.getElementById('client-name').value,
        phone: document.getElementById('client-phone').value,
        address: document.getElementById('client-address').value
    };

    // optional lat/lon
    const lat = document.getElementById('client-lat').value || null;
    const lon = document.getElementById('client-lon').value || null;


    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.textContent = "جاري حفظ وإرسال طلبك...";
    submitBtn.disabled = true;

    console.log('handleOrderSubmit', {
        orderData,
        lat,
        lon,
        hasSupabaseClient: typeof window.supabaseClient !== 'undefined' && window.supabaseClient,
        hasCreateOrder: typeof window.createOrder === 'function'
    });

    try {
        if (typeof window.supabaseClient !== 'undefined' && window.supabaseClient) {
            const { data, error } = await window.supabaseClient
                .from('orders')
                .insert([
                    {
                        items: [{
                            name: orderData.productName,
                            price: orderData.price,
                            quantity: orderData.quantity,
                            size: orderData.size,
                            payment_method: orderData.payment
                        }],
                        total: orderData.price * orderData.quantity,
                        status: 'pending',
                        shipping_address: {
                            address: orderData.address,
                            phone: orderData.phone,
                            lat: lat,
                            lon: lon
                        },
                        metadata: {
                            client_name: orderData.name,
                            payment_method: orderData.payment
                        },
                        created_at: new Date().toISOString()
                    }
                ]);
            if (error) throw error;
            console.log('Supabase insert response', data);
            submitBtn.textContent = "تم الحفظ! جاري فتح واتساب...";
        } else if (typeof window.createOrder === 'function') {
            await window.createOrder({
                items: [{
                    name: orderData.productName,
                    price: orderData.price,
                    quantity: orderData.quantity,
                    size: orderData.size,
                    payment_method: orderData.payment
                }],
                total: orderData.price * orderData.quantity,
                status: 'pending',
                shipping_address: {
                    address: orderData.address,
                    phone: orderData.phone,
                    lat: lat,
                    lon: lon
                },
                metadata: {
                    client_name: orderData.name,
                    payment_method: orderData.payment
                },
                created_at: new Date().toISOString()
            });
            submitBtn.textContent = "تم الحفظ! جاري فتح واتساب...";
        } else {
            console.warn('Supabase client غير متاح؛ تم تجاوز حفظ الطلب.');
            submitBtn.textContent = "جاري فتح واتساب...";
        }
    } catch (err) {
        console.error('order submit error', err);
        alert("حدث خطأ في السيرفر: " + (err.message || err));
        submitBtn.textContent = "تأكيد وإرسال الطلب";
        submitBtn.disabled = false;
        return;
    }

    const message = `طلب شراء جديد لبراند الملابس:\n\n` +
                    `📦 المنتج: ${orderData.productName}\n` +
                    `📏 المقاس: ${orderData.size}\n` +
                    `💳 طريقة الدفع: ${orderData.payment}\n\n` +
                    `👤 اسم العميل: ${orderData.name}\n` +
                    `📞 رقم الهاتف: ${orderData.phone}\n` +
                    `📍 العنوان: ${orderData.address}`;

    const myWhatsAppNumber = "201000000000"; // ضع رقم واتسابك الحقيقي
    const whatsappUrl = `https://wa.me/${myWhatsAppNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    document.getElementById('order-form').reset();
    submitBtn.textContent = "تأكيد وإرسال الطلب";
    submitBtn.disabled = false;
}

if (typeof window !== 'undefined') {
    window.renderCheckoutForm = renderCheckoutForm;
    window.handleOrderSubmit = handleOrderSubmit;
    window.openLocationPicker = openLocationPicker;
}

// --- Location picker (Leaflet) ---
async function openLocationPicker() {
    // load leaflet if needed
    if (!window.L) {
        const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(css);
        await new Promise((res, rej) => {
            const s = document.createElement('script'); s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s.onload = res; s.onerror = rej; document.body.appendChild(s);
        });
    }

    // create modal container
    let modal = document.getElementById('location-picker-modal');
    if (modal) modal.remove();
    modal = document.createElement('div'); modal.id = 'location-picker-modal'; modal.className = 'product-modal';
    modal.innerHTML = `
        <div class="modal-card">
            <button class="modal-close" onclick="(function(){document.getElementById('location-picker-modal')?.remove();})();">✕</button>
            <div style="height:70vh;width:90vw;max-width:900px;">
                <div id="lp-map" style="height:100%;width:100%;border-radius:8px;overflow:hidden"></div>
                <div style="padding:8px;text-align:center;">
                    <button class="btn-add" id="lp-confirm">تأكيد الموقع</button>
                </div>
            </div>
        </div>`;
    document.body.appendChild(modal);

    const map = L.map('lp-map').setView([30.0444,31.2357], 12); // default to Cairo
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    let marker;
    function setMarker(latlng) {
        if (marker) marker.setLatLng(latlng);
        else marker = L.marker(latlng, { draggable: true }).addTo(map);
        document.getElementById('picked-coords').textContent = `موقع مختار: ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
        document.getElementById('client-lat').value = latlng.lat;
        document.getElementById('client-lon').value = latlng.lng;
    }

    map.on('click', (e) => setMarker(e.latlng));

    // try geolocation to center map
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p => map.setView([p.coords.latitude, p.coords.longitude], 14), () => {});

    document.getElementById('lp-confirm').addEventListener('click', () => { document.getElementById('location-picker-modal')?.remove(); showSnack('تم اختيار الموقع'); });
}