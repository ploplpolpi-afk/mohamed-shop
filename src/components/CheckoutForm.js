async function handleOrderSubmit(e) {
    e.preventDefault();
    
    // 1. استخراج القيم من الفورم
    const name = document.getElementById('client-name').value;
    const phone = document.getElementById('client-phone').value;
    const address = document.getElementById('client-address').value;
    const product = document.getElementById('selected-product-name').textContent;
    const size = document.getElementById('size') ? document.getElementById('size').value : "N/A";
    const payment = document.getElementById('payment') ? document.getElementById('payment').value : "Cash";

    const orderData = {
        customer_name: name,
        customer_phone: phone,
        customer_address: address,
        product_name: product,
        size: size,
        payment_method: payment
    };

    console.log("البيانات التي سيتم إرسالها:", orderData);

    // 2. إرسال لـ Supabase
    if (window.supabaseClient) {
        const { data, error } = await window.supabaseClient
            .from('orders')
            .insert([orderData]);

        if (error) {
            console.error("⛔ خطأ Supabase المباشر:", error);
            alert("خطأ في قاعدة البيانات: " + error.message);
        } else {
            console.log("✅ تم الإرسال بنجاح لـ Supabase!");
        }
    } else {
        console.error("❌ window.supabaseClient غير موجود!");
    }

    // 3. واتساب
    // ... (باقي كود الواتساب)


    // إرسال الواتساب
    const message = `طلب جديد: ${orderData.product_name}\nالاسم: ${orderData.customer_name}\nالهاتف: ${orderData.customer_phone}\nالعنوان: ${orderData.customer_address}`;
    window.open(`https://wa.me/201016544975?text=${encodeURIComponent(message)}`, '_blank');
}