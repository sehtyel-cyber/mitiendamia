# 🚀 GUÍA RÁPIDA: Conexión Supabase + Netlify (menos de 5 minutos)

Esta guía te explica exactamente cómo conectar tu aplicación LOGIX FASHION a Supabase (PostgreSQL en la nube) y desplegarla en Netlify.

---

## PASO 1: Crear proyecto en Supabase (2 min)

1. Ve a [https://supabase.com](https://supabase.com) e inicia sesión.
2. Haz clic en **"New Project"**.
3. Ponle nombre (ej. `mitiendamia`), contraseña de base de datos, y selecciona la región más cercana.
4. Haz clic en **"Create new project"** y espera a que se provisione.

---

## PASO 2: Ejecutar el SQL en Supabase (1 min)

1. En Supabase, ve a **SQL Editor** (menú lateral izquierdo).
## PASO 3: Crear el usuario administrador en Supabase Auth (1 min)

1. En Supabase, ve a **Authentication → Users**.
2. Haz clic en **"Add user"**.
3. Rellena: Email `admin@mitiendamia.netlify.app`, Password `admin123`.
4. Marca **"Auto-confirm email"** y haz clic en **"Add user"**.
5. Ve a **Authentication → Settings** y deshabilita **"Enable email confirmations"** si lo deseas.

## PASO 4: Obtener credenciales de Supabase (1 min)

1. Ve a **Settings → API**.
2. Copia **Project URL** y **public anon key**.

## PASO 5: Configurar supabase-config.js

Abre `supabase-config.js` y reemplaza:

```javascript
const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY_AQUI';
```

## PASO 6: Desplegar en Netlify (1 min)

### Opción A: Netlify Drop
## ✅ URLs finales

| URL | Propósito | Acceso |
|-----|-----------|--------|
| `https://mitiendamia.netlify.app/` | Tienda pública | Sin contraseña |
| `https://mitiendamia.netlify.app/admin` | Panel administrativo | Con contraseña (Supabase Auth) |
| `https://mitiendamia.netlify.app/pedido` | Redirige a tienda pública | Sin contraseña |

## 🔐 Seguridad implementada

| Medida | Descripción |
|--------|-------------|
| **RLS en `pedidos`** | Público INSERT, solo admin autenticado SELECT/UPDATE |
| **RLS en `inventario_*`** | Público SELECT (ver stock), solo admin escribir |
| **Fn `fn_reserve_stock`** | SECURITY DEFINER, descuento atómico con `FOR UPDATE` |
| **Validación formulario** | Teléfono 9 dígitos Perú, DNI 8 dígitos, stock verificado |
| **Doble envío** | Botón deshabilitado + spinner durante envío |
| **try/catch** | Todas las consultas a Supabase con manejo de errores |
| **Sin localStorage** | Cero uso de localStorage para datos de negocio |

## 📋 Checklist de despliegue

- [ ] Proyecto creado en Supabase
- [ ] SQL ejecutado en SQL Editor
- [ ] Usuario admin creado en Authentication → Users
- [ ] Credenciales pegadas en `supabase-config.js`
- [ ] Archivos subidos a Netlify
- [ ] Tienda pública cargando productos desde Supabase
- [ ] Panel `/admin` accesible con login de Supabase Auth
- [ ] Botón "Copiar enlace" funciona
- [ ] Botón "Enviar por WhatsApp" funciona
- [ ] Prueba de pedido completada con éxito
1. Ve a [https://app.netlify.com/drop](https://app.netlify.com/drop).
2. Arrastra la carpeta del proyecto.

### Opción B: GitHub
1. Sube a GitHub y conecta con Netlify.

## PASO 7: Variables de entorno en Netlify (opcional)

En **Site settings → Environment variables** agrega:
- `SUPABASE_URL` = `https://TU_PROYECTO.supabase.co`
- `SUPABASE_ANON_KEY` = `TU_ANON_KEY_AQUI`

> ⚠️ Nota: Sitios estáticos no inyectan variables en JS del cliente. Pon los valores directamente en `supabase-config.js`.
2. Abre `supabase-schema.sql` y copia TODO su contenido.
3. Pégalo en el SQL Editor y haz clic en **"Run"**.

Esto crea las tablas `pedidos`, `inventario_productos`, `inventario_stock`, `admins`, la función `fn_reserve_stock` y las políticas RLS.