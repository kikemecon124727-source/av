# 🔐 Reglas de Firestore - Referencias de Clientes

## ❗ ERROR ACTUAL
```
FirebaseError: Missing or insufficient permissions
```

**Causa:** La colección `referencias` no tiene permisos configurados en Firestore.

---

## ✅ SOLUCIÓN - Actualizar Reglas de Firestore

### **Pasos para configurar:**

1. Ve a **Firebase Console**: https://console.firebase.google.com
2. Selecciona tu proyecto
3. En el menú lateral, clic en **"Firestore Database"**
4. Clic en la pestaña **"Reglas"** (Rules)
5. Reemplaza las reglas actuales con las siguientes:

---

## 📋 REGLAS COMPLETAS DE FIRESTORE

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
    
    // Colección de referencias (NUEVA)
    match /referencias/{referenciaId} {
      // Lectura: Todos (público) - para mostrar en el catálogo
      allow read: if true;
      
      // Escritura: Solo usuarios autenticados (admin)
      allow write: if request.auth != null;
    }
    
    // Bloquear acceso a otras colecciones por defecto
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 🎯 EXPLICACIÓN DE LAS REGLAS

### **Colección `productos`**
- ✅ **Lectura pública** (`read: if true`) - Para que los clientes vean el catálogo
- 🔒 **Escritura autenticada** (`write: if request.auth != null`) - Solo admins pueden crear/editar/eliminar

### **Colección `referencias`** (NUEVA)
- ✅ **Lectura pública** (`read: if true`) - Para mostrar referencias en el carrusel
- 🔒 **Escritura autenticada** (`write: if request.auth != null`) - Solo admins pueden gestionar referencias

### **Seguridad**
- Otras colecciones están bloqueadas por defecto
- Solo usuarios con cuenta Firebase Auth pueden escribir
- El público solo puede leer productos y referencias

---

## 🚀 APLICAR LAS REGLAS

### **Opción 1: Firebase Console (RECOMENDADA)**

1. Abre Firebase Console
2. Firestore Database → Reglas
3. Pega las reglas de arriba
4. Clic en **"Publicar"** (Publish)
5. Espera 10-30 segundos para que se propaguen

### **Opción 2: Firebase CLI (si tienes configurado CLI)**

1. Crea archivo `firestore.rules` en la raíz del proyecto
2. Pega las reglas de arriba
3. Ejecuta: `firebase deploy --only firestore:rules`

---

## ✅ VERIFICACIÓN

Después de aplicar las reglas:

1. Recarga la página del admin
2. Intenta crear una referencia nuevamente
3. El error **"Missing or insufficient permissions"** debe desaparecer
4. La referencia se creará exitosamente

---

## 🔍 TROUBLESHOOTING

### Si el error persiste:

1. **Verifica que las reglas se publicaron:**
   - Firebase Console → Firestore Database → Reglas
   - Debe aparecer la fecha/hora de última publicación

2. **Verifica que estás autenticado:**
   - Debes estar logueado como `edgar561737@gmail.com`
   - Cierra sesión y vuelve a entrar si es necesario

3. **Limpia caché del navegador:**
   - Ctrl + Shift + R (Windows/Linux)
   - Cmd + Shift + R (Mac)

4. **Espera 1-2 minutos:**
   - Las reglas de Firestore pueden tardar en propagarse

---

## 📊 ESTADO ACTUAL

❌ **Referencias:** Sin permisos configurados
✅ **Productos:** Permisos configurados correctamente

**Acción requerida:** Aplicar las reglas de arriba en Firebase Console.

---

## 💡 NOTA IMPORTANTE

Estas reglas son para **desarrollo/producción básica**. Para mayor seguridad en producción, considera:

- Validar tipos de datos
- Limitar tamaño de documentos
- Agregar rate limiting
- Validar campos requeridos

Ejemplo de reglas más estrictas:

```javascript
match /referencias/{referenciaId} {
  allow read: if true;
  
  allow create: if request.auth != null 
    && request.resource.data.nombreCliente is string
    && request.resource.data.nombreCliente.size() > 0
    && request.resource.data.nombreCliente.size() <= 100;
    
  allow update, delete: if request.auth != null;
}
```

---

**¡Aplica estas reglas y el sistema de referencias funcionará perfectamente!** 🎉
