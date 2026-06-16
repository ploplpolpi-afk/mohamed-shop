// src/components/CheckoutForm.js

async function handleOrderSubmit(e) {
    e.preventDefault();
    
    // تحديد زر الإرسال وتعطيله فوراً لمنع الضغط المتكرر
    const submitBtn = e.target.querySelector('button[type="submit"]') || document.getElementById('submit-order-btn');
    if (submitBtn) {
        if (submitBtn.disabled) return; // لو الزرار معطل اخرج لمنع التكرار
        submitBtn.disabled = true;
        submitBtn.textContent = "جاري إرسال الطلب...";
    }

    const orderData = {
        customer_name: document.getElementById('client-name').value,
        customer_phone: document.getElementById('client-phone').value,
        customer_address: document.getElementById('client-address').value,
        product_name: document.getElementById('selected-product-name').textContent,
        size: document.getElementById('size').value,
        payment_method: document.getElementById('payment').value
    };

    try {
        if (!window.supabaseClient) {
            throw new Error("Supabase client is not initialized. Check console for details.");
        }

        const { data, error } = await window.supabaseClient
            .from('orders')
            .insert([orderData]);

        if (error) throw error;
        
        console.log("✅ تم حفظ الأوردر بنجاح سطر واحد فقط!");
        alert("تم إرسال طلبك بنجاح!");
        
    } catch (err) {
        console.error("⛔ خطأ أثناء الإرسال:", err);
        alert("خطأ في قاعدة البيانات: " + err.message);
        
        // إعادة تفعيل الزرار في حالة حدوث خطأ حقيقي في الشبكة لإتاحة المحاولة مجدداً
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "تأكيد وإرسال الطلب";
        }
    }
}