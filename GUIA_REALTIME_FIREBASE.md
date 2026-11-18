# GUIA DE CONFIGURACIÓN: SINCRONIZACIÓN EN TIEMPO REAL NATIVO

Este proyecto cuenta con una arquitectura de sincronización en vivo dual:

1. **Modo Instantáneo Sin Servidor (Local Multi-Tab):**  
   Funciona de inmediato sin necesidad de crear cuentas ni configurar bases de datos. Si abres el **Panel Administrativo** (`index.html`) en una ventana y el **Enlace de Clientes** (`pedido.html`) en otra ventana o pestaña, ambos se comunican en **menos de 50 milisegundos** mediante `BroadcastChannel`.
   - Si un cliente compra la última unidad, se marca "Agotado" en vivo para los demás.
   - Si un cliente envía un pedido, el panel suena con una campana agradable y la tabla se actualiza al instante.

2. **Modo Cloud en Tiempo Real (Firebase Firestore):**  
   Para que clientes en sus celulares en cualquier parte del país compren y tu Panel Administrativo en tu laptop reciba la orden en vivo vía Internet sin recargar la página.

---

## 🛠️ Pasos para Conectar Firebase Cloud Firestore (Toma 2 minutos)

### Paso 1: Crear el Proyecto en Firebase
1. Entra a [https://console.firebase.google.com/](https://console.firebase.google.com/) con tu cuenta de Google.
2. Haz clic en **"Crear un proyecto"** (o *"Add project"*).
3. Ponle un nombre (ej. `logix-fashion-peru`) y haz clic en Continuar (puedes desactivar Google Analytics para ir más rápido).

### Paso 2: Activar Firestore Database
1. En el menú lateral izquierdo, haz clic en **Build (Compilación)** ➔ **Firestore Database**.
2. Haz clic en el botón **"Crear base de datos"**.
3. Selecciona la ubicación más cercana (ej. `us-central1` o `southamerica-east1`).
4. Selecciona **"Comenzar en modo de prueba"** (*Start in test mode*) y haz clic en **Habilitar**.

### Paso 3: Reglas de Seguridad de Firestore (Pestaña "Rules")
En la consola de Firestore, ve a la pestaña **Reglas** (*Rules*) y asegúrate de que tenga permiso de lectura y escritura para el catálogo y los pedidos:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura y creación de pedidos en tiempo real
    match /orders/{orderId} {
      allow read, write: if true;
    }
    
    // Permitir lectura y descuento atómico de inventario
    match /inventory/{docId} {
      allow read, write: if true;
    }
  }
}
```
Haz clic en **Publicar** (*Publish*).

### Paso 4: Obtener las Credenciales y Pegarlas en la App
1. En Firebase Console, haz clic en el ícono de engranaje ⚙️ junto a *Información general del proyecto* ➔ **Configuración del proyecto**.
2. Desplázate hacia abajo hasta la sección **"Tus apps"** y haz clic en el ícono web `</>`.
3. Registra la app con cualquier nombre (ej. `Logix Web`) y haz clic en Registrar.
4. Verás un bloque con `firebaseConfig` similar a esto:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyD-XXXXXXXXXXXXXXXXXXXX",
     authDomain: "logix-fashion-peru.firebaseapp.com",
     projectId: "logix-fashion-peru",
     storageBucket: "logix-fashion-peru.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abcdef123456"
   };
   ```

5. Puedes conectarlo de dos formas:
   * **Desde la propia interfaz web:** Abre tu Panel (`index.html`), haz clic en el ícono de base de datos 🗄️ en la barra superior, pega el `Project ID` y el `API Key`, y haz clic en **Guardar y Conectar**.
   * **O en el archivo:** Abre el archivo `firebase-config.js` y pega los valores dentro del objeto `FIREBASE_CONFIG`.

---

## ⚡ ¿Cómo probar la sincronización en vivo ahora mismo?

1. Abre tu panel: [index.html](file:///c:/Users/hurie/.cline/data/workspaces/chat/pedidos/Nueva%20carpeta/index.html)
2. Haz clic en el botón superior derecho: **"Enlace Clientes"** (abre [pedido.html](file:///c:/Users/hurie/.cline/data/workspaces/chat/pedidos/Nueva%20carpeta/pedido.html) en otra ventana lado a lado).
3. En la ventana de clientes, agrega un producto y haz clic en **"Confirmar y Completar mi Pedido"**.
4. ¡Verás que en **menos de 1 segundo**, tu panel administrativo emite el sonido de notificación, despliega el aviso flotante verde, añade el pedido a la tabla, actualiza los números de ventas del día y coloca el pin del cliente en el mapa de geolocalización!
