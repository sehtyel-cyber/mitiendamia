# LOGIX FASHION - Sistema de Gestión de Pedidos & Logística E-Commerce

Una solución web responsiva integral (PC y celular) diseñada específicamente para la operativa de marcas de ropa, comercio electrónico y despachos en Perú (Lima Metropolitana y Provincias con agencias como Shalom, Olva Courier, etc.) con **sincronización en tiempo real estricta** entre clientes y administración.

---

## 🌟 Dos Enlaces Principales

1. **Panel Administrativo:** [index.html](file:///c:/Users/hurie/.cline/data/workspaces/chat/pedidos/Nueva%20carpeta/index.html)  
   - Control de métricas en vivo, recepción instantánea de pedidos con alerta sonora, tabla logística, inventario y mapa CRM.
2. **Enlace Público para Clientes:** [pedido.html](file:///c:/Users/hurie/.cline/data/workspaces/chat/pedidos/Nueva%20carpeta/pedido.html)  
   - Interfaz limpia y optimizada para el comprador con stock sincronizado en vivo y transacciones atómicas seguras.

---

## ⚡ Sincronización en Tiempo Real

* **Escuchadores en vivo (`onSnapshot` / `BroadcastChannel`):** En cuanto un cliente envía un pedido, este aparece en el Panel Administrativo en menos de 1 segundo.
* **Notificación Sonora y Visual:** Campanada de aviso con la API nativa de audio (`Web Audio API`) y banner animado con los datos de la compra.
* **Control de Stock Concurrente:** Si queda 1 unidad y alguien la compra, se marca "Agotado" en tiempo real para todos los clientes conectados, evitando sobreventas mediante transacciones atómicas.
* **Actualización Reactiva de KPIs y Mapa:** Los totales de venta, gráficos y pines del mapa se actualizan al instante sin recargar el navegador.

---

## 🌟 Características Principales

1. **Panel de Acceso Administrativo (Login Seguro):**
   - Interfaz con estilo Glassmorphism corporativo moderno.
   - Contraseña de acceso por defecto: `admin123`.

2. **Formulario de Registro de Pedidos:**
   - Selector inteligente de destino: **Lima Metropolitana** vs. **Provincia**.
   - Campos condicionales para provincia: Agencia (Shalom, Olva, etc.), Código/Sede de recojo y Número de orden/guía.
   - Selector dinámico de prendas: Modelo, Color y Talla (S, M, L, XL) con comprobación de stock disponible en tiempo real.
   - Cálculo automático de subtotal, envío y cobro total.
   - Al confirmar el pedido, el stock se descuenta automáticamente del inventario y se sincroniza con el CRM.

3. **Panel Administrativo (Dashboard):**
   - KPIs en tiempo real: Ventas del día, pedidos por despachar, enviados y tasa de entrega.
   - Gráfico de barras de tendencia de ventas y gráfico de distribución Lima vs. Provincias (Chart.js).
   - Tabla interactiva con filtros por estado logístico (*Pagado / No enviado*, *Enviado*, *Entregado*, *Pendiente Pago*), búsqueda por cliente/DNI/teléfono, selector de estado directo y botón para WhatsApp de seguimiento.

4. **Módulo de Inventario de Ropa:**
   - Vista por tarjetas de cada modelo con matriz desglosada por color y tallas (S, M, L, XL).
   - Alerta visual de stock bajo (≤ 4 unidades) y agotado.
   - Modal interactivo para reabastecer o ingresar nuevas unidades al almacén.

5. **Módulo de Impresión de Rótulos Térmicos:**
   - Vista previa 1:1 en formato estándar para impresoras térmicas (80mm / 100mm).
   - Generación de código de barras simulado, datos de remitente, destinatario, agencia, código de sede y detalle de prendas.
   - Reglas CSS `@media print` optimizadas: al hacer clic en *Imprimir*, el navegador envía únicamente la etiqueta térmica a la impresora sin elementos de la interfaz.

6. **Mapa de Clientes (CRM Visual):**
   - Mapa interactivo con Leaflet y OpenStreetMap centrado en Lima y ciudades del Perú.
   - Pines de geolocalización coloreados por nivel de fidelización (VIP, Recurrente, Nuevo).
   - Al hacer clic en cualquier pin, se despliega un panel lateral flotante con:
     - Datos de contacto y dirección.
     - Historial de todas las compras del cliente.
     - Botón de WhatsApp directo con mensaje prediseñado.
     - Botón de fidelización para enviar cupones de recompra.

---

## 🚀 Cómo Ejecutar la Aplicación

Tienes dos opciones muy sencillas:

### Opción 1: Abrir directamente en el navegador (Sin dependencias)
Haz doble clic sobre el archivo `index.html` en tu explorador de archivos para abrirlo en Chrome, Edge o tu navegador preferido. ¡Todo funcionará de inmediato con persistencia en `localStorage`!

### Opción 2: Iniciar con Node.js
En la terminal, dentro de esta carpeta, ejecuta:
```bash
node server.js
```
Luego abre tu navegador en:
```
http://localhost:3000
```

---

## 🔑 Credenciales de Acceso Demo

- **Usuario:** `admin`
- **Contraseña:** `admin123`
*(También puedes hacer clic en el botón "Autocompletar" en la pantalla de inicio de sesión).*
