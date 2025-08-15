# 🔐 Guía de Configuración de Credenciales - Mercenary Platform

**Fecha:** 30 de Enero, 2025  
**Estado:** Configuración en progreso

---

## 🎯 **Resumen de Configuración**

Esta guía te llevará paso a paso para configurar todas las credenciales necesarias para que la plataforma Mercenary funcione completamente en producción.

### **🔧 Servicios a Configurar:**
1. **🗄️ Supabase** (Base de datos PostgreSQL)
2. **🔑 Google OAuth** (Autenticación social)
3. **🐙 GitHub OAuth** (Autenticación social)
4. **🚀 Vercel** (Variables de entorno en producción)

---

## 🗄️ **1. Configuración de Supabase**

### **Paso 1: Crear Proyecto en Supabase**
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Haz clic en **"New Project"**
4. Configura:
   - **Name:** `mercenary-platform`
   - **Database Password:** (guarda esta contraseña)
   - **Region:** Closest to your users
5. Espera a que se cree el proyecto (2-3 minutos)

### **Paso 2: Obtener Credenciales**
En tu proyecto de Supabase, ve a **Settings > API**:

```bash
# Copia estos valores:
Project URL: https://[YOUR-PROJECT-REF].supabase.co
anon public key: eyJ... (clave pública)
service_role key: eyJ... (clave privada - ¡MANTÉN SECRETA!)
```

### **Paso 3: Obtener Database URL**
En **Settings > Database**:

```bash
# Connection string:
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

### **Paso 4: Actualizar .env.local**
```bash
# Supabase Configuration
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"
```

### **Paso 5: Migrar Base de Datos**
```bash
# En el terminal del proyecto:
npx prisma db push
npx prisma generate
```

---

## 🔑 **2. Configuración de Google OAuth**

### **Paso 1: Google Cloud Console**
1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google+ API**

### **Paso 2: Crear Credenciales OAuth**
1. Ve a **APIs & Services > Credentials**
2. Haz clic en **"Create Credentials" > "OAuth 2.0 Client IDs"**
3. Configura:
   - **Application type:** Web application
   - **Name:** Mercenary Platform
   - **Authorized JavaScript origins:**
     - `http://localhost:3000` (desarrollo)
     - `https://mercenary-dev.vercel.app` (producción)
   - **Authorized redirect URIs:**
     - `http://localhost:3000/api/auth/callback/google`
     - `https://mercenary-dev.vercel.app/api/auth/callback/google`

### **Paso 3: Obtener Credenciales**
```bash
# Copia estos valores:
Client ID: 123456789-abc...googleusercontent.com
Client Secret: GOCSPX-...
```

### **Paso 4: Actualizar .env.local**
```bash
# Google OAuth
GOOGLE_CLIENT_ID="123456789-abc...googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."
```

---

## 🐙 **3. Configuración de GitHub OAuth**

### **Paso 1: GitHub Developer Settings**
1. Ve a [github.com/settings/developers](https://github.com/settings/developers)
2. Haz clic en **"New OAuth App"**

### **Paso 2: Configurar OAuth App**
```bash
Application name: Mercenary Platform
Homepage URL: https://mercenary-dev.vercel.app
Authorization callback URL: https://mercenary-dev.vercel.app/api/auth/callback/github

# Para desarrollo local también agrega:
Authorization callback URL: http://localhost:3000/api/auth/callback/github
```

### **Paso 3: Obtener Credenciales**
```bash
# Después de crear la app:
Client ID: Iv1.abc123...
Client Secret: (genera un nuevo client secret)
```

### **Paso 4: Actualizar .env.local**
```bash
# GitHub OAuth
GITHUB_CLIENT_ID="Iv1.abc123..."
GITHUB_CLIENT_SECRET="github_pat_..."
```

---

## 🚀 **4. Configuración en Vercel (Producción)**

### **Paso 1: Vercel Dashboard**
1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto **mercenary-dev**
3. Ve a **Settings > Environment Variables**

### **Paso 2: Agregar Variables**
Agrega todas las variables de tu `.env.local`:

```bash
# NextAuth
NEXTAUTH_URL=https://mercenary-dev.vercel.app
NEXTAUTH_SECRET=mercenary-super-secret-jwt-key-2025-production-ready

# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE-KEY]

# OAuth
GOOGLE_CLIENT_ID=[GOOGLE-CLIENT-ID]
GOOGLE_CLIENT_SECRET=[GOOGLE-SECRET]
GITHUB_CLIENT_ID=[GITHUB-CLIENT-ID]
GITHUB_CLIENT_SECRET=[GITHUB-SECRET]
```

### **Paso 3: Redeploy**
```bash
# Después de agregar variables:
git push origin main
# Vercel redeployará automáticamente
```

---

## ✅ **5. Verificación de Configuración**

### **Checklist de Verificación:**
- [ ] **Supabase:** Proyecto creado y credenciales obtenidas
- [ ] **Google OAuth:** App creada y credenciales configuradas
- [ ] **GitHub OAuth:** App creada y credenciales configuradas
- [ ] **Variables locales:** `.env.local` actualizado
- [ ] **Variables producción:** Vercel configurado
- [ ] **Base de datos:** `npx prisma db push` ejecutado
- [ ] **Testing:** Login con Google y GitHub funcionando

### **Comandos de Testing:**
```bash
# Verificar conexión a base de datos
npx prisma studio

# Verificar build
npm run build

# Verificar desarrollo
npm run dev
```

---

## 🚨 **Troubleshooting**

### **Errores Comunes:**

**1. Error de conexión a Supabase:**
```bash
# Verificar DATABASE_URL en .env.local
# Asegurar que la contraseña sea correcta
```

**2. OAuth redirect_uri_mismatch:**
```bash
# Verificar que las URLs de callback coincidan exactamente
# Incluir tanto localhost como producción
```

**3. Variables de entorno no cargadas:**
```bash
# Reiniciar servidor de desarrollo
# Verificar sintaxis en .env.local (sin espacios)
```

---

## 🎯 **Estado Actual**

- ✅ **Dependencias:** Supabase instalado
- ✅ **Variables:** Estructura creada en .env.local
- ⏳ **Credenciales:** Pendiente configuración manual
- ⏳ **Testing:** Pendiente verificación

---

**Próximo paso:** Configurar credenciales reales siguiendo esta guía paso a paso.

*Documentación generada el 30 de Enero, 2025*
