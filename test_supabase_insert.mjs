import { createClient } from '@supabase/supabase-js';
const url='https://qsmugonirnpveactzseo.supabase.co';
const key='sb_publishable_DHYGyEgv9Cb0RGDwJul1TA_dXe7okiD';
const supabase = createClient(url,key);
(async () => {
  try {
    const { data, error } = await supabase.from('orders').insert([{ product_name: 'test', size: 'M', payment_method: 'cash', client_name: 'Tester', client_phone: '01000000000', client_address: 'Cairo', lat: 30.0, lon: 31.0 }]).select('*');
    console.log('INSERT DATA:', data);
    console.log('INSERT ERROR:', error);
  } catch (err) {
    console.error('CATCH', err);
  }
})();
