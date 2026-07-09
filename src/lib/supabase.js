// src/lib/supabase.js

const SUPABASE_URL = "https://qsmugonirnpveactzseo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbXVnb25pcm5wdmVhY3R6c2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NDU1MDUsImV4cCI6MjA5NzAyMTUwNX0.J5-dkl1_dyHnYyoC-NcFcJSMfVFgMREHhayj4Xic4OE";

if (typeof supabase !== 'undefined') {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("Supabase Client initialized correctly!");
} else {
    console.error("Supabase library not loaded. Make sure the Supabase CDN script is included in index.html.");
}

async function syncProductsToSupabase(products) {
    if (!window.supabaseClient || !Array.isArray(products)) return false;
    try {
        const { error } = await window.supabaseClient.from('products').upsert(products.map(product => ({
            id: product.id,
            name: product.name,
            type: product.type,
            material: product.material,
            price: Number(product.price || 0),
            stock: Number(product.stock || 0),
            commission_percent: Number(product.commissionPercent || 10),
            seller_name: product.sellerName || 'متجر',
            category: product.category || 'عام',
            images: product.images || []
        })));
        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Supabase products sync failed:', err);
        return false;
    }
}

async function loadProductsFromSupabase() {
    if (!window.supabaseClient) return [];
    try {
        const { data, error } = await window.supabaseClient.from('products').select('*');
        if (error) throw error;
        return (data || []).map(item => ({
            id: item.id,
            name: item.name,
            type: item.type || 'عام',
            material: item.material || 'غير محدد',
            price: Number(item.price || 0),
            stock: Number(item.stock || 0),
            commissionPercent: Number(item.commission_percent || 10),
            sellerName: item.seller_name || 'متجر',
            category: item.category || 'عام',
            images: Array.isArray(item.images) ? item.images : []
        }));
    } catch (err) {
        console.error('Supabase products load failed:', err);
        return [];
    }
}

async function saveOrderToSupabase(orderData) {
    if (!window.supabaseClient) return false;
    try {
        const payload = {
            items: orderData.items || [],
            total: Number(orderData.total || 0),
            status: orderData.status || 'pending',
            shipping_address: orderData.shipping_address || null,
            metadata: orderData.metadata || null,
            product_name: orderData.items?.[0]?.name || null,
            size: orderData.size || null,
            payment_method: orderData.payment_method || null,
            client_name: orderData.client_name || orderData.shipping_address?.full_name || null,
            client_phone: orderData.client_phone || orderData.shipping_address?.phone || null,
            client_address: orderData.client_address || orderData.shipping_address?.address || null,
            lat: orderData.lat ? Number(orderData.lat) : null,
            lon: orderData.lon ? Number(orderData.lon) : null,
            created_at: new Date().toISOString()
        };
        const { error } = await window.supabaseClient.from('orders').insert([payload]);
        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Supabase order save failed:', err);
        return false;
    }
}

async function findUserByIdentifier(identifier) {
    if (!window.supabaseClient) return null;
    try {
        const normalizedIdentifier = String(identifier || '').trim().toLowerCase();
        const { data, error } = await window.supabaseClient.from('users').select('*').or(`email.eq.${normalizedIdentifier},phone.eq.${normalizedIdentifier}`).maybeSingle();
        if (error) throw error;
        return data || null;
    } catch (err) {
        console.warn('User lookup failed:', err);
        return null;
    }
}

async function updateUserProfile(userId, updates) {
    if (!window.supabaseClient || !userId) return null;
    try {
        const { data, error } = await window.supabaseClient.from('users').update(updates).eq('id', userId).select().single();
        if (error) throw error;
        return data;
    } catch (err) {
        console.warn('Profile update failed:', err);
        return null;
    }
}

async function signInWithSupabase(identifier, password, options = {}) {
    if (!window.supabaseClient) return { success: false, error: 'Supabase client not ready' };
    try {
        const normalizedIdentifier = String(identifier || '').trim().toLowerCase();
        const existing = await findUserByIdentifier(normalizedIdentifier);
        if (!existing) {
            return { success: false, error: 'not_found', message: 'لا يوجد حساب بهذا البريد أو الرقم' };
        }
        if (String(existing.password || '') !== String(password || '')) {
            return { success: false, error: 'invalid_password', message: 'كلمة المرور غير صحيحة' };
        }
        return { success: true, user: existing, session: null, options };
    } catch (err) {
        return { success: false, error: err, message: 'تعذر التحقق من الحساب' };
    }
}

async function signUpWithSupabase(identifier, password, options = {}) {
    if (!window.supabaseClient) return { success: false, error: 'Supabase client not ready' };
    try {
        const normalizedIdentifier = String(identifier || '').trim().toLowerCase();
        const existing = await findUserByIdentifier(normalizedIdentifier);
        if (existing) {
            return { success: false, error: 'already_exists', message: 'الحساب موجود بالفعل. استخدم تسجيل الدخول.' };
        }
        const isEmail = normalizedIdentifier.includes('@');
        const payload = {
            email: isEmail ? normalizedIdentifier : null,
            phone: isEmail ? null : normalizedIdentifier,
            password,
            role: options?.role || 'buyer',
            full_name: options?.full_name || 'مستخدم',
            created_at: new Date().toISOString()
        };
        const { data, error } = await window.supabaseClient.from('users').insert([payload]).select().single();
        if (error) throw error;
        return { success: true, user: data, session: null, options };
    } catch (err) {
        return { success: false, error: err, message: 'تعذر إنشاء الحساب الآن' };
    }
}

async function signInWithGoogleSupabase(options = {}) {
    if (!window.supabaseClient) return { success: false, error: 'Supabase client not ready', message: 'لم يتم تهيئة Supabase بعد' };
    try {
        const redirectTo = window.location.origin;
        const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo,
                flow: 'pkce',
                queryParams: { access_type: 'offline', prompt: 'consent' }
            }
        });
        if (error) throw error;
        return { success: true, redirecting: true, data, options };
    } catch (err) {
        return { success: false, error: err, message: 'تعذر فتح تسجيل الدخول باستخدام Google الآن. استخدم البريد أو الرقم بدلاً من ذلك.' };
    }
}

async function signOutFromSupabase() {
    return true;
}

async function getSupabaseSessionUser() {
    return null;
}

window.syncProductsToSupabase = syncProductsToSupabase;
window.loadProductsFromSupabase = loadProductsFromSupabase;
window.saveOrderToSupabase = saveOrderToSupabase;
window.findUserByIdentifier = findUserByIdentifier;
window.updateUserProfile = updateUserProfile;
window.signInWithSupabase = signInWithSupabase;
window.signUpWithSupabase = signUpWithSupabase;
window.signInWithGoogleSupabase = signInWithGoogleSupabase;
window.signOutFromSupabase = signOutFromSupabase;
window.getSupabaseSessionUser = getSupabaseSessionUser;