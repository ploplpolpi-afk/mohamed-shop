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
        const { error } = await window.supabaseClient.from('orders').insert([orderData]);
        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Supabase order save failed:', err);
        return false;
    }
}

window.syncProductsToSupabase = syncProductsToSupabase;
window.loadProductsFromSupabase = loadProductsFromSupabase;
window.saveOrderToSupabase = saveOrderToSupabase;