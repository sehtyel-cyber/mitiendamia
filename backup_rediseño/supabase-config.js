/**
 * LOGIX FASHION - Configuración de Supabase
 * ============================================================================
 * Credenciales configuradas para el proyecto de Supabase.
 * ============================================================================
 */

const SUPABASE_URL = 'https://hlwgkeugzkogagiobdbb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LVqNG43nqDUHyWv2JSIliA_ac3eXl0b';

let supabaseClient = null;
let supabaseInitError = null;

function isSupabaseConfigured() {
  return (
    SUPABASE_URL &&
    SUPABASE_URL.startsWith('https://') &&
    SUPABASE_ANON_KEY &&
    SUPABASE_ANON_KEY.length > 10
  );
}

function initSupabase() {
  if (typeof supabase === 'undefined') {
    supabaseInitError = 'CDN';
    console.warn('Supabase JS client no cargado (CDN bloqueado o sin internet).');
    return null;
  }
  if (!isSupabaseConfigured()) {
    supabaseInitError = 'CREDENTIALES';
    console.warn('Supabase no configurado. Revisa supabase-config.js.');
    return null;
  }
  if (!supabaseClient) {
    try {
      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });
    } catch (err) {
      supabaseInitError = 'INIT';
      console.error('Error creando cliente Supabase:', err);
      return null;
    }
  }
  return supabaseClient;
}

function getSupabase() {
  if (!supabaseClient) return initSupabase();
  return supabaseClient;
}

function getSupabaseInitError() {
  return supabaseInitError;
}

window.initSupabase = initSupabase;
window.getSupabase = getSupabase;
window.isSupabaseConfigured = isSupabaseConfigured;
window.getSupabaseInitError = getSupabaseInitError;
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
