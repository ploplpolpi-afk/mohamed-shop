// src/lib/supabase.js

const SUPABASE_URL = "https://qsmugonirnpveactzseo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbXVnb25pcm5wdmVhY3R6c2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NDU1MDUsImV4cCI6MjA5NzAyMTUwNX0.J5-dkl1_dyHnYyoC-NcFcJSMfVFgMREHhayj4Xic4OE";

const ADMIN_ACCOUNTS = [
    { email: 'admin1@mohamed-shop.local', password: 'Admin@2026One', full_name: 'مدير المتجر الأول' },
    { email: 'admin2@mohamed-shop.local', password: 'Admin@2026Two', full_name: 'مدير المتجر الثاني' }
];

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
    const normalizedIdentifier = String(identifier || '').trim().toLowerCase();
    const admin = ADMIN_ACCOUNTS.find(account => account.email === normalizedIdentifier && account.password === String(password || ''));
    if (admin) {
        return { success: true, user: { ...admin, role: 'admin', id: `admin-${ADMIN_ACCOUNTS.indexOf(admin) + 1}` }, session: null, options };
    }
    if (!window.supabaseClient) {
        const localUsers = JSON.parse(localStorage.getItem('mohamed-local-users') || '[]');
        const existing = localUsers.find(user => String(user.email || '').toLowerCase() === normalizedIdentifier || String(user.phone || '').toLowerCase() === normalizedIdentifier);
        if (!existing) return { success: false, error: 'not_found', message: 'البريد أو الباسورد غلط' };
        if (String(existing.password || '') !== String(password || '')) return { success: false, error: 'invalid_password', message: 'البريد أو الباسورد غلط' };
        return { success: true, user: existing, session: null, options };
    }
    try {
        const existing = await findUserByIdentifier(normalizedIdentifier);
        if (!existing) {
            const localUsers = JSON.parse(localStorage.getItem('mohamed-local-users') || '[]');
            const localExisting = localUsers.find(user => String(user.email || '').toLowerCase() === normalizedIdentifier || String(user.phone || '').toLowerCase() === normalizedIdentifier);
            if (!localExisting) return { success: false, error: 'not_found', message: 'البريد أو الباسورد غلط' };
            if (String(localExisting.password || '') !== String(password || '')) return { success: false, error: 'invalid_password', message: 'البريد أو الباسورد غلط' };
            return { success: true, user: localExisting, session: null, options };
        }
        if (String(existing.password || '') !== String(password || '')) {
            return { success: false, error: 'invalid_password', message: 'البريد أو الباسورد غلط' };
        }
        return { success: true, user: existing, session: null, options };
    } catch (err) {
        return { success: false, error: err, message: 'تعذر التحقق من الحساب' };
    }
}

async function signUpWithSupabase(identifier, password, options = {}) {
    const normalizedIdentifier = String(identifier || '').trim().toLowerCase();
    if (!window.supabaseClient) {
        const localUsers = JSON.parse(localStorage.getItem('mohamed-local-users') || '[]');
        const existing = localUsers.find(user => String(user.email || '').toLowerCase() === normalizedIdentifier || String(user.phone || '').toLowerCase() === normalizedIdentifier);
        if (existing) return { success: false, error: 'already_exists', message: 'الحساب موجود بالفعل. استخدم تسجيل الدخول.' };
        const isEmail = normalizedIdentifier.includes('@');
        const record = {
            id: `local-${Date.now()}`,
            email: isEmail ? normalizedIdentifier : null,
            phone: isEmail ? null : normalizedIdentifier,
            password,
            role: options?.role || 'buyer',
            full_name: options?.full_name || 'مستخدم',
            created_at: new Date().toISOString()
        };
        localUsers.push(record);
        localStorage.setItem('mohamed-local-users', JSON.stringify(localUsers));
        return { success: true, user: record, session: null, options };
    }
    try {
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
        const localUsers = JSON.parse(localStorage.getItem('mohamed-local-users') || '[]');
        const existing = localUsers.find(user => String(user.email || '').toLowerCase() === normalizedIdentifier || String(user.phone || '').toLowerCase() === normalizedIdentifier);
        if (existing) return { success: false, error: 'already_exists', message: 'الحساب موجود بالفعل. استخدم تسجيل الدخول.' };
        const isEmail = normalizedIdentifier.includes('@');
        const record = {
            id: `local-${Date.now()}`,
            email: isEmail ? normalizedIdentifier : null,
            phone: isEmail ? null : normalizedIdentifier,
            password,
            role: options?.role || 'buyer',
            full_name: options?.full_name || 'مستخدم',
            created_at: new Date().toISOString()
        };
        localUsers.push(record);
        localStorage.setItem('mohamed-local-users', JSON.stringify(localUsers));
        return { success: true, user: record, session: null, options };
    }
}

async function signOutFromSupabase() {
    if (!window.supabaseClient) return true;
    const { error } = await window.supabaseClient.auth.signOut();
    return !error;
}

async function getSupabaseSessionUser() {
    if (!window.supabaseClient) return null;
    try {
        const { data: { session }, error } = await window.supabaseClient.auth.getSession();
        if (error) throw error;
        return session?.user || null;
    } catch (err) {
        console.warn('Failed to load Supabase session:', err);
        return null;
    }
}

function initializeSupabaseAuthSync() {
    if (!window.supabaseClient || typeof window.supabaseClient.auth?.onAuthStateChange !== 'function') return;

    window.supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            const user = session?.user || null;
            if (user && typeof window.finalizeAuthenticatedUser === 'function') {
                const provider = String(user?.app_metadata?.provider || session?.provider || 'phone').toLowerCase();
                const method = provider === 'facebook' ? 'facebook' : provider === 'google' ? 'google' : 'phone';
                await window.finalizeAuthenticatedUser(user, method, user?.user_metadata?.full_name || user?.email || 'مستخدم', user?.email || user?.phone || '');
            }
        }
    });
}

window.syncProductsToSupabase = syncProductsToSupabase;
window.loadProductsFromSupabase = loadProductsFromSupabase;
window.saveOrderToSupabase = saveOrderToSupabase;
window.findUserByIdentifier = findUserByIdentifier;
window.updateUserProfile = updateUserProfile;
window.signInWithSupabase = signInWithSupabase;
window.signUpWithSupabase = signUpWithSupabase;
window.signOutFromSupabase = signOutFromSupabase;
window.getSupabaseSessionUser = getSupabaseSessionUser;
window.initializeSupabaseAuthSync = initializeSupabaseAuthSync;