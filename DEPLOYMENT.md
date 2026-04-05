# 📘 INSTRUCCIONES DE DEPLOYMENT

## 🎯 Objetivo
Desplegar el catálogo Jessica Ale Suarez usando:
- **GitHub** (código)
- **Render.com** (backend - GRATIS)
- **Vercel** (frontend - GRATIS)

---

## 📋 PASO 1: Subir a GitHub

### Opción A: Desde Emergent
1. Click en **"Push to GitHub"** o **"Save to GitHub"**
2. Listo ✅

### Opción B: Manual
1. Descarga el código desde Emergent
2. Crea un repositorio en GitHub
3. Sube el código:
```bash
git init
git add .
git commit -m "Initial commit - Jessica Ale Suarez Catálogo"
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

---

## 🔧 PASO 2: Desplegar Backend en Render

### 2.1 Crear Web Service

1. Ve a [render.com](https://render.com)
2. Crea una cuenta / Login
3. Click en **"New +"** → **"Web Service"**
4. Conecta tu repositorio de GitHub
5. Selecciona el repositorio del catálogo

### 2.2 Configuración del Servicio

**Name:**
```
jessicaalesuarez-backend
```

**Root Directory:**
```
backend
```

**Runtime:**
```
Python 3
```

**Build Command:**
```
pip install -r requirements.txt --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
```

**Start Command:**
```
uvicorn server:app --host 0.0.0.0 --port $PORT
```

### 2.3 Environment Variables

Click en **"Environment"** y agrega:

**Variable 1:**
- Key: `EMERGENT_LLM_KEY`
- Value: `sk-emergent-347AcD1Ff287fA088A`

**Variable 2:**
- Key: `CORS_ORIGINS`
- Value: `*`

### 2.4 Deploy

1. Click **"Create Web Service"**
2. Espera 5-10 minutos
3. ✅ Debería mostrar "Live" en verde
4. **COPIA LA URL** (ej: `https://jessicaalesuarez-backend.onrender.com`)

### 2.5 Verificar

Abre en el navegador:
```
https://TU-BACKEND-URL.onrender.com/api/
```

Debería mostrar:
```json
{"message":"Backend API - Jessica Ale Suarez Catálogo"}
```

---

## 🌐 PASO 3: Desplegar Frontend en Vercel

### 3.1 Crear Proyecto

1. Ve a [vercel.com](https://vercel.com)
2. Crea una cuenta / Login
3. Click en **"Add New..."** → **"Project"**
4. Click en **"Import Git Repository"**
5. Selecciona tu repositorio de GitHub

### 3.2 Configuración del Proyecto

**Project Name:**
```
jessicaalesuarez-catalogo
```

**Framework Preset:**
```
Create React App
```

**Root Directory:**
```
frontend
```

Click en **"Edit"** en Build Settings:

**Build Command:**
```
yarn build
```

**Output Directory:**
```
build
```

**Install Command:**
```
yarn install
```

### 3.3 Environment Variables ⚠️ IMPORTANTE

Click en **"Environment Variables"** y agrega TODAS estas:

```
REACT_APP_FIREBASE_API_KEY=AIzaSyAfGUY4o4Q82aUL0_Q_i_V3F3LrFo_ili4
REACT_APP_FIREBASE_AUTH_DOMAIN=jessica-61abf.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=jessica-61abf
REACT_APP_FIREBASE_STORAGE_BUCKET=jessica-61abf.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=768498636608
REACT_APP_FIREBASE_APP_ID=1:768498636608:web:857cc073ba02c6d7b00ca5
REACT_APP_BACKEND_URL=https://TU-BACKEND-DE-RENDER.onrender.com
```

⚠️ **MUY IMPORTANTE:**
- Cambia `TU-BACKEND-DE-RENDER.onrender.com` por la URL que copiaste de Render
- NO agregues `/api` al final
- Ejemplo correcto: `https://jessicaalesuarez-backend.onrender.com`

### 3.4 Deploy

1. Click **"Deploy"**
2. Espera 3-5 minutos
3. ✅ Debería mostrar "Ready" con un link
4. Click en el link para ver tu sitio

---

## ✅ VERIFICACIÓN FINAL

### Backend:
```
https://tu-backend.onrender.com/api/
```
Debe mostrar mensaje de bienvenida ✅

### Frontend - Página Principal:
```
https://tu-frontend.vercel.app/
```
Debe mostrar el catálogo con el hero "JESSICA ALESUAREZ" ✅

### Frontend - Admin:
```
https://tu-frontend.vercel.app/admin
```
Debe mostrar login de Firebase ✅

**Login:**
- Email: `edgar561737@gmail.com`
- Password: `Edgar123e`

---

## 🐛 TROUBLESHOOTING

### Problema: Backend falla en Render

**Solución:**
1. Ve a **Logs** en Render
2. Busca el error
3. Verifica que el **Build Command** incluya `--extra-index-url`
4. Verifica que las Environment Variables estén configuradas

### Problema: Frontend en blanco en Vercel

**Solución:**
1. Ve a **Deployments** → Click en el último
2. Ve a **"Build Logs"**
3. Busca errores
4. **Verifica que todas las variables de entorno empiecen con `REACT_APP_`**
5. Redeploy: Settings → Deployments → Click en "..." → Redeploy

### Problema: Frontend funciona pero no se conecta al backend

**Solución:**
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Network"
3. Verifica que las llamadas vayan a la URL correcta de Render
4. En Vercel, verifica que `REACT_APP_BACKEND_URL` esté correcto
5. Redeploy frontend después de corregir

### Problema: Backend se "duerme"

**Es normal en el plan gratuito:**
- Se duerme después de 15 min sin uso
- Primera visita tarda 30-60 segundos en despertar
- Solución: Usar un servicio de ping (ej: UptimeRobot) GRATIS

---

## 📝 CHECKLIST FINAL

Backend en Render:
- [ ] Web Service creado
- [ ] Root Directory: `backend`
- [ ] Build Command con `--extra-index-url`
- [ ] Start Command correcto
- [ ] Environment Variables configuradas
- [ ] Deploy exitoso (verde "Live")
- [ ] URL copiada

Frontend en Vercel:
- [ ] Proyecto creado
- [ ] Root Directory: `frontend`
- [ ] Build/Output configurado
- [ ] TODAS las variables de entorno agregadas
- [ ] `REACT_APP_BACKEND_URL` correcto
- [ ] Deploy exitoso
- [ ] Sitio funcionando

Verificación:
- [ ] Backend responde en `/api/`
- [ ] Frontend carga correctamente
- [ ] Login funciona (`/admin`)
- [ ] Modo oscuro funciona
- [ ] Se pueden crear productos

---

## 🎉 ¡LISTO!

Tu catálogo está online y funcionando. Ahora puedes:
- Compartir la URL de Vercel con clientes
- Administrar productos desde `/admin`
- (Opcional) Configurar dominio personalizado en Vercel

**URLs Finales:**
- Frontend: `https://tu-proyecto.vercel.app`
- Admin: `https://tu-proyecto.vercel.app/admin`
- Backend API: `https://tu-backend.onrender.com/api/`

---

**¿Problemas?** Revisa la sección de Troubleshooting arriba ☝️
