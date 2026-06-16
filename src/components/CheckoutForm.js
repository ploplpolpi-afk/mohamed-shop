async function handleOrderSubmit(e) {
    e.preventDefault();
    
    // 1. استخراج البيانات من الفورم
    const orderData = {
        productName: document.getElementById('selected-product-raw-name').value || document.getElementById('selected-product-name').textContent,
        price: Number(document.getElementById('selected-product-price').value || '0'),
        quantity: Number(document.getElementById('selected-product-quantity-hidden').value || '1'),
        size: document.getElementById('size').value,
        payment: document.getElementById('payment').value,
        name: document.getElementById('client-name').value,
        phone: document.getElementById('client-phone').value,
        address: document.getElementById('client-address').value,
        lat: document.getElementById('client-lat').value || null,
        lon: document.getElementById('client-lon').value || null
    };

    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.textContent = "جاري الحفظ والإرسال...";
    submitBtn.disabled = true;

    // 2. المحاولة لرفع البيانات على Supabase
    try {
        if (window.supabaseClient) {
            const { data, error } = await window.supabaseClient
                .from('orders')
                .insert([{
                    customer_name: orderData.name,
                    customer_phone: orderData.phone,
                    customer_address: orderData.address,
                    product_name: orderData.productName,
                    price: orderData.price,
                    quantity: orderData.quantity,
                    size: orderData.size,
                    payment_method: orderData.payment,
                    status: 'قيد المراجعة'
                }]);
            
            if (error) throw error;
            console.log("تم الحفظ في Supabase بنجاح");
        }
    } catch (err) {
        console.error("خطأ في حفظ Supabase:", err);
        // بنكمل عادي حتى لو فشل الحفظ، عشان الزبون ميضيعش
    }

    // 3. تجهيز رسالة الواتساب
    let message = `*طلب جديد* 🛒\n\nالمنتج: ${orderData.productName}\nالسعر: ${orderData.price * orderData.quantity} ج.م\nالاسم: ${orderData.name}\nالهاتف: ${orderData.phone}\nالعنوان: ${orderData.address}`;
    
    if (orderData.lat && orderData.lon) {
        message += `\nالموقع: https://www.google.com/maps?q=${orderData.lat},${orderData.lon}`;
    }

    const whatsappUrl = `https://wa.me/201016544975?text=${encodeURIComponent(message)}`;
    
    // 4. فتح الواتسابs
    window.open(whatsappUrl, '_blank');
    
    submitBtn.textContent = "تم إرسال الطلب!";
    document.getElementById('order-form').reset();
}