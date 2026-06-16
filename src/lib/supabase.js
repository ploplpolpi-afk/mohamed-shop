// قراءة مفاتيح سوبابيز من المتصفح أو البيئة المتاحة
const SUPABASE_URL = window.VITE_SUPABASE_URL || "https://qsmugonirpveactzseo.supabase.co";
const SUPABASE_ANON_KEY = window.VITE_SUPABASE_ANON_KEY || "";

// إنشاء الكلاينت وتثبيته على الـ window عشان يكون متاح في كل مكان بالكود
if (typeof window.supabase !== 'undefined') {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ تم تهيئة Supabase Client بنجاح.");
} else {
    console.error("❌ مكتبة Supabase الخارجية لم يتم تحميلها في الـ HTML.");
}