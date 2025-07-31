# 🗄️ Configuración de Base de Datos - PostgreSQL con Supabase

## 🎯 Objetivo: Configurar PostgreSQL para Autenticación

**Fecha:** 30 de Enero, 2025  
**Proveedor recomendado:** Supabase (Gratuito)  
**Alternativas:** Neon, Railway, PlanetScale  

---

## 🚀 Opción 1: Supabase (Recomendado - Gratuito)

### **Paso 1: Crear Cuenta en Supabase**
1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Regístrate con GitHub, Google o email
4. Verifica tu email si es necesario

### **Paso 2: Crear Nuevo Proyecto**
1. En el dashboard, haz clic en "New Project"
2. Selecciona tu organización (o crea una nueva)
3. Configuración del proyecto:
   - **Name:** `mercenary-platform`
   - **Database Password:** Genera una contraseña segura (¡guárdala!)
   - **Region:** Selecciona la más cercana (US East, South America, etc.)
   - **Pricing Plan:** Free (hasta 500MB, 2 proyectos)

### **Paso 3: Obtener Credenciales de Conexión**
Una vez creado el proyecto:

1. Ve a **Settings → Database**
2. Busca la sección **Connection string**
3. Copia la **Connection string** (URI format)
4. También copia la **Direct connection** (para migraciones)

**Formato típico:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

---

## 🔧 Configuración en el Proyecto

### **Actualizar Variables de Entorno**

Reemplaza las URLs de ejemplo en `.env.local`:

```env
# Database Configuration (Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?schema=public&sslmode=require"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?schema=public&sslmode=require"
```

**⚠️ Importante:** 
- Reemplaza `[PASSWORD]` con tu contraseña real
- Reemplaza `[PROJECT-REF]` con la referencia de tu proyecto
- Mantén `?schema=public&sslmode=require` al final

---

## 🛠️ Comandos para Ejecutar

### **1. Verificar Conexión a la Base de Datos**
```bash
cd mercenary-web-platform
npx prisma db pull
```

### **2. Aplicar Migraciones (Crear Tablas)**
```bash
npx prisma db push
```

### **3. Generar Cliente de Prisma**
```bash
npx prisma generate
```

### **4. Verificar que Todo Funciona**
```bash
npx prisma studio
```

---

## 🗂️ Alternativas de Base de Datos

### **Opción 2: Neon (PostgreSQL Serverless)**
- **URL:** [https://neon.tech](https://neon.tech)
- **Plan gratuito:** 3GB, branching de DB
- **Ventaja:** Muy rápido, branching como Git

### **Opción 3: Railway**
- **URL:** [https://railway.app](https://railway.app)
- **Plan gratuito:** $5 de crédito mensual
- **Ventaja:** Deploy automático, muy simple

### **Opción 4: PlanetScale (MySQL)**
- **URL:** [https://planetscale.com](https://planetscale.com)
- **Plan gratuito:** 1 base de datos
- **Nota:** Requiere cambiar a MySQL en schema.prisma

---

## ✅ Verificación de Configuración

### **Checklist de Verificación:**
- [ ] Proyecto creado en Supabase
- [ ] Credenciales copiadas correctamente
- [ ] Variables de entorno actualizadas
- [ ] `npx prisma db push` ejecutado sin errores
- [ ] `npx prisma generate` completado
- [ ] Prisma Studio abre correctamente

### **Comandos de Verificación:**
```bash
# Verificar conexión
npx prisma db pull

# Ver tablas creadas
npx prisma studio

# Verificar que el cliente funciona
npm run type-check
```

---

## 🎮 Datos de Prueba (Opcional)

### **Crear Usuario de Prueba**
Una vez configurada la DB, puedes crear usuarios de prueba:

```sql
-- Ejecutar en Supabase SQL Editor
INSERT INTO "users" (id, email, name, role) VALUES 
('test-user-1', 'admin@mercenary.com', 'Admin Mercenary', 'ADMIN'),
('test-user-2', 'freelancer@mercenary.com', 'Freelancer Test', 'FREELANCER'),
('test-user-3', 'client@mercenary.com', 'Client Test', 'CLIENT');
```

---

## 🚨 Troubleshooting

### **Error: "Can't reach database server"**
- Verifica que la URL de conexión sea correcta
- Asegúrate de que `sslmode=require` esté incluido
- Verifica que la contraseña no tenga caracteres especiales sin escapar

### **Error: "Schema not found"**
- Agrega `?schema=public` al final de la URL
- Ejecuta `npx prisma db push` para crear el schema

### **Error: "SSL connection required"**
- Agrega `sslmode=require` al final de la URL de conexión

---

## 🎯 Próximos Pasos

Una vez configurada la base de datos:

1. **Testear autenticación** - Login/register funcionando
2. **Crear usuarios de prueba** - Para testing
3. **Verificar roles y permisos** - Sistema completo
4. **Integrar con app móvil** - APIs compartidas

---

## 📞 ¿Necesitas Ayuda?

Si encuentras algún problema:
1. Verifica las credenciales en Supabase
2. Revisa los logs de error en la consola
3. Asegúrate de que las variables de entorno estén correctas
4. Ejecuta los comandos paso a paso

**¡Estamos listos para configurar tu base de datos!** 🚀
