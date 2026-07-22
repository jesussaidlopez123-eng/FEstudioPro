const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.from('core_state').upsert({ id: 'singleton', data: { test: 1 } });
  console.log("Upsert Error:", error);
  console.log("Upsert Data:", data);
}
run();
