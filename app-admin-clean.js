/**
 * LOGIX FASHION - app-admin.js (Supabase Edition)
 * Panel administrativo para gestión de pedidos e inventario.
 */

let supabase = null;
let currentUser = null;
let orders = [];
let inventory = [];
let productOptions = [];

/**
 * Inicializa Supabase y verifica autenticación.
 */
function initSupabase() {
  supabase = getSupabase();
  if (supabase) {
    checkAuth();
  }
}

/**
 * Verifica si el usuario está autenticado y muestra el panel.
 */
async function checkAuth() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (data.session) {
      currentUser = data.session.user;
      showAdminPanel();
    } else {
      showLoginScreen();
    }
  } catch (error) {
    console.error('Error verificando sesión:', error);
    showLoginScreen();
    showToast('Error al verificar sesión. Intenta de nuevo.', 'error');
  }
}

/**
 * Muestra el login y oculta el panel.
 */
function showLoginScreen() {
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('adminPanel').classList.add('hidden');
  document.getElementById('adminUserEmail').classList.add('hidden');
}

/**
 * Muestra el panel y carga datos.
 */
function showAdminPanel() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('adminPanel').classList.remove('hidden');
  document.getElementById('adminUserEmail').textContent = currentUser.email || 'Admin';
  document.getElementById('adminUserEmail').classList.remove('hidden');
  loadDashboard();
}

/**
 * Carga los pedidos e inventario.
 */
async function loadDashboard() {
  try {
    await loadOrders();
    await loadInventory();
    updateKPIs();
  } catch (error) {
    console.error('Error cargando datos:', error);
    showToast('Error al cargar los datos. Intenta de nuevo.', 'error');
  }
}

/**
 * Carga los pedidos de Supabase.
 */
async function loadOrders() {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    orders = data || [];
    renderOrdersTable();
  } catch (error) {
    console.error('Error cargando pedidos:', error);
    showToast('No se pudieron cargar los pedidos.', 'error');
  }
}

/**
 * Carga el inventario de Supabase.
 */
async function loadInventory() {
  try {
    const { data: productos, error: errP } = await supabase
      .from('inventario_productos')
      .select('*');
    if (errP) {
      console.error('Error cargando productos:', errP);
      return;
    }
    const { data: stock, error: errS } = await supabase
      .from('inventario_stock')
      .select('*');
    if (errS) {
      console.error('Error cargando stock:', errS);
      return;
    }
    inventory = productos.map(p => {
      const pData = {
        id: p.id,
        modelId: p.model_id,
        name: p.name,
        category: p.category,
        price: p.price,
        colors: []
      };
      const productStock = stock.filter(s => s.product_id === p.id);
      productStock.forEach(s => {
        const existing = pData.colors.find(c => c.name === s.color_name);
        if (existing) {
          existing.sizes[s.size] = s.quantity;
        } else {
          pData.colors.push({
            name: s.color_name,
            hex: s.color_hex,
            sizes: { [s.size]: s.quantity }
          });
        }
      });
      return pData;
    });
    renderInventoryGrid();
  } catch (error) {
    console.error('Error cargando inventario:', error);
  }
}

/**
 * Actualiza las KPIs del panel.
 */
function updateKPIs() {
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.created_at?.startsWith(today)).length;
  const todaySales = orders.filter(o => o.created_at?.startsWith(today)).reduce((s, o) => s + (o.total || 0), 0);
  const pending = orders.filter(o => o.status === 'Pagado / No enviado').length;
  let lowStock = 0;
  inventory.forEach(p => {
    p.colors.forEach(c => {
      Object.values(c.sizes).forEach(q => {
        if (q <= 4 && q > 0) lowStock++;
      });
    });
  });
  document.getElementById('kpiOrdersToday').textContent = todayOrders;
  document.getElementById('kpiSalesToday').textContent = 'S/ ' + todaySales.toFixed(2);
  document.getElementById('kpiPending').textContent = pending;
  document.getElementById('kpiLowStock').textContent = lowStock;
}