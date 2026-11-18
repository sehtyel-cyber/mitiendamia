/**
 * LOGIX FASHION - Utilidades de seguridad y validación
 */

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function validatePeruvianPhone(phone) {
  const clean = String(phone).replace(/\D/g, '');
  return /^9\d{8}$/.test(clean);
}

function validatePeruvianDni(dni) {
  if (!dni) return true;
  const clean = String(dni).replace(/\D/g, '');
  return /^\d{8}$/.test(clean);
}

function showToast(containerId, msg, type = 'info') {
  const container = document.getElementById(containerId);
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = (type === 'error' ? 'bg-rose-600' : 'bg-slate-900') +
    ' text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl ' +
    'pointer-events-auto transition-all duration-300 translate-y-4 opacity-0';
  toast.textContent = msg;
  container.appendChild(toast);
  requestAnimationFrame(() => { toast.classList.remove('translate-y-4', 'opacity-0'); });
  setTimeout(() => {
    toast.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
