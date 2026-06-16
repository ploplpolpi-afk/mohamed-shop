function renderCheckoutForm() {
    return `
        <div class="checkout-card">
            <h3>المنتج المحدد: <span id="selected-product-name" style="color: #ff5722;"></span>  |  الكمية: <span id="selected-product-quantity">1</span></h3>
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

    const lat = document.getElementById('client-lat').value || null;
    const lon = document.getElementById('client-lon').value || null;

    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.textContent = "جاري حفظ وإرسال طلبك...";
    submitBtn.disabled = true;

    const cartItemsArray = [{
        name: orderData.productName,
        price: orderData.price,
        quantity: orderData.quantity,
        size: orderData.size,
        payment_method: orderData.payment,
        latitude: lat,
        longitude: lon
    }];

    const totalPriceCalc = orderData.price * orderData.quantity;

    try {
        // الاعتماد الكلي والمباشر على الـ window لمنع أي تعليق
        if (window.supabaseClient) {
            const { data, error } = await window.supabaseClient
                .from('orders')
                .insert([
                    {
                        customer_name: orderData.name,
                        customer_phone: orderData.phone,
                        customer_address: orderData.address,
                        cart_items: cartItemsArray,
                        total_price: totalPriceCalc,
                        order_status: 'قيد المراجعة'
                    }
                ]);
                
            if (error) throw error;
            console.log('تم الحفظ بنجاح:', data);
        } else {
            console.warn('supabaseClient غير معرف على الـ window حالياً');
        }
    } catch (err) {
        console.error('خطأ السيرفر:', err);
        alert("فشل الحفظ في القاعدة، لكن سيتم فتح الواتساب: " + (err.message || err));
    }

    // تجهيز رسالة الواتساب وتصحيح رابط الخريطة
    let message = `*طلب شراء جديد من متجر محمد شوب* 🛒\n\n` +
                  `📦 *المنتج:* ${orderData.productName}\n` +
                  `📏 *المقاس:* ${orderData.size}\n` +
                  `🔢 *الكمية:* ${orderData.quantity}\n` +
                  `💰 *الحساب الإجمالي:* ${totalPriceCalc} ج.م\n` +
                  `💳 *طريقة الدفع:* ${orderData.payment}\n\n` +
                  `👤 *اسم العميل:* ${orderData.name}\n` +
                  `📞 *رقم الهاتف:* ${orderData.phone}\n` +
                  `📍 *العنوان:* ${orderData.address}`;

    if (lat && lon) {
        message += `\n🗺️ *موقع العميل:* https://maps.google.com/?q=${lat},${lon}`;
    }

    const myWhatsAppNumber = "201016544975"; 
    const whatsappUrl = `https://wa.me/${myWhatsAppNumber}?text=${encodeURIComponent(message)}`;
    
    // فتح الواتساب فوراً
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

async function openLocationPicker() {
    if (!window.L) {
        const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(css);
        await new Promise((res, rej) => {
            const s = document.createElement('script'); s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s.onload = res; s.onerror = rej; document.body.appendChild(s);
        });
    }

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

    const map = L.map('lp-map').setView([30.0444,31.2357], 12);
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
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p => map.setView([p.coords.latitude, p.coords.longitude], 14), () => {});

    document.getElementById('lp-confirm').addEventListener('click', () => { 
        document.getElementById('location-picker-modal')?.remove(); 
        if(typeof showSnack === 'function') showSnack('تم اختيار الموقع'); 
    });
}