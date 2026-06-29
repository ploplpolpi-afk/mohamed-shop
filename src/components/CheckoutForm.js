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

    const orderData = {
        items: [{
            name: productName,
            price: productPrice,
            qty: productQty
        }],
        total: productPrice * productQty,
        status: 'pending',
        shipping_address: {
            full_name: name,
            phone,
            address
        },
        metadata: {
            payment_method: paymentMethod,
            vodafone_cash_number: paymentMethod === 'فودافون كاش' ? '01029481893' : null,
            transfer_image: transferImageBase64,
            notes: additionalNotes
        }
    };

    try {
        if (!window.supabaseClient) {
            throw new Error('Supabase client is not initialized.');
        }

        const { data, error } = await window.supabaseClient
            .from('orders')
            .insert([orderData]);

        if (error) throw error;

        console.log('✅ تم حفظ الأوردر بنجاح', data);
        alert('تم إرسال طلبك بنجاح!');

    } catch (err) {
        console.error('⛔ خطأ أثناء الإرسال:', err);
        alert('خطأ في قاعدة البيانات: ' + err.message);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'تأكيد وإرسال الطلب';
        }
    }
}
