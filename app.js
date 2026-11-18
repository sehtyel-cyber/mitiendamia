/**
 * LOGIX FASHION - Aplicación Completa (SPA Vanilla)
 * Rutas: / (cliente) y /admin (panel)
 */

// Estado global
let currentUser = null;
let orders = [];
let inventory = [];
let products = [];
let modoDemo = false;
let cart = [];

// ============================================================
// NAVEGACIÓN POR RUTA (window.location.pathname)
// ============================================================
function detectRoute() {
  const path = window.location.pathname;
  const isAdmin = path === '/admin' || path.endsWith('/admin');

  const viewPublic = document.getElementById('view-public');
  const viewAdmin = document.getElementById('view-admin');
  const btnAdminAccess = document.getElementById('btnOpenAdminAccess');

  if (isAdmin) {
    if (viewPublic) viewPublic.classList.add('hidden');
    if (viewAdmin) viewAdmin.classList.remove('hidden');
    if (btnAdminAccess) btnAdminAccess.classList.add('hidden');
    initAdminView();
  } else {
    if (viewPublic) viewPublic.classList.remove('hidden');
    if (viewAdmin) viewAdmin.classList.add('hidden');
    if (btnAdminAccess) btnAdminAccess.classList.remove('hidden');
    initPublicView();
  }
}

function navigateToPublic() {
  window.location.pathname = '/';
}

function navigateToAdmin() {
  window.location.pathname = '/admin';
}

// ============================================================
// AUTENTICACIÓN ADMIN (sessionStorage + Modo Demo)
// ============================================================
function isAdminLoggedIn() {
  return sessionStorage.getItem('logix_admin_token') === 'true';
}

function setAdminLoggedIn(val) {
  if (val) {
    sessionStorage.setItem('logix_admin_token', 'true');
  } else {
    sessionStorage.removeItem('logix_admin_token');
  }
}

async function initAdminView() {
  if (isAdminLoggedIn()) {
    showAdminPanel();
    loadDashboard();
  } else {
    showAdminLogin();
  }
}

function showAdminLogin() {
  const loginScreen = document.getElementById('adminLoginScreen');
  const adminPanel = document.getElementById('adminPanel');
  if (loginScreen) loginScreen.classList.remove('hidden');
  if (adminPanel) adminPanel.classList.add('hidden');
}

function showAdminPanel() {
  const loginScreen = document.getElementById('adminLoginScreen');
  const adminPanel = document.getElementById('adminPanel');
  if (loginScreen) loginScreen.classList.add('hidden');
  if (adminPanel) adminPanel.classList.remove('hidden');
  const emailEl = document.getElementById('adminUserEmail');
  if (emailEl) {
    emailEl.textContent = (currentUser && currentUser.email) || 'Admin (Demo)';
    emailEl.classList.remove('hidden');
  }
}

async function loginAdmin(email, password) {
  const supabase = window.getSupabase ? window.getSupabase() : null;

  // MODO DEMO (si no hay Supabase configurado)
  if (modoDemo || !supabase) {
    if (password === 'admin123') {
      currentUser = { email: email || 'demo@logix.com' };
      setAdminLoggedIn(true);
      showAdminPanel();
      loadDashboard();
      showToast('toastContainer', 'Bienvenido al modo demo.', 'success');
      return;
    } else {
      showToast('authToast', 'Credenciales incorrectas en modo demo (usa admin123).', 'error');
      return;
    }
  }

  // SUPABASE REAL
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    currentUser = data.user;
    setAdminLoggedIn(true);
    showAdminPanel();
    loadDashboard();
  } catch (err) {
    console.error('Login error:', err);
    showToast('authToast', 'Credenciales incorrectas o error de conexión.', 'error');
  }
}

function logoutAdmin() {
  currentUser = null;
  orders = [];
  inventory = [];
  modoDemo = false;
  setAdminLoggedIn(false);
  showAdminLogin();
}

// ============================================================
// UTILIDADES
// ============================================================
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
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
// ============================================================
// VISTA PÚBLICA - CLIENTES
// ============================================================
function initPublicView() {
  detectSupabaseStatus();
  loadProducts();
  setupOrderForm();
  setupAdminAccessButton();
}

function setupAdminAccessButton() {
  const btn = document.getElementById('btnOpenAdminAccess');
  if (btn) {
    btn.addEventListener('click', navigateToAdmin);
  }
}

async function detectSupabaseStatus() {
  const dot = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  const supabase = window.getSupabase ? window.getSupabase() : null;

  if (!supabase) {
    modoDemo = true;
    if (dot) dot.classList.replace('bg-slate-400', 'bg-rose-500');
    if (text) text.textContent = 'Modo demo (Supabase no configurado)';
    return;
  }

  if (!window.isSupabaseConfigured || !window.isSupabaseConfigured()) {
    modoDemo = true;
    if (dot) dot.classList.replace('bg-slate-400', 'bg-rose-500');
    if (text) text.textContent = 'Supabase no configurado (edita supabase-config.js)';
    return;
  }

  try {
    const { error } = await supabase.from('inventario_productos').select('count').limit(1);
    if (error) throw error;
    if (dot) dot.classList.replace('bg-slate-400', 'bg-emerald-500');
    if (text) text.textContent = 'Conectado a Supabase';
  } catch (err) {
    modoDemo = true;
    if (dot) dot.classList.replace('bg-slate-400', 'bg-rose-500');
    if (text) text.textContent = 'Error de conexión a Supabase';
  }
}

function loadProducts() {
  const supabase = window.getSupabase ? window.getSupabase() : null;

  if (supabase && window.isSupabaseConfigured && window.isSupabaseConfigured()) {
    supabase.from('inventario_productos').select('*').then(({ data, error }) => {
      if (error) {
        console.error('Error cargando productos:', error);
        products = getDefaultProducts();
      } else {
        products = data || getDefaultProducts();
      }
      renderProducts();
    });
  } else {
    products = getDefaultProducts();
    renderProducts();
  }
}

function getDefaultProducts() {
  return [
    { id: 'demo-1', name: 'Polera Algodón Orgánico', category: 'Poleras', price: 45.00, colors: [{ name: 'Negro', hex: '#000000', sizes: { S: 10, M: 15, L: 10, XL: 5 } }] },
    { id: 'demo-2', name: 'Jeans Slim Fit', category: 'Pantalones', price: 89.90, colors: [{ name: 'Azul', hex: '#1e3a8a', sizes: { S: 8, M: 12, L: 8, XL: 4 } }] },
    { id: 'demo-3', name: 'Chaqueta Denim', category: 'Chaquetas', price: 120.00, colors: [{ name: 'Clásico', hex: '#3b82f6', sizes: { S: 5, M: 8, L: 6, XL: 3 } }] }
  ];
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  if (!products || products.length === 0) {
    grid.innerHTML = '<p class="text-slate-500 text-center">No hay productos disponibles.</p>';
    return;
  }

  grid.innerHTML = products.map(p => {
    const totalStock = (p.colors || []).reduce((sum, c) => sum + Object.values(c.sizes || {}).reduce((a, b) => a + b, 0), 0);
    const isOut = totalStock <= 0;
    return `
    <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm ${isOut ? 'opacity-50' : ''}">
      <h4 class="font-bold text-slate-900 text-sm mb-2">${escapeHtml(p.name)}</h4>
      <p class="text-xs text-slate-500 mb-3">${escapeHtml(p.category || '')} • S/ ${Number(p.price || 0).toFixed(2)}</p>
      <div class="space-y-2">
        ${(p.colors || []).map(c => `
          <div class="mb-1">
            <div class="flex justify-between text-xs mb-1">
              <span class="font-semibold text-slate-700">${escapeHtml(c.name)}</span>
              <span class="text-xs ${isOut ? 'text-rose-500' : 'text-slate-400'}">${Object.values(c.sizes || {}).reduce((a, b) => a + b, 0)} uds</span>
            </div>
            <div class="grid grid-cols-4 gap-1">
              ${['S', 'M', 'L', 'XL'].map(sz => {
                const qty = c.sizes[sz] || 0;
                const disabled = qty <= 0;
                return `<span class="text-xs px-1.5 py-0.5 rounded border ${disabled ? 'bg-rose-50 text-rose-500 border-rose-200' : 'bg-slate-100 text-slate-600 border-slate-200'} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-emerald-50 hover:text-emerald-600'}" onclick="addToCart('${escapeHtml(p.id)}', '${escapeHtml(c.name)}', '${escapeHtml(sz)}', ${Number(p.price || 0)})">${sz}:${qty}</span>`;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      ${isOut ? '<p class="text-xs text-rose-500 font-bold mt-2">Agotado</p>' : ''}
    </div>`;
  }).join('');
}

function addToCart(productId, colorName, size, price) {
  const existing = cart.find(i => i.productId === productId && i.colorName === colorName && i.size === size);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ productId, colorName, size, price, qty: 1 });
  }
  showToast('toastContainer', `Agregado al carrito: ${size} x1`, 'success');
}

// ============================================================
// FORMULARIO DE PEDIDO PÚBLICO
// ============================================================
function setupOrderForm() {
  const form = document.getElementById('orderForm');
  const destSelect = document.getElementById('destType');
  const provinceFields = document.getElementById('provinceFields');

  if (destSelect && provinceFields) {
    destSelect.addEventListener('change', function () {
      provinceFields.classList.toggle('hidden', this.value !== 'Provincia');
    });
  }

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      await handleOrderSubmit();
    });
  }
}

async function handleOrderSubmit() {
  const btn = document.getElementById('btnSubmitOrder');
  const btnText = document.getElementById('btnSubmitText');

  const nombre = document.getElementById('custName')?.value?.trim() || '';
  const telefono = document.getElementById('custPhone')?.value?.trim() || '';
  const distrito = document.getElementById('custDistrict')?.value?.trim() || '';
  const direccion = document.getElementById('custAddress')?.value?.trim() || '';
  const dni = document.getElementById('custDni')?.value?.trim() || '';
  const department = document.getElementById('custDepartment')?.value?.trim() || '';
  const agency = document.getElementById('custAgency')?.value?.trim() || '';
  const destType = document.getElementById('destType')?.value || 'Lima';

  // Validaciones
  if (!nombre || !telefono || !distrito || !direccion) {
    showToast('toastContainer', 'Por favor completa todos los campos obligatorios.', 'error');
    return;
  }

  const phoneClean = String(telefono).replace(/\D/g, '');
  if (!/^9\d{8}$/.test(phoneClean)) {
    showToast('toastContainer', 'El teléfono debe tener 9 dígitos y comenzar con 9.', 'error');
    return;
  }

  if (dni && !/^\d{8}$/.test(dni)) {
    showToast('toastContainer', 'El DNI debe tener 8 dígitos numéricos.', 'error');
    return;
  }

  if (cart.length === 0) {
    showToast('toastContainer', 'Agrega al menos un producto al carrito.', 'error');
    return;
  }

  // Bloquear botón
  btn.disabled = true;
  btn.innerHTML = '<span class="inline-block animate-spin mr-2">?</span> Procesando...';
  btnText.textContent = 'Procesando...';

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const orderData = {
    order_id: 'PED-' + Date.now().toString().slice(-6),
    customer: {
      name: nombre,
      phone: telefono,
      district: distrito,
      address: direccion,
      dni: dni,
      department: department,
      agency: agency
    },
    items: cart,
    total: total,
    destination_type: destType,
    status: 'Pagado / No enviado',
    created_at: new Date().toISOString()
  };

  try {
    const supabase = window.getSupabase ? window.getSupabase() : null;

    if (supabase && window.isSupabaseConfigured && window.isSupabaseConfigured()) {
      // Guardar pedido
      const { error: orderError } = await supabase.from('pedidos').insert([orderData]);
      if (orderError) throw orderError;

      // Descontar stock automáticamente
      for (const item of cart) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const color = product.colors.find(c => c.name === item.colorName);
          if (color && color.sizes[item.size] !== undefined) {
            const newQty = color.sizes[item.size] - item.qty;
            await supabase.from('inventario_stock')
              .update({ quantity: Math.max(0, newQty) })
              .eq('product_id', product.id)
              .eq('color_name', item.colorName)
              .eq('size', item.size);
          }
        }
      }

      // Recargar productos y pedidos
      loadProducts();
    } else {
      showToast('toastContainer', 'Modo demo: pedido simulado (Supabase no configurado).', 'info');
    }

    showOrderSuccess(orderData);
  } catch (err) {
    console.error('Error guardando pedido:', err);
    showToast('toastContainer', 'Error guardando el pedido. Intenta de nuevo.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="shopping-cart" class="w-4 h-4"></i><span id="btnSubmitText">Confirmar Pedido</span>';
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }
}

function showOrderSuccess(order) {
  const formSection = document.getElementById('orderForm');
  const successSection = document.getElementById('orderSuccess');

  if (formSection) formSection.classList.add('hidden');
  if (successSection) successSection.classList.remove('hidden');

  document.getElementById('successOrderId')?.textContent?.replace && (document.getElementById('successOrderId').textContent = order.order_id);
  document.getElementById('successCustomer')?.textContent?.replace && (document.getElementById('successCustomer').textContent = order.customer.name);
  document.getElementById('successTotalAmount')?.textContent?.replace && (document.getElementById('successTotalAmount').textContent = 'S/ ' + order.total.toFixed(2));

  const waLink = document.getElementById('successWhatsAppLink');
  if (waLink) {
    const msg = encodeURIComponent('Hola LOGIX FASHION, quiero hacer un seguimiento de mi pedido ' + order.order_id + ' - https://mitiendamia.netlify.app');
    waLink.href = 'https://wa.me/?text=' + msg;
  }

  showToast('toastContainer', '¡Pedido realizado con éxito!', 'success');
  cart = [];
}
// ============================================================
// VISTA ADMIN - PANEL
// ============================================================
function loadDashboard() {
  loadOrders();
  loadInventory();
  updateKPIs();
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

// ---- Pedidos ----
async function loadOrders() {
  const supabase = window.getSupabase ? window.getSupabase() : null;

  if (!supabase || modoDemo) {
    orders = [
      { id: 'demo-1', order_id: 'PED-001', customer: { name: 'Juan Pérez', phone: '987654321', district: 'Miraflores', address: 'Av. Larco 123' }, total: 120.00, status: 'Pagado / No enviado', destination_type: 'Lima', created_at: new Date().toISOString(), items: [] },
      { id: 'demo-2', order_id: 'PED-002', customer: { name: 'María García', phone: '912345678', district: 'San Isidro', address: 'Calle Fiscal 456' }, total: 89.90, status: 'Enviado', destination_type: 'Provincia', created_at: new Date().toISOString(), items: [] }
    ];
    renderOrdersTable();
    return;
  }

  const { data, error } = await supabase.from('pedidos').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  orders = data || [];
  renderOrdersTable();
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

async function updateOrderStatus(orderId, newStatus) {
  const supabase = window.getSupabase ? window.getSupabase() : null;

  if (!supabase || modoDemo) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      renderOrdersTable();
      updateKPIs();
      showToast('toastContainer', 'Estado actualizado (demo): ' + newStatus, 'success');
    }
    return;
  }

  const { error } = await supabase.from('pedidos').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', orderId);
  if (error) {
    showToast('toastContainer', 'Error actualizando estado.', 'error');
    return;
  }
  showToast('toastContainer', 'Estado actualizado: ' + newStatus, 'success');
  loadOrders();
  updateKPIs();
}

// ---- Inventario ----
async function loadInventory() {
  const supabase = window.getSupabase ? window.getSupabase() : null;

  if (!supabase || modoDemo) {
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
              <span class="text-slate-400">${Object.values(c.sizes || {}).reduce((a, b) => a + b, 0)} uds</span>
            </div>
            <div class="grid grid-cols-4 gap-1">
              ${['S', 'M', 'L', 'XL'].map(sz => `
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

// ---- Rótulos Térmicos ----
function printThermalLabel(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const c = order.customer || {};
  const itemsHtml = (order.items || []).map(i => '<div style="font-size:10px;">• ' + escapeHtml(i.productId || '') + ' | ' + escapeHtml(i.colorName || '') + ' | Talla ' + escapeHtml(i.size || '') + ' x' + (i.qty || 0) + ' = S/ ' + (Number(i.price || 0) * (i.qty || 0)).toFixed(2) + '</div>').join('');

  const labelContent =
    '<div id="printableThermalLabel" style="width:78mm; font-size:11px; line-height:1.25; padding:3mm 4mm; border:2px dashed #000;">' +
    '<div style="text-align:center; border-bottom:2px dashed #000; padding-bottom:2mm; margin-bottom:2mm;"><div style="font-size:16px; font-weight:bold; letter-spacing:2px;">LOGIX FASHION</div><div style="font-size:8px; color:#555;">Tienda Oficial - Pedidos Perú</div></div>' +
    '<div style="margin-bottom:2mm;"><strong>Pedido:</strong> ' + escapeHtml(order.order_id || '') + '</div>' +
    '<div style="margin-bottom:2mm;"><strong>Cliente:</strong> ' + escapeHtml(c.name || '') + '</div>' +
    '<div style="margin-bottom:2mm;"><strong>Teléfono:</strong> ' + escapeHtml(c.phone || '') + '</div>' +
    '<div style="margin-bottom:2mm;"><strong>Dirección:</strong> ' + escapeHtml(c.address || '') + '</div>' +
    '<div style="margin-bottom:2mm;"><strong>Distrito:</strong> ' + escapeHtml(c.district || '') + '</div>' +
    '<div style="margin-bottom:2mm;"><strong>Destino:</strong> ' + escapeHtml(order.destination_type || '') + '</div>' +
    (c.department ? '<div style="margin-bottom:2mm;"><strong>Provincia:</strong> ' + escapeHtml(c.department) + '</div>' : '') +
    (c.agency ? '<div style="margin-bottom:2mm;"><strong>Agencia:</strong> ' + escapeHtml(c.agency) + '</div>' : '') +
    '<div style="border-top:1px solid #000; padding-top:1mm; margin-bottom:2mm;"><strong>Items:</strong></div>' +
    itemsHtml +
    '<div style="border-top:1px solid #000; padding-top:1mm; margin-bottom:2mm;"><strong>Total:</strong> S/ ' + Number(order.total || 0).toFixed(2) + '</div>' +
    '<div style="margin-top:2mm;"><div class="barcode-stripes"></div><div style="text-align:center; font-size:8px; margin-top:1mm;">' + escapeHtml(order.order_id || '') + '</div></div>' +
    '<div style="text-align:center; font-size:8px; color:#777;">Gracias por tu compra</div></div>';

  const printWin = window.open('', '', 'width=400,height=600');
  printWin.document.write('<html><head><style>@media print{body*{visibility:hidden}#printableThermalLabel,#printableThermalLabel *{visibility:visible}#printableThermalLabel{position:absolute;left:0;top:0;width:78mm;margin:0;padding:3mm 4mm;border:2px dashed #000;font-size:11px;line-height:1.25;background:#fff;color:#000}@page{size:80mm auto;margin:0mm}}</style></head><body onload="window.print();window.close();">' + labelContent + '</body></html>');
  printWin.document.close();
}

// ---- Compartir ----
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
  showToast('toastContainer', 'Enlace copiado al portapapeles.', 'success');
}

function shareWhatsApp() {
  const text = encodeURIComponent('¡Hola! Conoce nuestra tienda LOGIX FASHION. Realiza tus pedidos en línea: https://mitiendamia.netlify.app');
  window.open('https://wa.me/?text=' + text, '_blank');
}

// ---- Login admin form ----
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('adminLoginForm');
  if (form) {
    form.addEventListener('submit', async function (e) {
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
        showToast('authToast', 'Credenciales incorrectas o error de conexión.', 'error');
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

  // Detectar ruta al cargar
  detectRoute();

  // Detectar cambios de ruta (para SPA sin recarga)
  window.addEventListener('popstate', detectRoute);
});
