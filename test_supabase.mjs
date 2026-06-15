import { createClient } from '@supabase/supabase-js';
const url='https://qsmugonirnpveactzseo.supabase.co';
const key='sb_publishable_DHYGyEgv9Cb0RGDwJul1TA_dXe7okiD';
const supabase = createClient(url,key);
(async () => {
  try {
    const { data, error } = await supabase.from('orders').select('*').limit(1);
    console.log('DATA:', data);
    console.log('ERROR:', error);
  } catch (err) {
    console.error('CATCH', err);
  }
})();
