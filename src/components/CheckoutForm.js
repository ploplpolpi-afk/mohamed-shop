async function handleOrderSubmit(e) {
    e.preventDefault();
    
    // 1. جمع البيانات
    const data = { /* ... بيانات العميل ... */ };

    // 2. إرسال لـ Supabase (محاولة)
    if (window.supabaseClient) {
        try {
            await window.supabaseClient.from('orders').insert([data]);
            console.log("تم الحفظ في قاعدة البيانات");
        } catch (err) {
            console.error("خطأ Supabase:", err);
        }
    }

    // 3. إرسال واتساب (لازم يشتغل)
    const url = `https://wa.me/201016544975?text=${encodeURIComponent("طلب جديد...")}`;
    window.open(url, '_blank');
}