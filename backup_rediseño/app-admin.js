/**
 * LOGIX FASHION - Panel Administrativo (app-admin.js)
 * ============================================================================
 * MODO DEMO: Si Supabase no está configurado, entra con:
 *   Correo: cualquier correo (ej: admin@logix.com)
 *   Contraseña: admin123
 * ============================================================================
 */

let currentUser = null;
let orders = [];
let inventory = [];
let modoDemo = false;

document.addEventListener('DOMContentLoaded', function() {
  initAdmin();
});

function initAdmin() {
  const sb = getClient();

  if (sb) {
    checkAuth();
  } else {
    modoDemo = true;
    showLoginScreen();
    showToastAdmin('toastContainer', 'Modo demo activado. Usa admin123 para entrar.', 'info');
  }
}

function getClient() {
  if (typeof window.getSupabase === 'function') {
    return window.getSupabase();
  }
  modoDemo = true;
  return null;
}

function mostrarErrorSupabase(tipo) {
  const msg = tipo === 'CDN'
    ? 'Supabase no cargó: Tracking Prevention o sin internet.'
    : tipo === 'CREDENTIALES'
      ? 'Supabase no configurado: edita supabase-config.js con tus credenciales reales.'
      : 'Error inicializando Supabase. Revisa la consola (F12).';

  const login = document.getElementById('loginScreen');
  if (login) {
    login.classList.remove('hidden');
    const aviso = login.querySelector('.supabase-error-aviso');
    if (aviso) aviso.remove();
    const div = document.createElement('div');
    div.className = 'supabase-error-aviso mt-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs text-center';
    div.textContent = '? ' + msg;
    login.appendChild(div);
  }
}

function checkAuth() {
  const supabase = getClient();
  if (!supabase) { showLoginScreen(); return; }

  supabase.auth.getSession().then(({ data, error }) => {
    if (error) { showLoginScreen(); return; }
    if (data.session) {
      currentUser = data.session.user;
      showAdminPanel();
    } else {
      showLoginScreen();
    }
  }).catch(() => showLoginScreen());
}

function showLoginScreen() {
  const el = document.getElementById('loginScreen');
  const panel = document.getElementById('adminPanel');
  const emailEl = document.getElementById('adminUserEmail');
  if (el) el.classList.remove('hidden');
  if (panel) panel.classList.add('hidden');
  if (emailEl) emailEl.classList.add('hidden');
}

function showAdminPanel() {
  const el = document.getElementById('loginScreen');
  const panel = document.getElementById('adminPanel');
  const emailEl = document.getElementById('adminUserEmail');
  if (el) el.classList.add('hidden');
  if (panel) panel.classList.remove('hidden');
  if (emailEl) {
    emailEl.textContent = (currentUser && currentUser.email) || 'Admin (Demo)';
    emailEl.classList.remove('hidden');
  }
  loadDashboard();
}

async function loginAdmin(email, password) {
  const supabase = getClient();

  if (modoDemo || !supabase) {
    if (password === 'admin123') {
      currentUser = { email: email || 'demo@logix.com' };
      showAdminPanel();
      showToastAdmin('toastContainer', 'Bienvenido al modo demo.', 'success');
      return;
    } else {
      showToastAdmin('authToast', 'Credenciales incorrectas en modo demo (usa admin123).', 'error');
      return;
    }
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  currentUser = data.user;
  showAdminPanel();
}

async function logoutAdmin() {
  const supabase = getClient();
  if (supabase) {
    try { await supabase.auth.signOut(); } catch (e) { console.error(e); }
  }
  currentUser = null;
  orders = [];
  inventory = [];
  modoDemo = false;
  showLoginScreen();
}

async function loadDashboard() {
  try {
    await loadOrders();
    await loadInventory();
    updateKPIs();
  } catch (error) {
    console.error('Error cargando datos:', error);
    showToastAdmin('toastContainer', 'Error al cargar datos.', 'error');
  }
}
async function loadOrders() {
  const supabase = getClient();
  if (!supabase) {
    orders = [
      { id: 'demo-1', order_id: 'PED-001', customer: { name: 'Juan Pérez', phone: '987654321', district: 'Miraflores', address: 'Av. Larco 123' }, total: 120.00, status: 'Pagado / No enviado', created_at: new Date().toISOString(), items: [] },
      { id: 'demo-2', order_id: 'PED-002', customer: { name: 'María García', phone: '912345678', district: 'San Isidro', address: 'Calle Fiscal 456' }, total: 89.90, status: 'Enviado', created_at: new Date().toISOString(), items: [] }
    ];
    renderOrdersTable();
    return;
  }

  const { data, error } = await supabase.from('pedidos').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  orders = data || [];
  renderOrdersTable();
}

async function loadInventory() {
  const supabase = getClient();
  if (!supabase) {
    inventory = [
      { id: 'demo-p1', name: 'Polera Algodón', category: 'Poleras', price: 45.00, colors: [{ name: 'Negro', hex: '#000000', sizes: { S: 10, M: 15, L: 8 } }] },
      { id: 'demo-p2', name: 'Jeans Slim', category: 'Pantalones', price: 89.90, colors: [{ name: 'Azul', hex: '#1e3a8a', sizes: { S: 5, M: 10, L: 7 } }] }
    ];
    renderInventoryGrid();
    return;
  }

  const { data: productos } = await supabase.from('inventario_productos').select('*');
  const { data: stock } = await supabase.from('inventario_stock').select('*');

  inventory = (productos || []).map(p => {
    const pData = { id: p.id, name: p.name, category: p.category, price: p.price, colors: [] };
    (stock || []).filter(s => s.product_id === p.id).forEach(s => {
      const existing = pData.colors.find(c => c.name === s.color_name);
      if (existing) {
        existing.sizes[s.size] = s.quantity;
      } else {
        pData.colors.push({ name: s.color_name, hex: s.color_hex, sizes: { [s.size]: s.quantity } });
      }
    });
    return pData;
  });
  renderInventoryGrid();
}

function updateKPIs() {
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.created_at?.startsWith(today)).length;
  const todaySales = orders.filter(o => o.created_at?.startsWith(today)).reduce((s, o) => s + (o.total || 0), 0);
  const pending = orders.filter(o => o.status === 'Pagado / No enviado').length;
  let lowStock = 0;
  inventory.forEach(p => {
    p.colors.forEach(c => {
      Object.values(c.sizes || {}).forEach(q => { if (q <= 4 && q > 0) lowStock++; });
    });
  });

  setText('kpiOrdersToday', todayOrders);
  setText('kpiSalesToday', 'S/ ' + todaySales.toFixed(2));
  setText('kpiPending', pending);
  setText('kpiLowStock', lowStock);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function renderOrdersTable() {
  const tbody = document.getElementById('ordersTableBody');
  const empty = document.getElementById('ordersEmpty');
  if (!tbody) return;

  const search = (document.getElementById('orderSearch')?.value || '').toLowerCase();
  const statusFilter = (document.getElementById('statusFilter')?.value || 'ALL');

  const filtered = orders.filter(o => {
    const c = o.customer || {};
    const m = (c.name || '').toLowerCase().includes(search)
      || (o.id || '').toLowerCase().includes(search)
      || (c.phone || '').includes(search)
      || (c.district || '').toLowerCase().includes(search);
    const st = statusFilter === 'ALL' || o.status === statusFilter;
    return m && st;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    if (empty) empty.classList.remove('hidden');
    return;
  }
  if (empty) empty.classList.add('hidden');

  tbody.innerHTML = filtered.map(o => {
    const c = o.customer || {};
    return `
    <tr class="border-b border-slate-100 hover:bg-slate-50 transition">
      <td class="px-4 py-3 text-xs font-bold text-slate-700 font-mono">#${escapeHtml(o.order_id || '')}</td>
      <td class="px-4 py-3 text-xs text-slate-700">${escapeHtml(c.name || '')}</td>
      <td class="px-4 py-3 text-xs text-slate-600 font-mono">${escapeHtml(c.phone || '')}</td>
      <td class="px-4 py-3 text-xs text-slate-600">${escapeHtml(c.district || '')} (${escapeHtml(o.destination_type || '')})</td>
      <td class="px-4 py-3 text-xs font-bold text-right text-emerald-600">S/ ${Number(o.total || 0).toFixed(2)}</td>
      <td class="px-4 py-3 text-xs"><select class="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-emerald-500" onchange="updateOrderStatus('${escapeHtml(o.id || '')}', this.value)">
        <option value="Pagado / No enviado" ${o.status === 'Pagado / No enviado' ? 'selected' : ''}>Pagado / No enviado</option>
        <option value="Enviado" ${o.status === 'Enviado' ? 'selected' : ''}>Enviado</option>
        <option value="Entregado" ${o.status === 'Entregado' ? 'selected' : ''}>Entregado</option>
        <option value="Pendiente Pago" ${o.status === 'Pendiente Pago' ? 'selected' : ''}>Pendiente Pago</option>
      </select></td>
      <td class="px-4 py-3 text-right"><button onclick="printThermalLabel('${escapeHtml(o.id || '')}')" class="text-xs text-slate-400 hover:text-emerald-600"><i data-lucide="printer" class="w-3 h-3"></i></button></td>
    </tr>`;
  }).join('');

  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

function renderInventoryGrid() {
  const grid = document.getElementById('inventoryGrid');
  const empty = document.getElementById('inventoryEmpty');
  if (!grid) return;

  if (!inventory || inventory.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.classList.remove('hidden');
    return;
  }
  if (empty) empty.classList.add('hidden');

  grid.innerHTML = inventory.map(p => `
    <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <h4 class="font-bold text-slate-900 text-sm mb-2">${escapeHtml(p.name || '')}</h4>
      <p class="text-xs text-slate-500 mb-3">${escapeHtml(p.category || '')} • S/ ${Number(p.price || 0).toFixed(2)}</p>
      <div class="space-y-2">
        ${(p.colors || []).map(c => `
          <div class="mb-1">
            <div class="flex justify-between text-xs mb-1">
              <span class="font-semibold text-slate-700">${escapeHtml(c.name || '')}</span>
              <span class="text-slate-400">${Object.values(c.sizes || {}).reduce((a,b) => a+b, 0)} uds</span>
            </div>
            <div class="grid grid-cols-4 gap-1">
              ${['S','M','L','XL'].map(sz => `
                <span class="text-xs px-1.5 py-0.5 rounded ${(c.sizes[sz] || 0) <= 0 ? 'bg-rose-50 text-rose-500 border border-rose-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}">
                  ${sz}:${c.sizes[sz] || 0}
                </span>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function switchView(view) {
  const vo = document.getElementById('view-orders');
  const vi = document.getElementById('view-inventory');
  const to = document.getElementById('tabOrders');
  const ti = document.getElementById('tabInventory');

  if (vo) vo.classList.add('hidden');
  if (vi) vi.classList.add('hidden');
  if (to) to.className = 'px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 border-b-2 border-transparent';
  if (ti) ti.className = 'px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 border-b-2 border-transparent';

  if (view === 'orders') {
    if (vo) vo.classList.remove('hidden');
    if (to) to.className = 'px-4 py-2 text-sm font-bold border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50';
  } else {
    if (vi) vi.classList.remove('hidden');
    if (ti) ti.className = 'px-4 py-2 text-sm font-bold border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50';
  }
}
async function updateOrderStatus(orderId, newStatus) {
  const supabase = getClient();
  if (!supabase) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      renderOrdersTable();
      updateKPIs();
      showToastAdmin('toastContainer', 'Estado actualizado (demo): ' + newStatus, 'success');
    }
    return;
  }

  const { error } = await supabase.from('pedidos').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', orderId);
  if (error) {
    showToastAdmin('toastContainer', 'Error actualizando estado.', 'error');
    return;
  }
  showToastAdmin('toastContainer', 'Estado actualizado: ' + newStatus, 'success');
  loadOrders();
  updateKPIs();
}

function printThermalLabel(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const c = order.customer || {};
  const itemsHtml = (order.items || []).map(i => '<div style="font-size:10px;">• ' + escapeHtml(i.modelName || '') + ' | ' + escapeHtml(i.colorName || '') + ' | Talla ' + escapeHtml(i.size || '') + ' x' + (i.qty || 0) + ' = S/ ' + (Number(i.price || 0) * (i.qty || 0)).toFixed(2) + '</div>').join('');

  const labelContent =
    '<div id="printableThermalLabel" style="width:78mm; font-size:11px; line-height:1.25; padding:3mm 4mm; border:2px dashed #000;">' +
    '<div style="text-align:center; border-bottom:2px dashed #000; padding-bottom:2mm; margin-bottom:2mm;"><div style="font-size:16px; font-weight:bold; letter-spacing:2px;">LOGIX FASHION</div><div style="font-size:8px; color:#555;">Tienda Oficial - Pedidos Perú</div></div>' +
    '<div style="margin-bottom:2mm;"><strong>Pedido:</strong> ' + escapeHtml(order.order_id || '') + '</div>' +
    '<div style="margin-bottom:2mm;"><strong>Cliente:</strong> ' + escapeHtml(c.name || '') + '</div>' +
    '<div style="margin-bottom:2mm;"><strong>Teléfono:</strong> ' + escapeHtml(c.phone || '') + '</div>' +
    '<div style="margin-bottom:2mm;"><strong>Dirección:</strong> ' + escapeHtml(c.address || '') + '</div>' +
    '<div style="margin-bottom:2mm;"><strong>Distrito:</strong> ' + escapeHtml(c.district || '') + '</div>' +
    '<div style="margin-bottom:2mm;"><strong>Destino:</strong> ' + escapeHtml(order.destination_type || '') + '</div>' +
    '<div style="border-top:1px solid #000; padding-top:1mm; margin-bottom:2mm;"><strong>Items:</strong></div>' +
    itemsHtml +
    '<div style="border-top:1px solid #000; padding-top:1mm; margin-bottom:2mm;"><strong>Total:</strong> S/ ' + Number(order.total || 0).toFixed(2) + '</div>' +
    '<div style="margin-top:2mm;"><div class="barcode-stripes"></div><div style="text-align:center; font-size:8px; margin-top:1mm;">' + escapeHtml(order.order_id || '') + '</div></div>' +
    '<div style="text-align:center; font-size:8px; color:#777;">Gracias por tu compra</div></div>';

  const printWin = window.open('', '', 'width=400,height=600');
  printWin.document.write('<html><head><style>@media print{body*{visibility:hidden}#printableThermalLabel,#printableThermalLabel *{visibility:visible}#printableThermalLabel{position:absolute;left:0;top:0;width:78mm;margin:0;padding:3mm 4mm;border:2px dashed #000;font-size:11px;line-height:1.25;background:#fff;color:#000}@page{size:80mm auto;margin:0mm}}</style></head><body onload="window.print();window.close();">' + labelContent + '</body></html>');
  printWin.document.close();
}

function copyStoreLink() {
  const link = 'https://mitiendamia.netlify.app';
  navigator.clipboard.writeText(link).then(() => {
    const btn = document.querySelector('button[onclick="copyStoreLink()"]');
    const original = btn ? btn.innerHTML : '';
    if (btn) {
      btn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i><span>¡Enlace copiado!</span>';
      btn.classList.replace('bg-slate-50', 'bg-emerald-500');
      btn.classList.replace('text-slate-700', 'text-white');
    }
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
    setTimeout(() => {
      if (btn) {
        btn.innerHTML = original;
        btn.classList.replace('bg-emerald-500', 'bg-slate-50');
        btn.classList.replace('text-white', 'text-slate-700');
      }
      if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
    }, 2000);
  });
  showToastAdmin('toastContainer', 'Enlace copiado al portapapeles.', 'success');
}

function shareWhatsApp() {
  const text = encodeURIComponent('¡Hola! Conoce nuestra tienda LOGIX FASHION. Realiza tus pedidos en línea: https://mitiendamia.netlify.app');
  window.open('https://wa.me/?text=' + text, '_blank');
}

function showToastAdmin(containerId, msg, type = 'info') {
  const container = document.getElementById(containerId);
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = (type === 'error' ? 'bg-rose-600' : 'bg-slate-900') +
    ' text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl pointer-events-auto transition-all duration-300 translate-y-4 opacity-0';
  toast.textContent = msg;
  container.appendChild(toast);
  requestAnimationFrame(() => { toast.classList.remove('translate-y-4', 'opacity-0'); });
  setTimeout(() => {
    toast.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function openInventoryModal() {
  const nombre = prompt('Nombre del producto a agregar al inventario:');
  if (!nombre) return;
  const supabase = window.getSupabase ? window.getSupabase() : null;
  if (!supabase) {
    showToastAdmin('toastContainer', 'Modo demo: producto simulado (no se guarda en Supabase).', 'info');
    return;
  }
  supabase.from('inventario_productos').insert([{ name: nombre, category: 'General', price: 0 }])
    .then(() => { showToastAdmin('toastContainer', 'Producto agregado. Recarga para ver cambios.', 'success'); loadInventory(); })
    .catch(err => { console.error(err); showToastAdmin('toastContainer', 'Error agregando producto.', 'error'); });
}

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('adminLoginForm');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const btn = document.getElementById('btnAdminLogin');
      const original = btn ? btn.innerHTML : '';
      if (btn) {
        btn.innerHTML = '<span class="inline-block animate-spin mr-2">?</span> Ingresando...';
        btn.disabled = true;
      }
      try {
        const email = document.getElementById('adminEmail')?.value || '';
        const password = document.getElementById('adminPassword')?.value || '';
        await loginAdmin(email, password);
      } catch (err) {
        console.error('Login error:', err);
        const toast = document.getElementById('authToast');
        if (toast) {
          toast.textContent = 'Credenciales incorrectas o error de conexión';
          toast.classList.remove('hidden');
          setTimeout(() => toast.classList.add('hidden'), 4000);
        }
      } finally {
        if (btn) {
          btn.innerHTML = original;
          btn.disabled = false;
        }
      }
    });
  }

  const search = document.getElementById('orderSearch');
  if (search) search.addEventListener('input', renderOrdersTable);

  const filter = document.getElementById('statusFilter');
  if (filter) filter.addEventListener('change', renderOrdersTable);
});
