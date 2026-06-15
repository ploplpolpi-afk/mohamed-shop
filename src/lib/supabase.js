// Supabase client setup — uses global Supabase CDN script
// ضع القيم الحقيقية في ملف .env: VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY
const envUrl = (typeof importMeta !== 'undefined' && importMeta.env && importMeta.env.VITE_SUPABASE_URL) ? importMeta.env.VITE_SUPABASE_URL : undefined;
const envKey = (typeof importMeta !== 'undefined' && importMeta.env && importMeta.env.VITE_SUPABASE_ANON_KEY) ? importMeta.env.VITE_SUPABASE_ANON_KEY : undefined;
const supabaseUrl = envUrl || 'https://your-project-id.supabase.co';
const supabaseAnonKey = envKey || '';

const clientCreator = window.supabase && window.supabase.createClient ? window.supabase.createClient : null;
if (!clientCreator) {
    throw new Error('Supabase CDN script لم يتم تحميله أو لا يحتوي على createClient');
}

const supabase = clientCreator(supabaseUrl, supabaseAnonKey);

// Expose a global reference for legacy code that expects `supabaseClient`
if (typeof window !== 'undefined') {
    window.supabaseClient = supabase;
}

async function getProducts() {
	const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
	if (error) throw error;
	return data;
}

export async function addProduct(product) {
	// product: { name, price, description, image_url }
	const { data, error } = await supabase.from('products').insert([product]);
	if (error) throw error;
	return data;
}

export default supabase;

// Orders helpers
// Order shape suggestion:
// {
//   user_id: '<uuid or null>',
//   items: [{ product_id, name, price, quantity }],
//   total: 123.45,
//   status: 'pending',
//   shipping_address: { line1, city, postal_code, country }
// }

export async function createOrder(order) {
	const { data, error } = await supabase.from('orders').insert([order]).select('*');
	if (error) throw error;
	return data?.[0] ?? null;
}

if (typeof window !== 'undefined') {
  window.createOrder = createOrder;
}

export async function getOrders(opts = {}) {
	// opts: { user_id, status }
	let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
	if (opts.user_id) query = query.eq('user_id', opts.user_id);
	if (opts.status) query = query.eq('status', opts.status);
	const { data, error } = await query;
	if (error) throw error;
	return data;
}

export async function getOrderById(id) {
	const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
	if (error) throw error;
	return data;
}

export async function updateOrderStatus(id, status) {
	const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select('*');
	if (error) throw error;
	return data?.[0] ?? null;
}