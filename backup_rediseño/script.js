/* MITIENDAMIA - Lógica cliente */
let productos = [
  { id: 'p1', nombre: 'Hoodie Street', colores: ['Negro', 'Blanco', 'Gris'], tallas: ['S','M','L','XL'], precio: 89 },
  { id: 'p2', nombre: 'Cargo Pant', colores: ['Negro', 'Verde Oliva', 'Beige'], tallas: ['S','M','L','XL'], precio: 129 },
  { id: 'p3', nombre: 'Tee Logo', colores: ['Blanco', 'Negro', 'Rojo'], tallas: ['S','M','L','XL'], precio: 49 },
  { id: 'p4', nombre: 'Jacket Windbreaker', colores: ['Azul', 'Negro'], tallas: ['S','M','L','XL'], precio: 159 },
];
let zonaActual = 'lima';
let productRows = [];
function init() { renderProductRows(); lucide.createIcons(); }
function selectZone(zona) {
  zonaActual = zona;
  document.getElementById('tabLima').classList.toggle('active', zona === 'lima');
  document.getElementById('tabProvincia').classList.toggle('active', zona === 'provincia');
  document.getElementById('fieldsLima').classList.toggle('hidden', zona !== 'lima');
  document.getElementById('fieldsProvincia').classList.toggle('hidden', zona !== 'provincia');
}
function addProductRow() {
  const idx = productRows.length;
  productRows.push({ producto: 'p1', color: '', talla: '' });
  renderProductRows();
}
function removeProductRow(idx) { productRows.splice(idx, 1); renderProductRows(); }
function renderProductRows() {
  const container = document.getElementById('productRows');
  container.innerHTML = '';
  productRows.forEach((row, i) => {
    const prod = productos.find(p => p.id === row.producto) || productos[0];
    const colorOpts = prod.colores.map(c => `<option value="${c}">${c}</option>`).join('');
    const tallaOpts = prod.tallas.map(t => `<option value="${t}">${t}</option>`).join('');
    const html = `
      <div class="product-row fade-in">
        <select class="product-select" onchange="changeProduct(${i}, this.value)">
          ${productos.map(p => `<option value="${p.id}" ${p.id===row.producto?'selected':''}>${p.nombre}</option>`).join('')}
        </select>
        <select class="color-select" onchange="changeColor(${i}, this.value)">${colorOpts}</select>
        <select class="size-select" onchange="changeSize(${i}, this.value)">${tallaOpts}</select>
        <span class="text-xs text-slate-400 font-mono">S/ ${prod.precio}</span>
        <button class="btn-remove-product" onclick="removeProductRow(${i})" title="Eliminar">×</button>
      </div>`;
    container.innerHTML += html;
  });
  if (productRows.length === 0) addProductRow();
  lucide.createIcons();
}
function changeProduct(i, id) { productRows[i].producto = id; const p=productos.find(x=>x.id===id); productRows[i].color=p.colores[0]; productRows[i].talla=p.tallas[0]; renderProductRows(); }
function changeColor(i, c) { productRows[i].color = c; }
function changeSize(i, t) { productRows[i].talla = t; }
function showToast(msg, type='info') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = 'toast ' + (type==='success'?'success':type==='error'?'error':'info');
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transform='translateX(100%)'; setTimeout(()=>t.remove(),300); }, 3000);
}
function openAdminLogin() {
  document.getElementById('adminLoginModal').classList.remove('hidden');
  lucide.createIcons();
}
function closeAdminLogin() {
  document.getElementById('adminLoginModal').classList.add('hidden');
}
async function handleAdminLogin(e) {
  e.preventDefault();
  const email = document.getElementById('adminEmail').value;
  const password = document.getElementById('adminPassword').value;
  const btn = e.target.querySelector('button[type="submit"]');
  const original = btn.innerHTML;
  btn.innerHTML = '<span class="inline-block animate-spin mr-2"></span> Ingresando...';
  btn.disabled = true;
  try {
    const supabase = window.getSupabase ? window.getSupabase() : null;
    if (!supabase) {
      if (password === 'admin123') {
        sessionStorage.setItem('mta_admin', 'true');
        showToast('Acceso concedido (demo)', 'success');
        closeAdminLogin();
        window.location.href = '/admin';
      } else {
        showToast('Contraseña incorrecta (demo: admin123)', 'error');
      }
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    sessionStorage.setItem('mta_admin', 'true');
    showToast('Bienvenido al panel', 'success');
    closeAdminLogin();
    window.location.href = '/admin';
  } catch (err) {
    showToast('Error de acceso: ' + err.message, 'error');
  } finally {
    btn.innerHTML = original;
    btn.disabled = false;
  }
}
async function handleOrderSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('btnConfirmar');
  const original = btn.innerHTML;
  btn.innerHTML = '<span class="inline-block animate-spin mr-2"></span> Procesando...';
  btn.disabled = true;
  try {
    const zona = zonaActual;
    const common = {
      zona,
      productos: productRows.map(r => {
        const p = productos.find(x => x.id === r.producto);
        return { producto: p.nombre, color: r.color, talla: r.talla };
      })
    };
    let payload;
    if (zona === 'lima') {
      payload = {
        ...common,
        nombre: document.getElementById('nombre').value,
        celular: document.getElementById('celular').value,
        distrito: document.getElementById('distrito').value,
        direccion: document.getElementById('direccion').value,
        referencia: document.getElementById('referencia').value || ''
      };
    } else {
      payload = {
        ...common,
        nombre: document.getElementById('nombreProv').value,
        dni: document.getElementById('dni').value,
        celular: document.getElementById('celularProv').value,
        provincia: document.getElementById('provincia').value,
        agenciaShalom: document.getElementById('agenciaShalom').value
      };
    }
    const supabase = window.getSupabase ? window.getSupabase() : null;
    let orderId = 'MT-' + Date.now().toString().slice(-6);
    if (supabase) {
      const { data, error } = await supabase.from('pedidos').insert([{ ...payload, estado: 'pendiente', creado_en: new Date().toISOString() }]).select();
      if (error) throw error;
      if (data && data[0]) orderId = data[0].id;
    }
    showOrderConfirmation(orderId, payload);
    document.getElementById('orderForm').reset();
    productRows = [];
    renderProductRows();
    showToast('Pedido enviado correctamente', 'success');
  } catch (err) {
    showToast('Error al enviar: ' + err.message, 'error');
  } finally {
    btn.innerHTML = original;
    btn.disabled = false;
  }
}
function showOrderConfirmation(orderId, data) {
  const summary = document.getElementById('orderSummary');
  const itemsHtml = data.productos.map(p => `
    <div class="order-summary-item">
      <span><span class="item-name">${p.producto}</span><br><span class="item-details">${p.color} / ${p.talla}</span></span>
      <span class="item-qty">1</span>
    </div>`).join('');
  const zonaLabel = data.zona === 'lima' ? 'LIMA' : 'PROVINCIA';
  summary.innerHTML = itemsHtml + `
    <div class="order-summary-item">
      <span class="item-name">${zonaLabel}</span>
      <span class="item-qty font-bold">${data.zona === 'lima' ? data.distrito : data.provincia + ' / ' + data.agenciaShalom}</span>
    </div>
    <div class="order-summary-item">
      <span class="item-name">Teléfono</span>
      <span class="item-qty">${data.celular}</span>
    </div>
    <div class="order-summary-item">
      <span class="item-name">N° Orden</span>
      <span class="item-qty font-bold">${orderId}</span>
    </div>`;
  document.getElementById('confirmationCard').classList.remove('hidden');
  lucide.createIcons();
}
function closeConfirmation() {
  document.getElementById('confirmationCard').classList.add('hidden');
}
document.addEventListener('DOMContentLoaded', () => {
  init();
  const form = document.getElementById('adminLoginForm');
  if (form) form.addEventListener('submit', handleAdminLogin);
  const orderForm = document.getElementById('orderForm');
  if (orderForm) orderForm.addEventListener('submit', handleOrderSubmit);
});