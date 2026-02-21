
import { getSupabaseClient } from './utils/supabase/client';

export const inspectSchema = async () => {
  const supabase = getSupabaseClient();
  
  const tables = ['posts', 'events', 'products', 'campaigns', 'donations', 'profiles'];
  const results: any = {};

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      results[table] = { error: error.message };
    } else if (data && data.length > 0) {
      results[table] = Object.keys(data[0]);
    } else {
      results[table] = 'Empty table';
    }
  }

  console.log('Schema Inspection:', JSON.stringify(results, null, 2));
};
