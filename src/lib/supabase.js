// src/lib/supabase.js
const SUPABASE_URL = "https://qsmugonirpveactzseo.supabase.co";
const SUPABASE_KEY = "sb_publishable_TylcZpVwFYGK3VdFl3cE9g_Te8HaguN"; 

// سوبابيز هتهتم بكل الـ Headers أوتوماتيك بدون أي تعديل يدوي منك
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("Supabase Client initialized correctly!");