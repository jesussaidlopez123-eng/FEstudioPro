/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
// @ts-ignore
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

export const supabase = supabaseUrl && serviceKey 
  ? createClient(supabaseUrl, serviceKey)
  : null;

if (!supabase) {
  console.warn("⚠️ Faltan las variables de entorno de Supabase. VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.");
}

