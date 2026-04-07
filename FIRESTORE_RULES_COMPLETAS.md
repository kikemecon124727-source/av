# 🔐 Actualizar Reglas de Firestore - Sistema Completo

## REGLAS COMPLETAS PARA COPIAR/PEGAR

Ve a Firebase Console → Firestore Database → Reglas y reemplaza con:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Colección de productos
    match /productos/{productId} {
      // Lectura: Todos (público)
      allow read: if true;
      
      // Escritura: Solo usuarios autenticados (admin)
      allow write: if request.auth != null;
    }
    
    // Colección de referencias (testimonios)
    match /referencias/{referenciaId} {
      // Lectura: Todos (público) - para carrusel
      allow read: if true;
      
      // Escritura: Solo usuarios autenticados (admin)
      allow write: if request.auth != null;
    }
    
    // Colección de clientes (NUEVA)
    match /clientes/{clienteId} {
      // Lectura: Solo usuarios autenticados
      allow read: if request.auth != null;
      
      // Escritura: Solo usuarios autenticados (admin/ventas)
      allow write: if request.auth != null;
    }
    
    // Colección de pedidos (NUEVA)
    match /pedidos/{pedidoId} {
      // Lectura: Solo usuarios autenticados
      allow read: if request.auth != null;
      
      // Escritura: Solo usuarios autenticados (admin/ventas)
      allow write: if request.auth != null;
    }
    
    // Bloquear acceso a otras colecciones por defecto
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 🎯 EXPLICACIÓN DE COLECCIONES

### **productos**
- Lectura pública: Para que los clientes vean el catálogo
- Escritura autenticada: Solo admins

### **referencias**
- Lectura pública: Para mostrar testimonios en el carrusel
- Escritura autenticada: Solo admins

### **clientes** (NUEVA)
- Lectura autenticada: Solo usuarios logueados (admin/ventas)
- Escritura autenticada: Crear, editar, eliminar clientes
- Campos: nombre, pedidosTotales, preciosEspeciales

### **pedidos** (NUEVA)
- Lectura autenticada: Solo usuarios logueados (admin/ventas)
- Escritura autenticada: Crear, actualizar pedidos
- Campos: tipo, clienteId, productos, totalConIVA, numeroOrden, pagado, adeudo

## ✅ APLICAR REGLAS

1. Ve a **Firebase Console**: https://console.firebase.google.com
2. Selecciona tu proyecto
3. **Firestore Database** → pestaña **"Reglas"**
4. Pega las reglas de arriba
5. Clic en **"Publicar"**
6. Espera 10-30 segundos

## 🔍 VERIFICACIÓN

Después de publicar:
- Recarga el panel de ventas
- Intenta crear un cliente
- El error "Missing or insufficient permissions" debe desaparecer

---

**¡IMPORTANTE!** Sin estas reglas, el panel de ventas no funcionará.
