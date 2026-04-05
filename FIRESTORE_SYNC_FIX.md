# 🔥 Configuración de Reglas de Firestore

## ⚠️ IMPORTANTE: Configura estas reglas en Firebase Console

Para que la sincronización funcione desde cualquier dispositivo:

### 📍 Ir a Firebase Console:
1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Selecciona tu proyecto: **jessica-61abf**
3. Ve a **Firestore Database** (menú izquierdo)
4. Click en la pestaña **"Rules"**

### 📝 Reglas Recomendadas:

**Opción 1: Solo usuarios autenticados (RECOMENDADO)**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Productos: Lectura pública, escritura solo autenticados
    match /productos/{productId} {
      allow read: if true;  // Cualquiera puede leer (catálogo público)
      allow write: if request.auth != null;  // Solo usuarios autenticados pueden escribir
    }
  }
}
```

**Opción 2: Totalmente abierto (TEMPORAL - solo para desarrollo)**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **La Opción 2 es INSEGURA para producción. Úsala solo temporalmente.**

---

## 🐛 Solución al Problema de Sincronización:

### **Problema:**
Los productos no se sincronizan desde otros dispositivos/redes.

### **Causas Posibles:**
1. ❌ Reglas de Firestore muy restrictivas
2. ❌ Usuario no autenticado en otros dispositivos
3. ❌ Caché del navegador desactualizado

### **Soluciones:**

#### **1. Configurar Reglas (HACER ESTO PRIMERO):**
- Sigue las instrucciones de arriba
- Usa la **Opción 1** (recomendado)
- Click en **"Publish"** para aplicar

#### **2. Verificar Autenticación:**
- Asegúrate de hacer login en `/admin` desde el otro dispositivo
- Usuario: `edgar561737@gmail.com`
- Password: `Edgar123e`

#### **3. Limpiar Caché:**
En el navegador:
- Presiona `Ctrl + Shift + R` (Windows/Linux)
- O `Cmd + Shift + R` (Mac)
- O abre en modo incógnito para probar

#### **4. Verificar en Console del Navegador:**
1. Presiona `F12`
2. Ve a la pestaña **"Console"**
3. Busca mensajes:
   - ✅ `"✅ Productos sincronizados: X"` = Funciona
   - ❌ `"❌ Error en sincronización:"` = Hay problema
   - ⚠️ `"Error de permisos en Firestore"` = Reglas mal configuradas

---

## 🎯 Checklist de Verificación:

- [ ] Reglas de Firestore configuradas (Opción 1)
- [ ] Reglas publicadas (click en "Publish")
- [ ] Usuario autenticado en ambos dispositivos
- [ ] Caché limpiado
- [ ] Console del navegador sin errores
- [ ] Productos aparecen en Firebase Console → Firestore → productos

---

## 📞 Si Sigue Sin Funcionar:

1. **Verifica en Firebase Console → Firestore:**
   - Ve a la colección `productos`
   - ¿Están ahí los productos?
   - Si SÍ → Problema de reglas o autenticación
   - Si NO → Problema al guardar

2. **Prueba desde otro navegador:**
   - Chrome
   - Firefox
   - Safari
   - Modo incógnito

3. **Verifica la conexión:**
   - ¿Tienes internet estable?
   - ¿Firebase está funcionando? ([status.firebase.google.com](https://status.firebase.google.com))

---

**Después de configurar las reglas, el problema debería resolverse** ✅
