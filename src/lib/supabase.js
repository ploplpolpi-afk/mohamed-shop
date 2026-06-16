import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://qsmugonirpveactzseo.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// إنشاء الكلاينت الأساسي والوحيد للمتجر
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || "");

if (typeof window !== 'undefined') {
    window.supabaseClient = supabaseClient;
}