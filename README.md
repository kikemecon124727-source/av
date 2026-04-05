# 🚀 Jessica Ale Suarez - Catálogo con IA

Catálogo de productos elegante con detección de colores mediante IA, autenticación Firebase y modo oscuro personalizado.

## ✨ Características

- 🎨 **Detección de colores con IA** - Detecta automáticamente colores basándose en descripciones
- 🔐 **Autenticación Firebase** - Login seguro para panel de administración
- 📱 **Responsive Design** - Funciona perfecto en móvil, tablet y desktop
- 🌙 **Modo Oscuro Elegante** - Negro con toques morados
- 🖼️ **Compresión de Imágenes** - Convierte a WebP automáticamente
- 🔍 **Búsqueda Tiffany-Style** - Overlay elegante de búsqueda
- 📦 **Base64 Storage** - Imágenes almacenadas en Firestore (sin costos adicionales)

## 🛠️ Tech Stack

**Frontend:**
- React
- Tailwind CSS
- Firebase (Auth + Firestore)

**Backend:**
- FastAPI
- Emergent Integrations (IA)
- Python 3.11+

## 📦 Deployment

### 1️⃣ **Backend en Render.com** (GRATIS)

1. Ve a [render.com](https://render.com) y crea una cuenta
2. **New Web Service** → Conecta tu repositorio de GitHub
3. **Configuración:**
   - **Name:** `jessicaalesuarez-backend`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/`
   - **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`

4. **Environment Variables:**
   ```
   EMERGENT_LLM_KEY=sk-emergent-347AcD1Ff287fA088A
   CORS_ORIGINS=*
   ```

5. Click **"Create Web Service"**
6. **Copia la URL** que te da (ej: `https://jessicaalesuarez-backend.onrender.com`)

---

### 2️⃣ **Frontend en Vercel** (GRATIS)

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta
2. **New Project** → Import desde GitHub
3. **Configuración:**
   - **Project Name:** `jessicaalesuarez-catalogo`
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `yarn build`
   - **Output Directory:** `build`
   - **Install Command:** `yarn install`

4. **Environment Variables** (agregar TODAS):
   ```
   REACT_APP_FIREBASE_API_KEY=AIzaSyAfGUY4o4Q82aUL0_Q_i_V3F3LrFo_ili4
   REACT_APP_FIREBASE_AUTH_DOMAIN=jessica-61abf.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=jessica-61abf
   REACT_APP_FIREBASE_STORAGE_BUCKET=jessica-61abf.firebasestorage.app
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=768498636608
   REACT_APP_FIREBASE_APP_ID=1:768498636608:web:857cc073ba02c6d7b00ca5
   REACT_APP_BACKEND_URL=https://jessicaalesuarez-backend.onrender.com
   ```
   ⚠️ **IMPORTANTE:** Cambia `REACT_APP_BACKEND_URL` por la URL de tu backend en Render

5. Click **"Deploy"**

---

## 🔑 Credenciales de Prueba

**Admin Panel:** `/admin`
- Email: `edgar561737@gmail.com`
- Password: `Edgar123e`

---

## ⚙️ Desarrollo Local

### Backend:
```bash
cd backend
pip install -r requirements.txt --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### Frontend:
```bash
cd frontend
yarn install
yarn start
```

---

## 📝 Notas Importantes

- ⚠️ **Render Free Tier:** El backend se "duerme" después de 15 min sin uso. Primera visita tarda ~30-60 seg.
- 🔥 **Firebase:** Asegúrate de tener configurado Firestore en modo prueba o producción
- 🎨 **Detección de Colores:** Funciona con Emergent LLM Key (incluida en el código)

---

## 🎨 Características del Diseño

**Modo Claro:**
- Fondo: Blanco/Beige elegante
- Letras: Negras

**Modo Oscuro:**
- Fondo: Negro con gradiente morado (`#0a0a0a`, `#1a1520`)
- Tarjetas: Morado oscuro (`#1a1520`)
- Letras: Blancas
- Acentos: Morados claros

---

## 📄 Licencia

Este proyecto es privado y de uso exclusivo para Jessica Ale Suarez.

---

**¿Necesitas ayuda?** Contacta al desarrollador.
