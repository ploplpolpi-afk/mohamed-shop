// src/components/CheckoutForm.js

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('فشل تحويل صورة التحويل'));
        reader.readAsDataURL(file);
    });
}

async function handleOrderSubmit(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]') || document.getElementById('submit-order-btn');
    if (submitBtn) {
        if (submitBtn.disabled) return;
        submitBtn.disabled = true;
        submitBtn.textContent = 'جاري إرسال الطلب...';
    }

    const name = document.getElementById('client-name')?.value.trim() || '';
    const phone = document.getElementById('client-phone')?.value.trim() || '';
    const address = document.getElementById('client-address')?.value.trim() || '';
    const paymentMethod = document.getElementById('payment')?.value;
    const transferInput = document.getElementById('transfer-image');
    const transferFile = transferInput?.files?.[0] || null;

    if (!name || !phone || !address) {
        alert('يرجى تعبئة الاسم ورقم الهاتف والعنوان.');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'تأكيد وإرسال الطلب';
        }
        return;
    }

    if (paymentMethod === 'فودافون كاش' && !transferFile) {
        alert('يرجى رفع صورة تحويل فودافون كاش لإكمال الطلب.');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'تأكيد وإرسال الطلب';
        }
        return;
    }

    let transferImageBase64 = null;
    if (transferFile) {
        try {
            transferImageBase64 = await readFileAsBase64(transferFile);
        } catch (readErr) {
            console.error('فشل قراءة صورة التحويل:', readErr);
            alert('حدث خطأ أثناء قراءة صورة التحويل. حاول مرة أخرى.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'تأكيد وإرسال الطلب';
            }
            return;
        }
    }

    const productName = document.getElementById('selected-product-raw-name')?.value || document.getElementById('selected-product-name')?.textContent || '';
    const productPrice = Number(document.getElementById('selected-product-price')?.value || 0);
    const productQty = Number(document.getElementById('selected-product-quantity-hidden')?.value || 1);
    const additionalNotes = document.getElementById('additional-notes')?.value || '';

    const productId = document.getElementById('selected-product-id')?.value || '';
    const stockValue = Number(document.getElementById('selected-product-stock')?.value || 0);
    const sellerName = document.getElementById('selected-product-seller')?.value || 'متجر';
    const lat = document.getElementById('client-lat')?.value || '';
    const lon = document.getElementById('client-lon')?.value || '';

    const product = productId ? (typeof window.getProductById === 'function' ? window.getProductById(productId) : null) : null;
    const availableStock = Number(product?.stock || stockValue || 0);

    if (availableStock < productQty) {
        alert(`لا يوجد مخزون كافي لهذا المنتج حالياً، المخزون المتبقي ${availableStock}`);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'تأكيد وإرسال الطلب';
        }
        return;
    }

    const orderData = {
        items: [{
            id: productId,
            name: productName,
            price: productPrice,
            qty: productQty,
            seller: sellerName
        }],
        total: productPrice * productQty,
        status: 'pending',
        shipping_address: {
            full_name: name,
            phone,
            address,
            lat,
            lon
        },
        metadata: {
            payment_method: paymentMethod,
            vodafone_cash_number: paymentMethod === 'فودافون كاش' ? '01029481893' : null,
            transfer_image: transferImageBase64,
            notes: additionalNotes
        }
    };

    try {
        if (typeof window.decreaseStockAndUpdateBalance === 'function') {
            window.decreaseStockAndUpdateBalance(productId || (product?.id || ''), productQty);
        }
        if (typeof window.persistLocalOrder === 'function') {
            window.persistLocalOrder({
                ...orderData,
                productId: productId || (product?.id || ''),
                sellerName,
                customerName: name,
                customerPhone: phone
            });
        }

        if (typeof window.saveOrderToSupabase === 'function') {
            await window.saveOrderToSupabase({
                ...orderData,
                product_id: productId || (product?.id || ''),
                seller_name: sellerName,
                customer_name: name,
                customer_phone: phone,
                created_at: new Date().toISOString()
            });
        }

        console.log('✅ تم حفظ الأوردر بنجاح', orderData);
        alert('تم إرسال طلبك بنجاح!');

    } catch (err) {
        console.error('⛔ خطأ أثناء الإرسال:', err);

        const isPermissionError = err?.code === '42501' || /row-level security|permission denied|policy/i.test(err?.message || '');
        const friendlyMessage = isPermissionError
            ? 'خطأ في إعدادات قاعدة البيانات: يحتاج جدول orders في Supabase إلى سياسة إدراج مسموحة لجهة anon. راجع ملف الترحيل أو لوحة Supabase.'
            : 'خطأ في قاعدة البيانات: ' + err.message;

        alert(friendlyMessage);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'تأكيد وإرسال الطلب';
        }
    }
}

window.handleOrderSubmit = handleOrderSubmit;
