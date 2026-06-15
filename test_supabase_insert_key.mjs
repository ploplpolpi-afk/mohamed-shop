import { createClient } from '@supabase/supabase-js';
const url='https://qsmugonirnpveactzseo.supabase.co';
const key='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbXVnb25pcm5wdmVhY3R6c2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NDU1MDUsImV4cCI6MjA5NzAyMTUwNX0.J5-dkl1_dyHnYyoC-NcFcJSMfVFgMREHhayj4Xic4OE';
const supabase = createClient(url,key);
(async () => {
  try {
    const order = {
      user_id: null,
      items: [{ name: 'تيشرت تجريبي', price: 250, quantity: 1 }],
      total: 250,
      status: 'pending',
      shipping_address: { address: 'القاهرة - التجريبي', phone: '01012345678' },
      metadata: { client_name: 'عميل تجريبي', payment_method: 'الدفع عند الاستلام' },
      created_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('orders').insert([order]).select('*');
    console.log('INSERT DATA:', data);
    console.log('INSERT ERROR:', error);
  } catch (err) {
    console.error('CATCH', err);
  }
})();
