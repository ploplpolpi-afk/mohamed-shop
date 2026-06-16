async function handleOrderSubmit(e) {
    e.preventDefault();
    
    const rawProductName = document.getElementById('selected-product-raw-name').value || document.getElementById('selected-product-name').textContent;
    const price = Number(document.getElementById('selected-product-price').value || '0');
    const quantity = Number(document.getElementById('selected-product-quantity-hidden').value || document.getElementById('selected-product-quantity').textContent || '1');
    
    const orderData = {
        productName: rawProductName,
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
    const totalPriceCalc = orderData.price * orderData.quantity;

    // رسالة الواتساب مباشرة
    let message = `*طلب شراء جديد من متجر محمد شوب* 🛒\n\n` +
                  `📦 *المنتج:* ${orderData.productName}\n` +
                  `📏 *المقاس:* ${orderData.size}\n` +
                  `🔢 *الكمية:* ${orderData.quantity}\n` +
                  `💰 *الحساب الإجمالي:* ${totalPriceCalc} ج.م\n` +
                  `💳 *طريقة الدفع:* ${orderData.payment}\n\n` +
                  `👤 *اسم العميل:* ${orderData.name}\n` +
                  `📞 *القم الهاتف:* ${orderData.phone}\n` +
                  `📍 *العنوان:* ${orderData.address}`;

    if (lat && lon) {
        message += `\n🗺️ *موقع العميل:* https://maps.google.com/?q=${lat},${lon}`;
    }

    const myWhatsAppNumber = "201016544975"; 
    const whatsappUrl = `https://wa.me/${myWhatsAppNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    document.getElementById('order-form').reset();
}