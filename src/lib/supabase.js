// src/lib/supabase.js
const SUPABASE_URL = "https://qsmugonirpveactzseo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbXVnb25pcm5wdmVhY3R6c2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NDU1MDUsImV4cCI6MjA5NzAyMTUwNX0.J5-dkl1_dyHnYyoC-NcFcJSMfVFgMREHhayj4Xic4OE";

// تهيئة الكلاينت وتخزينه في نافذة المتصفح ليكون متاحاً لكل ملفاتك
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("Supabase Client initialized successfully.");
