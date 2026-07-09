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

async function signInWithSupabase(identifier, password, options = {}) {
    if (!window.supabaseClient) return { success: false, error: 'Supabase client not ready' };
    try {
        const normalizedIdentifier = String(identifier || '').trim().toLowerCase();
        const { data, error } = await window.supabaseClient.from('users').select('*').or(`email.eq.${normalizedIdentifier},phone.eq.${normalizedIdentifier}`).eq('password', password).maybeSingle();
        if (error) throw error;
        if (!data) return { success: false, error: 'Invalid credentials' };
        return { success: true, user: data, session: null, options };
    } catch (err) {
        return { success: false, error: err };
    }
}

async function signUpWithSupabase(identifier, password, options = {}) {
    if (!window.supabaseClient) return { success: false, error: 'Supabase client not ready' };
    try {
        const normalizedIdentifier = String(identifier || '').trim().toLowerCase();
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
        return { success: false, error: err };
    }
}

async function signInWithGoogleSupabase(options = {}) {
    if (!window.supabaseClient) return { success: false, error: 'Supabase client not ready' };
    try {
        const redirectTo = `${window.location.origin}${window.location.pathname}`;
        const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo,
                queryParams: { access_type: 'offline', prompt: 'consent' }
            }
        });
        if (error) throw error;
        return { success: true, redirecting: true, data, options };
    } catch (err) {
        return { success: false, error: err };
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
window.signInWithSupabase = signInWithSupabase;
window.signUpWithSupabase = signUpWithSupabase;
window.signInWithGoogleSupabase = signInWithGoogleSupabase;
window.signOutFromSupabase = signOutFromSupabase;
window.getSupabaseSessionUser = getSupabaseSessionUser;