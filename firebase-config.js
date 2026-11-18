/**
 * LOGIX FASHION - Configuración de Supabase (Legacy firebase-config.js)
 * Este archivo ya no se usa. La configuración está en supabase-config.js
 * Mantenido para compatibilidad con imports existentes.
 */

// Redirigir a supabase-config si existe
if (typeof initSupabase === 'undefined' && typeof getSupabase === 'undefined') {
  console.warn('firebase-config.js está obsoleto. Usa supabase-config.js en su lugar.');
}

const FIREBASE_CONFIG = {};
function isFirebaseConfigured() { return false; }
function getActiveFirebaseConfig() { return FIREBASE_CONFIG; }
