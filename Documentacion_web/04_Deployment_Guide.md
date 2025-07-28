# Guía de Deployment - Website Mercenary

## 🚀 Opciones de Deployment

El website informacional de Mercenary está diseñado como una aplicación estática que puede ser desplegada en múltiples plataformas. A continuación se presentan las opciones recomendadas:

## 📋 Pre-requisitos

### Archivos Necesarios:
```
website/
├── index.html              # ✅ Página principal
├── styles/
│   └── main.css            # ✅ Estilos completos
├── scripts/
│   └── main.js             # ✅ Funcionalidad JavaScript
├── assets/                 # 📁 Recursos (opcional)
│   ├── images/
│   ├── icons/
│   └── favicon.ico
└── .htaccess              # 🔧 Configuración Apache (crear)
```

### Verificaciones Pre-Deployment:
- ✅ Todos los archivos presentes
- ✅ Links internos funcionando
- ✅ Formularios validados
- ✅ Responsive design verificado
- ✅ Performance optimizado
- ✅ SEO meta tags completos

## 🌐 Opción 1: Netlify (Recomendado)

### Ventajas:
- ✅ Deployment automático desde Git
- ✅ CDN global incluido
- ✅ HTTPS automático
- ✅ Formularios manejados sin backend
- ✅ Dominio personalizado gratuito
- ✅ Preview deployments

### 🚀 Estado Actual del Deployment

**Estado:** ✅ COMPLETADO Y EN VIVO
**URL Pública:** https://mercenary-job.netlify.app/
**Plataforma:** Netlify
**HTTPS:** ✅ Habilitado automáticamente
**Fecha de Deployment:** 28 de Julio, 2025
**Repositorio:** https://github.com/theChosen16/mercenary-websitery_dev\website

### Pasos de Deployment:

#### 1. Preparar Repositorio Git
```bash
# Navegar a la carpeta del website
cd C:\Users\alean\Desktop\Mercenary_dev\website

# Inicializar Git (si no existe)
git init

# Agregar archivos
git add .
git commit -m "Initial website deployment"

# Conectar con GitHub
git remote add origin https://github.com/tuusuario/mercenary-website.git
git push -u origin main
```

#### 2. Configurar Netlify
1. Ir a [netlify.com](https://netlify.com)
2. Crear cuenta o iniciar sesión
3. Click "New site from Git"
4. Conectar con GitHub
5. Seleccionar repositorio `mercenary-website`
6. Configurar build settings:
   - **Build command:** (vacío)
   - **Publish directory:** `.`
   - **Branch:** `main`

#### 3. Configuración Avanzada
Crear archivo `netlify.toml`:
```toml
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[form]
  # Configuración para formulario de contacto
  name = "contact"
  action = "/thank-you"
```

#### 4. Dominio Personalizado
```
# Opciones de dominio:
- mercenary.netlify.app (gratuito)
- mercenary.cl (personalizado)
- www.mercenary.cl (con www)
```

### Formulario de Contacto en Netlify:
Modificar el formulario en `index.html`:
```html
<form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field">
    <input type="hidden" name="form-name" value="contact" />
    <div style="display: none;">
        <input name="bot-field" />
    </div>
    <!-- Resto del formulario -->
</form>
```

## 🌐 Opción 2: Vercel

### Ventajas:
- ✅ Deployment ultra-rápido
- ✅ Edge Network global
- ✅ Analytics incluidos
- ✅ Preview deployments
- ✅ Integración Git automática

### Pasos de Deployment:

#### 1. Instalar Vercel CLI
```bash
npm install -g vercel
```

#### 2. Deploy desde CLI
```bash
# Navegar a la carpeta del website
cd C:\Users\alean\Desktop\Mercenary_dev\website

# Login a Vercel
vercel login

# Deploy
vercel

# Seguir prompts:
# - Set up and deploy? Y
# - Which scope? (seleccionar cuenta)
# - Link to existing project? N
# - Project name: mercenary-website
# - Directory: ./
```

#### 3. Configuración `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "**/*",
      "use": "@vercel/static"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

## 🌐 Opción 3: GitHub Pages

### Ventajas:
- ✅ Completamente gratuito
- ✅ Integración directa con GitHub
- ✅ Dominio personalizado soportado
- ✅ HTTPS automático

### Pasos de Deployment:

#### 1. Subir a GitHub
```bash
# Crear repositorio en GitHub: mercenary-website
# Subir archivos
git init
git add .
git commit -m "Deploy to GitHub Pages"
git remote add origin https://github.com/tuusuario/mercenary-website.git
git push -u origin main
```

#### 2. Activar GitHub Pages
1. Ir a Settings del repositorio
2. Scroll hasta "Pages"
3. Source: "Deploy from a branch"
4. Branch: `main`
5. Folder: `/ (root)`
6. Save

#### 3. Dominio Personalizado (Opcional)
Crear archivo `CNAME`:
```
mercenary.cl
```

### URL Final:
- `https://tuusuario.github.io/mercenary-website`
- `https://mercenary.cl` (con dominio personalizado)

## 🌐 Opción 4: Hosting Tradicional (cPanel)

### Para Hosting Compartido:

#### 1. Preparar Archivos
```bash
# Comprimir archivos del website
zip -r mercenary-website.zip website/
```

#### 2. Subir vía FTP/cPanel
1. Acceder a cPanel del hosting
2. Ir a "File Manager"
3. Navegar a `public_html/`
4. Subir y extraer `mercenary-website.zip`

#### 3. Configurar .htaccess
```apache
# .htaccess para Apache
RewriteEngine On

# HTTPS Redirect
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Security Headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Cache Control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

## 🔧 Optimizaciones Pre-Deployment

### 1. Minificación de Archivos

#### CSS Minification:
```bash
# Usando herramientas online o CLI
# cssnano, clean-css, etc.
npx clean-css-cli styles/main.css -o styles/main.min.css
```

#### JavaScript Minification:
```bash
# Usando terser o uglify
npx terser scripts/main.js -o scripts/main.min.js
```

### 2. Optimización de Imágenes
```bash
# Comprimir imágenes (cuando se agreguen)
# imagemin, tinypng, etc.
```

### 3. Verificación de Performance
```bash
# Lighthouse audit
npx lighthouse http://localhost:8080 --output html --output-path report.html

# Métricas objetivo:
# - Performance: > 90
# - Accessibility: > 95
# - Best Practices: > 90
# - SEO: > 95
```

## 📊 Monitoreo Post-Deployment

### Analytics:
```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Uptime Monitoring:
- UptimeRobot (gratuito)
- Pingdom
- StatusCake

### Error Tracking:
```javascript
// Sentry para error tracking
window.addEventListener('error', (e) => {
    // Log error to monitoring service
    console.error('Website Error:', e.error);
});
```

## 🔒 Consideraciones de Seguridad

### Headers de Seguridad:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'
```

### HTTPS:
- ✅ Certificado SSL/TLS obligatorio
- ✅ Redirect HTTP → HTTPS
- ✅ HSTS headers recomendados

## 📋 Checklist de Deployment

### Pre-Deployment:
- [ ] Archivos completos y verificados
- [ ] Links internos funcionando
- [ ] Formularios validados
- [ ] Responsive design testado
- [ ] Performance optimizado (Lighthouse > 90)
- [ ] SEO meta tags completos
- [ ] Favicon agregado
- [ ] 404 page creada (opcional)

### Durante Deployment:
- [ ] Plataforma seleccionada
- [ ] Repositorio configurado (si aplica)
- [ ] Build settings correctos
- [ ] Dominio configurado
- [ ] SSL/HTTPS activado
- [ ] Headers de seguridad configurados

### Post-Deployment:
- [ ] Website accesible en producción
- [ ] Todas las secciones funcionando
- [ ] Formulario de contacto operativo
- [ ] Analytics configurado
- [ ] Monitoring activado
- [ ] Performance verificado
- [ ] SEO indexación iniciada

## 🎯 Recomendación Final

**Para el proyecto Mercenary, se recomienda Netlify** por las siguientes razones:

1. **Simplicidad:** Deployment automático desde Git
2. **Performance:** CDN global incluido
3. **Funcionalidad:** Manejo de formularios sin backend
4. **Costo:** Plan gratuito suficiente para el proyecto
5. **Escalabilidad:** Fácil upgrade cuando sea necesario
6. **Dominio:** Posibilidad de usar mercenary.cl

### URL Final Sugerida:
- **Desarrollo:** `https://mercenary-dev.netlify.app`
- **Producción:** `https://mercenary.cl`

---

*Esta guía proporciona todas las opciones y pasos necesarios para desplegar exitosamente el website informacional de Mercenary.*
