/** LOGIX FASHION - Configuración de Supabase (Modo Demo) */
const SUPABASE_URL = '';  // Reemplazar con tu URL real de Supabase
const SUPABASE_ANON_KEY = '';  // Reemplazar con tu anónimo key

let supabaseClient = null;

function isSupabaseConfigured() {
  return false; // Modo demo: nunca se configura con Supabase
}

function initSupabase() {
  if (typeof supabase === 'undefined') {
    console.warn('Supabase CDN no cargado (sin conexión a internet).');
    return null;
  }
  if (!isSupabaseConfigured()) {
    console.warn('Supabase no configurado. Usando modo demo (sin guardar en base de datos).');
    return null;
  }
  if (!supabaseClient) {
    try {
      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
      });
    } catch (err) {
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

window.initSupabase = initSupabase;
window.getSupabase = getSupabase;
window.isSupabaseConfigured = isSupabaseConfigured;
window.getSupabaseInitError = getSupabaseInitError;
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;