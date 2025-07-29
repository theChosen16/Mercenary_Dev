# Guía de Mantenimiento - Website Mercenary

## 🔧 Mantenimiento Rutinario

### Tareas Semanales:
- [ ] Verificar funcionamiento del formulario de contacto
- [ ] Revisar métricas de analytics (tiempo en página, bounce rate)
- [ ] Comprobar velocidad de carga (< 2 segundos)
- [ ] Verificar enlaces internos y externos
- [ ] Revisar logs de errores

### Tareas Mensuales:
- [ ] Actualizar contenido si hay cambios en el proyecto
- [ ] Revisar y actualizar meta descriptions para SEO
- [ ] Verificar compatibilidad con nuevas versiones de navegadores
- [ ] Backup completo del website
- [ ] Análisis de performance con Lighthouse

### Tareas Trimestrales:
- [ ] Actualizar dependencias externas (Google Fonts, Font Awesome)
- [ ] Revisar y optimizar imágenes
- [ ] Análisis completo de SEO y posicionamiento
- [ ] Revisión de seguridad y headers HTTP
- [ ] Actualización de documentación técnica

## 📊 Monitoreo y Analytics

### Métricas Clave a Monitorear:

#### Performance:
- **Tiempo de Carga:** < 2 segundos
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1

#### Engagement:
- **Tiempo en Página:** > 2 minutos
- **Bounce Rate:** < 60%
- **Scroll Depth:** > 75%
- **Conversión Formulario:** > 5%

#### Técnicas:
- **Uptime:** > 99.9%
- **Error Rate:** < 0.1%
- **Mobile Performance:** > 90 (Lighthouse)
- **Desktop Performance:** > 95 (Lighthouse)

### Herramientas de Monitoreo:

#### Google Analytics 4:
```javascript
// Configuración básica
gtag('config', 'GA_MEASUREMENT_ID', {
  page_title: 'Mercenary - Plataforma de Freelancers',
  page_location: window.location.href,
  content_group1: 'Website Informacional'
});

// Eventos personalizados
gtag('event', 'form_submit', {
  event_category: 'engagement',
  event_label: 'contact_form'
});
```

#### Google Search Console:
- Indexación de páginas
- Errores de rastreo
- Performance en búsquedas
- Core Web Vitals

## 🔄 Actualizaciones de Contenido

### Secciones que Pueden Requerir Updates:

#### 1. Hero Section:
```html
<!-- Actualizar estadísticas del proyecto -->
<div class="hero-stats">
    <div class="stat">
        <span class="stat-number">100%</span>
        <span class="stat-label">Funcional</span>
    </div>
    <!-- Actualizar según progreso -->
</div>
```

#### 2. Technology Section:
```html
<!-- Actualizar versiones de tecnologías -->
<div class="tech-item">
    <img src="flutter-icon.svg" alt="Flutter">
    <span>Flutter 3.32.8</span> <!-- Actualizar versión -->
</div>
```

#### 3. Status Section:
```html
<!-- Actualizar estado del proyecto -->
<div class="status-item completed">
    <h3>Lanzamiento</h3>
    <p>En Producción</p> <!-- Cambiar cuando se lance -->
</div>
```

### Proceso de Actualización:

#### 1. Desarrollo Local:
```bash
# Navegar al directorio
cd C:\Users\alean\Desktop\Mercenary_dev\website

# Iniciar servidor local
python -m http.server 8080

# Hacer cambios y verificar en http://localhost:8080
```

#### 2. Testing:
- Verificar cambios en múltiples dispositivos
- Comprobar que no se rompan funcionalidades existentes
- Validar HTML/CSS
- Ejecutar Lighthouse audit

#### 3. Deployment:
```bash
# Git workflow
git add .
git commit -m "Update: descripción de cambios"
git push origin main

# Deployment automático en Netlify/Vercel
```

## 🛡️ Seguridad y Backups

### Medidas de Seguridad:

#### Headers HTTP:
```apache
# Verificar periódicamente estos headers
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

#### Certificado SSL:
- Verificar expiración cada 3 meses
- Renovación automática configurada
- Redirect HTTP → HTTPS funcionando

### Estrategia de Backup:

#### 1. Código Fuente:
- **Git Repository:** Backup automático en GitHub
- **Branches:** main (producción), develop (desarrollo)
- **Commits:** Frecuentes con mensajes descriptivos

#### 2. Archivos Estáticos:
```bash
# Backup manual mensual
zip -r mercenary-website-backup-$(date +%Y%m%d).zip website/

# Almacenar en:
# - Google Drive
# - Dropbox
# - AWS S3 (recomendado para producción)
```

#### 3. Base de Datos (si se agrega):
```bash
# Para futuras funcionalidades con BD
pg_dump mercenary_db > backup_$(date +%Y%m%d).sql
```

## 🔍 Troubleshooting Común

### Problemas Frecuentes y Soluciones:

#### 1. Formulario No Funciona:
```javascript
// Verificar configuración Netlify
<form name="contact" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="contact" />
  <!-- Resto del formulario -->
</form>
```

#### 2. Imágenes No Cargan:
```html
<!-- Verificar rutas relativas -->
<img src="./assets/images/logo.png" alt="Logo" 
     onerror="this.style.display='none'">
```

#### 3. CSS No Se Aplica:
```html
<!-- Verificar MIME type -->
<link rel="stylesheet" type="text/css" href="styles/main.css">
```

#### 4. JavaScript No Ejecuta:
```html
<!-- Verificar orden de carga -->
<script src="scripts/main.js" defer></script>
```

#### 5. Performance Lenta:
```css
/* Optimizar animaciones */
.feature-card {
  will-change: transform;
  transform: translateZ(0); /* Hardware acceleration */
}
```

### Logs de Error:

#### Browser Console:
```javascript
// Monitorear errores JavaScript
window.addEventListener('error', (e) => {
  console.error('Error:', e.error);
  // Enviar a servicio de monitoring
});
```

#### Server Logs:
```python
# En server.py para desarrollo
import logging
logging.basicConfig(level=logging.INFO)

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        logging.info(f"{self.address_string()} - {format % args}")
```

## 📈 Optimización Continua

### A/B Testing (Futuro):
```html
<!-- Diferentes versiones de CTAs -->
<button class="btn btn-primary" data-variant="a">
  Comenzar Ahora
</button>

<button class="btn btn-primary" data-variant="b">
  Únete Gratis
</button>
```

### Performance Optimization:

#### 1. Lazy Loading:
```javascript
// Para imágenes futuras
const images = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      imageObserver.unobserve(img);
    }
  });
});
```

#### 2. Critical CSS:
```html
<!-- Inline critical CSS -->
<style>
  /* Critical above-the-fold styles */
  .hero { /* styles */ }
  .navbar { /* styles */ }
</style>

<!-- Load non-critical CSS asynchronously -->
<link rel="preload" href="styles/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

## 📋 Checklist de Mantenimiento

### Semanal:
- [ ] Verificar uptime (> 99.9%)
- [ ] Comprobar formulario de contacto
- [ ] Revisar Google Analytics
- [ ] Verificar velocidad de carga
- [ ] Comprobar enlaces rotos

### Mensual:
- [ ] Backup completo del sitio
- [ ] Análisis de performance (Lighthouse)
- [ ] Revisión de contenido actualizado
- [ ] Verificar compatibilidad navegadores
- [ ] Análisis de métricas SEO

### Trimestral:
- [ ] Actualizar dependencias externas
- [ ] Revisar headers de seguridad
- [ ] Optimizar imágenes y assets
- [ ] Análisis completo de analytics
- [ ] Actualizar documentación

### Anual:
- [ ] Renovar certificado SSL (si es manual)
- [ ] Revisar y actualizar diseño
- [ ] Análisis completo de UX
- [ ] Actualizar stack tecnológico
- [ ] Revisión de seguridad completa

## 🚨 Plan de Contingencia

### En Caso de Caída del Sitio:

#### 1. Diagnóstico Rápido:
```bash
# Verificar conectividad
ping mercenary.cl

# Verificar DNS
nslookup mercenary.cl

# Verificar certificado SSL
openssl s_client -connect mercenary.cl:443
```

#### 2. Acciones Inmediatas:
1. Verificar status de hosting provider
2. Comprobar configuración DNS
3. Revisar logs de error
4. Contactar soporte técnico si es necesario

#### 3. Comunicación:
- Notificar a stakeholders
- Actualizar en redes sociales si aplica
- Documentar incidente para análisis posterior

### Contactos de Emergencia:
- **Hosting Provider:** [Información de contacto]
- **DNS Provider:** [Información de contacto]
- **Developer:** [Información de contacto]

## 📞 Soporte Técnico

### Información de Contacto:
- **Desarrollador Principal:** Proyecto Mercenary Team
- **Documentación:** `/Documentacion_web/`
- **Repositorio:** GitHub (si aplica)
- **Hosting:** Netlify/Vercel/Otro

### Escalación de Problemas:
1. **Nivel 1:** Problemas menores (contenido, enlaces)
2. **Nivel 2:** Problemas técnicos (performance, funcionalidad)
3. **Nivel 3:** Problemas críticos (caída del sitio, seguridad)

---

*Esta guía de mantenimiento asegura la operación continua y óptima del website informacional de Mercenary.*
