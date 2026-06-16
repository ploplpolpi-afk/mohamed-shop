// src/lib/supabase.js
const SUPABASE_URL = "https://qsmugonirpveactzseo.supabase.co"; // تأكد من الرابط
const SUPABASE_ANON_KEY = "sb_publishable_TylcZpVwFYGK3VdFl3cE9g_Te8HaguN"; 

// التحقق من وجود المكتبة قبل البدء
if (window.supabase) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Supabase initialized successfully");
} else {
    console.error("❌ Supabase library not found!");
}