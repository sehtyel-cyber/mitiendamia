/* MITIENDAMIA - Lógica admin */
let orders = [];
let inventory = [];
let currentFilter = 'todos';
let demoOrders = [
  { id: 1, nombre: 'Carlos Mendoza', celular: '987654321', zona: 'lima', distrito: 'Miraflores', direccion: 'Av. Larco 123, dpto 405', referencia: 'Frente al parque', productos: [{producto:'Hoodie Street',color:'Negro',talla:'M'}], estado: 'pendiente', enviado: false, creado_en: new Date().toISOString() },
  { id: 2, nombre: 'Lucía Fernández', celular: '912345678', zona: 'provincia', provincia: 'Arequipa', agenciaShalom: 'Shalom Arequipa Centro', productos: [{producto:'Cargo Pant',color:'Verde Oliva',talla:'L'}], estado: 'pendiente', enviado: false, creado_en: new Date().toISOString() },
  { id: 3, nombre: 'Andrés Rojas', celular: '998877665', zona: 'lima', distrito: 'San Isidro', direccion: 'Av. Paz Soldán 456', referencia: '', productos: [{producto:'Tee Logo',color:'Blanco',talla:'S'},{producto:'Jacket Windbreaker',color:'Azul',talla:'L'}], estado: 'registrado', enviado: true, creado_en: new Date().toISOString() }
];
let demoInventory = [
  { id: 1, prenda: 'Hoodie Street', color: 'Negro', talla: 'M', stock: 12, precio: 89 },
  { id: 2, prenda: 'Hoodie Street', color: 'Blanco', talla: 'L', stock: 3, precio: 89 },
  { id: 3, prenda: 'Cargo Pant', color: 'Verde Oliva', talla: 'S', stock: 0, precio: 129 },
  { id: 4, prenda: 'Tee Logo', color: 'Rojo', talla: 'M', stock: 25, precio: 49 },
];
function initAdmin() {
  const supabase = window.getSupabase ? window.getSupabase() : null;
  if (!supabase) {
    orders = [...demoOrders];
    inventory = [...demoInventory];
    renderPedidos();
    renderInventario();
    renderVentas();
    showToastAdmin('Modo demo activo. Conectá Supabase para datos reales.', 'info');
  } else {
    cargarDesdeSupabase();
  }
  lucide.createIcons();
}
function cargarDesdeSupabase() {
  const supabase = window.getSupabase();
  supabase.from('pedidos').select('*').order('creado_en', { ascending: false }).then(({ data, error }) => {
    if (!error && data) orders = data;
    renderPedidos();
    renderVentas();
  });
  supabase.from('inventario').select('*').then(({ data, error }) => {
    if (!error && data) inventory = data;
    renderInventario();
  });
}
function showTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  ['pedidos','inventario','ventas','mapa'].forEach(t => {
    document.getElementById('view-' + t).classList.toggle('hidden', t !== tab);
  });
  document.getElementById('toolbarPedidos').classList.toggle('hidden', tab !== 'pedidos');
  if (tab === 'pedidos') renderPedidos();
  if (tab === 'inventario') renderInventario();
  if (tab === 'ventas') renderVentas();
}
function setFilter(filtro, btn) {
  currentFilter = filtro;
  document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderPedidos();
}
function renderPedidos() {
  const grid = document.getElementById('ordersGrid');
  const empty = document.getElementById('ordersEmpty');
  const search = document.getElementById('orderSearch').value.toLowerCase();
  const date = document.getElementById('dateFilter').value;
  let lista = orders.filter(o => {
    const matchFilter = currentFilter === 'todos' ||
      (currentFilter === 'lima' && o.zona === 'lima') ||
      (currentFilter === 'provincia' && o.zona === 'provincia') ||
      (currentFilter === 'pendientes' && o.estado === 'pendiente' && !o.enviado) ||
      (currentFilter === 'enviados' && o.enviado);
    const matchSearch = !search || o.nombre.toLowerCase().includes(search) || o.celular.includes(search) || (o.dni && o.dni.includes(search));
    const matchDate = !date || o.creado_en.startsWith(date);
    return matchFilter && matchSearch && matchDate;
  });
  grid.innerHTML = '';
  if (lista.length === 0) { grid.classList.add('hidden'); empty.classList.remove('hidden'); return; }
  grid.classList.remove('hidden'); empty.classList.add('hidden');
  lista.forEach(o => {
    const zonaBadge = o.zona === 'lima' ? 'order-badge lima' : 'order-badge provincia';
    const zonaText = o.zona === 'lima' ? 'LIMA' : 'PROVINCIA';
    const destino = o.zona === 'lima' ? (o.distrito || '') : (o.agenciaShalom || '');
    const itemsHtml = o.productos.map(p => p.producto + ' ' + p.color + ' ' + p.talla).join(', ');
    const registrado = o.estado === 'registrado';
    const enviado = o.enviado;
    const card = `
      <div class="order-card ${enviado?'sent':''} fade-in">
        <span class="${zonaBadge}">${zonaText}</span>
        <h4>${escapeHtml(o.nombre)}</h4>
        <p><i data-lucide="phone" class="w-3 h-3 inline mr-1"></i>${o.celular}</p>
        <p><i data-lucide="map-pin" class="w-3 h-3 inline mr-1"></i>${escapeHtml(destino)}</p>
        <p><i data-lucide="tag" class="w-3 h-3 inline mr-1"></i>${escapeHtml(itemsHtml)}</p>
        <div class="order-actions">
          <div class="row">
            <button class="btn-rotulo" onclick="openPrintModal(${o.id})"><i data-lucide="printer" class="w-3 h-3"></i> RÓTULO</button>
            <button class="btn-registrar ${registrado?'registrado':''}" onclick="toggleRegistrar(${o.id})">${registrado ? '✓ REGISTRADO' : 'REGISTRAR'}</button>
          </div>
          <div class="switch-enviado" onclick="toggleEnviado(${o.id}, this)">
            <input type="checkbox" ${enviado?'checked':''} onchange="event.stopPropagation(); toggleEnviado(${o.id}, this)">
            <span>${enviado ? 'ENVIADO' : 'MARCAR ENVIADO'}</span>
          </div>
        </div>
      </div>`;
    grid.innerHTML += card;
  });
  lucide.createIcons();
}
function toggleRegistrar(id) {
  const o = orders.find(x => x.id === id);
  if (!o) return;
  o.estado = o.estado === 'registrado' ? 'pendiente' : 'registrado';
  renderPedidos();
  showToastAdmin(o.estado === 'registrado' ? 'Pedido registrado y stock descontado' : 'Pedido vuelto a pendiente', o.estado === 'registrado' ? 'success' : 'info');
}
function toggleEnviado(id, el) {
  const o = orders.find(x => x.id === id);
  if (!o) return;
  o.enviado = !o.enviado;
  el.querySelector('input').checked = o.enviado;
  el.querySelector('span').textContent = o.enviado ? 'ENVIADO' : 'MARCAR ENVIADO';
  el.closest('.order-card').classList.toggle('sent', o.enviado);
  showToastAdmin(o.enviado ? 'Marcado como enviado' : 'Desmarcado enviado', 'info');
}
function openPrintModal(id) {
  const o = orders.find(x => x.id === id);
  if (!o) return;
  const content = document.getElementById('thermalLabelContent');
  const zonaLabel = o.zona === 'lima' ? 'LIMA' : 'PROVINCIA';
  const destino = o.zona === 'lima' ? (o.distrito || '') : (o.provincia + ' / ' + (o.agenciaShalom || ''));
  const items = o.productos.map(p => p.producto + ' ' + p.color + ' ' + p.talla).join(' | ');
  content.innerHTML = `
    <div class="header">
      <div class="order-id">ORDEN ${o.id}</div>
      <div style="font-size:8px; margin-top:1mm;">MITIENDAMIA - ${zonaLabel}</div>
    </div>
    <div class="field"><span class="label">Cliente:</span> ${escapeHtml(o.nombre)}</div>
    <div class="field"><span class="label">Tel:</span> ${o.celular}</div>
    <div class="field"><span class="label">Destino:</span> ${escapeHtml(destino)}</div>
    <div class="field"><span class="label">Prendas:</span> ${escapeHtml(items)}</div>
    <div class="thermal-barcode"></div>
    <div class="field"><span class="label">Nro Orden:</span> MT-${o.id}</div>
    ${o.zona === 'provincia' ? `<div class="field"><span class="label">Cod Shalom:</span> SH-${o.id}</div>` : ''}
    <div class="footer">Gracias por su compra - MITIENDAMIA</div>
  `;
  document.getElementById('printModal').classList.remove('hidden');
  document.getElementById('printModal').classList.add('open');
  lucide.createIcons();
}
function closePrintModal() {
  const m = document.getElementById('printModal');
  if (m.classList.contains('open')) {
    m.classList.remove('open');
    setTimeout(() => m.classList.add('hidden'), 300);
  }
}
function invChange(id, delta) {
  const it = inventory.find(x => x.id === id);
  if (!it) return;
  it.stock = Math.max(0, it.stock + delta);
  renderInventario();
}
function openInventoryModal() {
  const nombre = prompt('Nombre de la prenda:');
  if (!nombre) return;
  const color = prompt('Color:') || 'Único';
  const talla = prompt('Talla:') || 'Única';
  const stock = parseInt(prompt('Stock inicial:') || '0', 10) || 0;
  const precio = parseFloat(prompt('Precio (S/):') || '0') || 0;
  const nuevo = { id: Date.now(), prenda: nombre, color, talla, stock, precio };
  inventory.push(nuevo);
  renderInventario();
  showToastAdmin('Prenda agregada al inventario', 'success');
}
function renderVentas() {
  const confirmadas = orders.filter(o => o.estado === 'registrado');
  const total = confirmadas.reduce((s, o) => s + 50, 0);
  document.getElementById('metricTotal').textContent = 'S/ ' + total.toFixed(2);
  document.getElementById('metricPedidos').textContent = confirmadas.length;
  document.getElementById('metricTicket').textContent = 'S/ ' + (confirmadas.length ? (total/confirmadas.length).toFixed(2) : '0.00');
  const tbody = document.getElementById('salesTableBody');
  tbody.innerHTML = confirmadas.map(o => `
    <tr>
      <td>MT-${o.id}</td>
      <td>${escapeHtml(o.nombre)}</td>
      <td>${new Date(o.creado_en).toLocaleDateString('es-PE')}</td>
      <td>S/ 50.00</td>
      <td>${o.zona === 'lima' ? 'Lima' : 'Provincia'}</td>
    </tr>`).join('');
}
function copyStoreLink() {
  const link = 'https://mitiendamia.netlify.app';
  navigator.clipboard.writeText(link).then(() => {
    const btn = document.querySelector('button[onclick="copyStoreLink()"]');
    const original = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="check" class="w-3 h-3"></i><span>¡Enlace copiado!</span>';
    btn.classList.add('copied');
    lucide.createIcons();
    setTimeout(() => {
      btn.innerHTML = original;
      btn.classList.remove('copied');
      lucide.createIcons();
    }, 2000);
    showToastAdmin('Enlace copiado al portapapeles', 'success');
  });
}
function shareWhatsApp() {
  const text = encodeURIComponent('¡Hola! Conoce MITIENDAMIA. Realiza tus pedidos en línea: https://mitiendamia.netlify.app');
  window.open('https://wa.me/?text=' + text, '_blank');
}
function showToastAdmin(msg, type = 'info') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = 'toast ' + (type === 'error' ? 'error' : type === 'success' ? 'success' : 'info');
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(100%)'; setTimeout(() => t.remove(), 300); }, 3500);
}
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
document.addEventListener('DOMContentLoaded', initAdmin);
