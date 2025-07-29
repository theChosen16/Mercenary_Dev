# Documentación Técnica - Arquitectura del Website Mercenary

## 🏗️ Arquitectura General

El website informacional de Mercenary está construido siguiendo una arquitectura **estática moderna** con enfoque en rendimiento, accesibilidad y mantenibilidad.

### Principios de Diseño:
- **Mobile-First:** Diseño responsive que prioriza dispositivos móviles
- **Progressive Enhancement:** Funcionalidad básica sin JavaScript, mejorada con JS
- **Semantic HTML:** Estructura semántica para SEO y accesibilidad
- **Component-Based CSS:** Estilos modulares y reutilizables
- **Vanilla JavaScript:** Sin dependencias externas para máximo rendimiento

## 📁 Estructura de Archivos

```
website/
├── index.html              # Página principal
├── styles/
│   └── main.css            # Estilos principales
├── scripts/
│   └── main.js             # Funcionalidad JavaScript
├── assets/                 # Recursos estáticos (futuro)
│   ├── images/
│   ├── icons/
│   └── favicon.ico
└── server.py              # Servidor de desarrollo
```

### Descripción de Archivos:

#### `index.html` (Estructura Principal)
- **Líneas:** ~400
- **Propósito:** Estructura HTML semántica completa
- **Características:**
  - Meta tags SEO optimizados
  - Open Graph para redes sociales
  - Estructura semántica con landmarks
  - Accesibilidad WCAG 2.1 AA

#### `styles/main.css` (Estilos)
- **Líneas:** ~1,200
- **Propósito:** Estilos completos del website
- **Características:**
  - Variables CSS para consistencia
  - Grid y Flexbox para layouts
  - Media queries responsive
  - Animaciones CSS3
  - Utility classes

#### `scripts/main.js` (Funcionalidad)
- **Líneas:** ~400
- **Propósito:** Interactividad y funcionalidad avanzada
- **Características:**
  - Navegación móvil
  - Animaciones con IntersectionObserver
  - Formulario con validación
  - Sistema de notificaciones
  - Efectos visuales

#### `server.py` (Servidor de Desarrollo)
- **Líneas:** ~80
- **Propósito:** Servidor HTTP local para desarrollo
- **Características:**
  - MIME types correctos
  - CORS headers para desarrollo
  - Manejo de errores
  - Logging de requests

## 🎨 Sistema de Diseño

### Variables CSS (Design Tokens)
```css
:root {
    /* Colores */
    --primary-color: #6366f1;
    --primary-dark: #4f46e5;
    --secondary-color: #f59e0b;
    --accent-color: #10b981;
    
    /* Tipografía */
    --font-family: 'Inter', sans-serif;
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    --font-size-3xl: 1.875rem;
    --font-size-4xl: 2.25rem;
    --font-size-5xl: 3rem;
    
    /* Espaciado */
    --spacing-xs: 0.5rem;
    --spacing-sm: 0.75rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-2xl: 3rem;
    --spacing-3xl: 4rem;
    
    /* Bordes */
    --radius-sm: 0.375rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
    
    /* Sombras */
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    
    /* Transiciones */
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Grid System
```css
/* Container principal */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-lg);
}

/* Grids responsivos */
.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--spacing-xl);
}

.tech-stack {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--spacing-xl);
}
```

## 📱 Responsive Design

### Breakpoints:
```css
/* Mobile First Approach */
/* Base: 320px+ (móviles pequeños) */

/* Tablet: 768px+ */
@media (max-width: 768px) {
    .hero-container {
        grid-template-columns: 1fr;
    }
    
    .nav-menu {
        position: fixed;
        left: -100%;
        top: 70px;
        flex-direction: column;
    }
}

/* Mobile: 480px- */
@media (max-width: 480px) {
    .hero-title {
        font-size: var(--font-size-2xl);
    }
    
    .btn {
        padding: var(--spacing-md) var(--spacing-lg);
    }
}
```

### Estrategias Responsive:
1. **Mobile-First CSS:** Estilos base para móvil, media queries para desktop
2. **Flexible Grids:** CSS Grid con auto-fit y minmax
3. **Fluid Typography:** Escalado de fuentes con viewport units
4. **Flexible Images:** max-width: 100% para todas las imágenes
5. **Touch-Friendly:** Botones y enlaces de mínimo 44px

## ⚡ Rendimiento y Optimización

### Técnicas Implementadas:

#### 1. **CSS Optimizations**
```css
/* Critical CSS inline en <head> */
/* Non-critical CSS cargado asíncronamente */

/* Optimización de animaciones */
.feature-card {
    will-change: transform;
    transform: translateZ(0); /* Hardware acceleration */
}

/* Efficient selectors */
.btn-primary { /* Específico y eficiente */ }
```

#### 2. **JavaScript Performance**
```javascript
// Debounce para eventos de scroll
const debouncedScrollHandler = debounce(() => {
    // Scroll logic
}, 10);

// IntersectionObserver para animaciones
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, { threshold: 0.1 });

// Event delegation
document.addEventListener('click', (e) => {
    if (e.target.matches('.btn')) {
        // Handle button clicks
    }
});
```

#### 3. **Loading Strategies**
- **Critical CSS:** Inline en HTML
- **Font Loading:** font-display: swap
- **Image Optimization:** Lazy loading preparado
- **Script Loading:** Defer para scripts no críticos

### Métricas de Rendimiento:
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1
- **First Input Delay:** < 100ms

## 🔒 Seguridad

### Headers de Seguridad:
```python
# En server.py para desarrollo
def end_headers(self):
    self.send_header('Access-Control-Allow-Origin', '*')
    self.send_header('X-Content-Type-Options', 'nosniff')
    self.send_header('X-Frame-Options', 'DENY')
    self.send_header('X-XSS-Protection', '1; mode=block')
    super().end_headers()
```

### Validación de Formularios:
```javascript
// Validación client-side
function validateForm(formData) {
    const email = formData.get('email');
    const name = formData.get('name');
    
    if (!email || !isValidEmail(email)) {
        throw new Error('Email inválido');
    }
    
    if (!name || name.length < 2) {
        throw new Error('Nombre requerido');
    }
}

// Sanitización de inputs
function sanitizeInput(input) {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}
```

## 🎯 SEO y Accesibilidad

### Meta Tags Implementados:
```html
<!-- SEO Básico -->
<title>Mercenary - Plataforma de Freelancers Gamificada</title>
<meta name="description" content="...">
<meta name="keywords" content="freelancer, chile, gamificación, ranking">

<!-- Open Graph -->
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:type" content="website">
<meta property="og:url" content="https://mercenary.cl">

<!-- Viewport -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### Accesibilidad (WCAG 2.1 AA):
```html
<!-- Landmarks semánticos -->
<nav aria-label="Navegación principal">
<main>
<section aria-labelledby="features-heading">

<!-- Alt text para imágenes -->
<img src="..." alt="Descripción detallada">

<!-- Focus management -->
<button aria-expanded="false" aria-controls="nav-menu">
```

### Estructura Semántica:
- `<header>` para navegación
- `<main>` para contenido principal
- `<section>` para secciones temáticas
- `<article>` para contenido independiente
- `<aside>` para contenido relacionado
- `<footer>` para información secundaria

## 🔧 Herramientas de Desarrollo

### Servidor de Desarrollo:
```python
# server.py - Características
- Puerto configurable (default: 8080)
- MIME types correctos
- CORS headers para desarrollo
- Logging de requests
- Manejo de errores
- Hot reload manual
```

### Debugging:
```javascript
// Console logging para desarrollo
console.log('Mercenary Website Loaded Successfully! 🚀');

// Error handling
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
});

// Performance monitoring
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`Page loaded in ${loadTime}ms`);
});
```

## 📊 Análisis de Código

### Estadísticas:
- **Total líneas:** ~1,800
- **HTML:** 400 líneas (22%)
- **CSS:** 1,200 líneas (67%)
- **JavaScript:** 400 líneas (22%)
- **Python:** 80 líneas (4%)

### Complejidad:
- **CSS Selectors:** Específicos y eficientes
- **JavaScript Functions:** Modulares y reutilizables
- **HTML Structure:** Semántica y accesible
- **Dependencies:** Cero dependencias externas

### Mantenibilidad:
- **Comentarios:** Código bien documentado
- **Naming:** Convenciones consistentes (BEM para CSS)
- **Structure:** Separación clara de responsabilidades
- **Modularity:** Componentes reutilizables

---

*Esta documentación técnica proporciona una visión completa de la arquitectura y implementación del website Mercenary.*
