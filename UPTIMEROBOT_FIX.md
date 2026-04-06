# 🔧 Solución UptimeRobot - Aumentar Timeout

## ✅ El endpoint `/api/health` FUNCIONA

Acabo de probar tu endpoint y responde correctamente:
```json
{"status":"ok","message":"Backend is alive","service":"Jessica Ale Suarez Catálogo"}
```

## ❗ El Problema: TIMEOUT

Tu backend en Render (plan gratuito) tarda **~30 segundos** en despertar cuando está dormido.

UptimeRobot tiene un timeout por defecto de **30 segundos**, pero a veces no es suficiente.

---

## 🔧 Solución en UptimeRobot

### Paso 1: Edita tu Monitor
1. Ve a **UptimeRobot Dashboard**
2. Encuentra tu monitor
3. Clic en **Edit**

### Paso 2: Aumenta el Timeout
1. Busca la opción **"Timeout"**
2. Cambia de `30` a **`60` segundos**
3. **Save**

### Paso 3: Configura Retry
1. En el mismo monitor, busca **"Advanced Settings"** o **"Configuración Avanzada"**
2. Activa **"Retry"** o **"Reintentar"**
3. Configura:
   - **Retry Count**: 2 reintentos
   - **Retry Interval**: 60 segundos
4. **Save**

---

## 🎯 Configuración Recomendada

```
Monitor Type: HTTP(s)
URL: https://jessicaalesuarez-backend1.onrender.com/api/health
Monitoring Interval: 5 minutes
Timeout: 60 seconds ⬅️ IMPORTANTE
Retry on failure: Yes
Retry count: 2
```

---

## 💡 ¿Por qué tarda tanto?

**Render (plan gratuito)**:
- Se duerme después de 15 minutos sin actividad
- Tarda **15-45 segundos** en despertar
- La primera petición siempre es lenta

**UptimeRobot**:
- Timeout por defecto: 30 segundos
- Si el backend no responde en 30s → marca ERROR
- Con timeout de 60s → le da más tiempo a Render

---

## 🚀 Alternativa: Cambiar intervalo de monitoreo

Si sigues teniendo problemas:

1. Cambia el intervalo de **5 minutos** a **3 minutos**
2. Así Render nunca se duerme completamente
3. Las respuestas serán más rápidas

**Configuración**:
```
Monitoring Interval: 3 minutes (en vez de 5)
```

---

## ✅ Después de estos cambios

- ✅ UptimeRobot marcará tu sitio como **UP** (verde)
- ✅ Tu backend nunca se dormirá
- ✅ Los usuarios no verán tiempos de espera

---

## 🔍 Verificación

Después de hacer los cambios, espera **10 minutos** y verifica:

1. Estado del monitor debe ser **UP** (verde)
2. Response time: ~500ms (cuando está despierto)
3. Sin errores en el historial

---

**¡Con estos cambios UptimeRobot funcionará perfectamente!** 🎉
