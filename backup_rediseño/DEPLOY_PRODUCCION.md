# 🚀 GUÍA DE DESPLIEGUE A PRODUCCIÓN - LOGIX FASHION

Esta guía te explica paso a paso cómo poner tu aplicación en internet **de forma gratuita, con HTTPS (candado de seguridad) y con un enlace público funcional** para compartir con clientes y personal.

---

## 🏆 Opción 1: Netlify (La más rápida: 30 segundos sin comandos)

Netlify te permite subir la carpeta directamente desde tu navegador:

1. Ingresa a: **[https://app.netlify.com/drop](https://app.netlify.com/drop)** (inicia sesión con Google o GitHub si te lo pide).
2. Arrastra y suelta la carpeta entera del proyecto (`Nueva carpeta`) dentro del recuadro punteado.
3. ¡Listo! En menos de 20 segundos Netlify te generará un enlace público HTTPS como:  
   👉 `https://nombre-aleatorio.netlify.app`
4. **Personalizar el enlace:**
   - En el panel de tu sitio en Netlify, haz clic en **"Site configuration"** ➔ **"Change site name"**.
   - Cambia el nombre por algo como `logix-fashion-peru.netlify.app`.
   - Ahora tus enlaces serán:
     - Enlace para Clientes (Público): `https://logix-fashion-peru.netlify.app/` (o `/pedido`)
     - Panel Administrativo (Con Clave): `https://logix-fashion-peru.netlify.app/admin` (o `/admin.html`)

---

## ⚡ Opción 2: Vercel (Recomendado para Máximo Rendimiento)

El proyecto ya incluye el archivo de configuración de producción `vercel.json` con cabeceras de seguridad y URLs limpias.

### Método A: Mediante Vercel CLI (Desde tu terminal)
Si tienes Node.js en tu computadora, abre tu terminal dentro de la carpeta y corre:
```bash
npx vercel
```
1. Te pedirá presionar `y` para confirmar.
2. Inicia sesión en tu navegador con Google o GitHub.
3. Responde a las preguntas con `Enter` (deja los valores por defecto).
4. Cuando termine, ejecuta para pasar a producción:
```bash
npx vercel --prod
```
Te entregará un enlace instantáneo como: `https://logix-fashion-peru.vercel.app`.

### Método B: Conectar con GitHub
1. Crea un repositorio en GitHub y sube los archivos de esta carpeta.
2. Entra a [https://vercel.com/new](https://vercel.com/new).
3. Selecciona tu repositorio y haz clic en **"Deploy"**.
4. ¡Cada vez que hagas un cambio en GitHub, Vercel actualizará tu sitio web en vivo automáticamente!

---

## 🗄️ Paso Crítico: Base de Datos en la Nube (Firebase Firestore)

Para que los datos de tus ventas, clientes y stock nunca se pierdan y se sincronicen entre cualquier celular o computadora:

1. Entra a [Firebase Console](https://console.firebase.google.com/) con tu cuenta Google.
2. Crea un proyecto gratuito (ej. `logix-fashion`).
3. Ve a **Build (Compilación)** ➔ **Firestore Database** ➔ **Crear base de datos**.
4. Selecciona **Modo de Prueba** y haz clic en **Habilitar**.
5. Ve a la pestaña **Reglas (Rules)** y pega:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      allow read, write: if true;
    }
    match /inventory/{docId} {
      allow read, write: if true;
    }
  }
}
```
6. Haz clic en **Publicar** (*Publish*).
7. En la configuración del proyecto (⚙️), copia tu `Project ID` y `API Key`.
8. En tu panel administrativo publicado, haz clic en el botón de base de datos 🗄️ en la barra superior, pega las credenciales y haz clic en **Guardar y Conectar**.

---

## 🔒 Buenas Prácticas de Seguridad en Producción

1. **Protección XSS:** El sistema cuenta con `security.js`, el cual sanitiza automáticamente cualquier nombre o dirección que un cliente ingrese desde internet para evitar ataques de código.
2. **Validación de Formularios Peruanos:**
   - Celulares de 9 dígitos validados (`^9\d{8}$`).
   - DNI de 8 dígitos validado.
3. **Persistencia Offline:** Si a un cliente se le corta la conexión celular mientras confirma, el sistema tiene IndexedDB activado para no perder el pedido.
4. **Transacciones Atómicas:** Si dos clientes intentan comprar la última prenda en el mismo segundo, la base de datos atómica bloquea la sobreventa y solo confirma a uno.
