import { createClient } from '@supabase/supabase-js';
const url='https://qsmugonirnpveactzseo.supabase.co';
const key='sb_publishable_DHYGyEgv9Cb0RGDwJul1TA_dXe7okiD';
const supabase = createClient(url,key);
(async () => {
  try {
    const { data, error } = await supabase.from('information_schema.columns').select('column_name').eq('table_name','orders');
    console.log('COLUMNS DATA:', data);
    console.log('COLUMNS ERROR:', error);
  } catch (err) {
    console.error('CATCH', err);
  }
})();
