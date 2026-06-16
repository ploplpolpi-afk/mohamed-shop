async function handleOrderSubmit(e) {
    e.preventDefault();
    
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
        
        console.log("✅ تم الحفظ بنجاح!");
        alert("تم إرسال طلبك بنجاح!");
    } catch (err) {
        console.error("⛔ خطأ أثناء الإرسال:", err);
        alert("خطأ في قاعدة البيانات: " + err.message);
    }
}