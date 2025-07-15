# Diseño UI/UX - Plataforma de Mercenarios

## 📋 Especificaciones de Diseño

### **Paleta de Colores**
- **Primario**: `#2563EB` (Azul profesional)
- **Secundario**: `#64748B` (Gris neutro)
- **Éxito**: `#10B981` (Verde confirmación)
- **Advertencia**: `#F59E0B` (Ámbar)
- **Error**: `#EF4444` (Rojo)
- **Fondo**: `#FFFFFF` / `#F8FAFC`
- **Texto**: `#1E293B` / `#475569`

### **Tipografía**
- **Principal**: Inter (Google Fonts)
- **Títulos**: Inter Bold (700)
- **Subtítulos**: Inter SemiBold (600)
- **Cuerpo**: Inter Regular (400)
- **Pequeño**: Inter Light (300)

### **Espaciado**
- **Base**: 8px
- **Múltiplos**: 8, 16, 24, 32, 48, 64px

## 🎨 Pantallas MVP - Wireframes Detallados

### **1. Pantalla de Bienvenida**
```
┌─────────────────────────────────────┐
│                                     │
│         [Logo App]                  │
│                                     │
│    Bienvenido a                     │
│    Mercenary Platform               │
│                                     │
│    Conectamos talento con           │
│    oportunidades                    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🚀 Iniciar Sesión          │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  👤 Registrarse             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ¿Primera vez? Crea tu cuenta       │
│                                     │
└─────────────────────────────────────┘
```

### **2. Registro - Selección de Rol**
```
┌─────────────────────────────────────┐
│  [←] Atrás                          │
│                                     │
│  ¿Cómo quieres usar la app?         │
│                                     │
│  ┌─────────────────────┐           │
│  │        🛠️          │           │
│  │    Mercenario       │           │
│  │                     │           │
│  │  Buscar trabajos    │           │
│  │  Ofrecer servicios  │           │
│  └─────────────────────┘           │
│                                     │
│  ┌─────────────────────┐           │
│  │        💼          │           │
│  │     Oferente        │           │
│  │                     │           │
│  │  Publicar trabajos  │           │
│  │  Buscar talento     │           │
│  └─────────────────────┘           │
│                                     │
│  *Selecciona una opción para        │
│   continuar                         │
└─────────────────────────────────────┘
```

### **3. Tablón de Anuncios**
```
┌─────────────────────────────────────┐
│  📋 Trabajos Disponibles            │
│                                     │
│  [🔍 Buscar...] [Filtrar ▼]        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 💻 Desarrollo Web          │   │
│  │ $1,500 - $2,000 USD        │   │
│  │ 📍 Santiago, Chile         │   │
│  │ ⏰ Hace 2 horas            │   │
│  │ ⭐ 4.8 (5 reseñas)         │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🎨 Diseño Gráfico          │   │
│  │ $800 - $1,200 USD          │   │
│  │ 📍 Remoto                  │   │
│  │ ⏰ Hace 5 horas            │   │
│  │ ⭐ 4.5 (12 reseñas)        │   │
│  └─────────────────────────────┘   │
│                                     │
│  [+ Cargar más]                     │
└─────────────────────────────────────┘
```

### **4. Detalle del Anuncio**
```
┌─────────────────────────────────────┐
│  [←] Atrás                  [💬]    │
│                                     │
│  💻 Desarrollador Web Senior        │
│  ─────────────────────────          │
│                                     │
│  💰 $1,500 - $2,000 USD             │
│  📍 Santiago, Chile (Presencial)    │
│  ⏰ Tiempo completo                 │
│  📅 Publicado hace 2 horas          │
│                                     │
│  Descripción:                       │
│  Buscamos desarrollador web con     │
│  experiencia en React y Node.js...  │
│                                     │
│  Requisitos:                        │
│  • 3+ años de experiencia           │
│  • React, Node.js, PostgreSQL       │
│  • Inglés intermedio                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📧 Aplicar ahora           │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### **5. Perfil de Usuario**
```
┌─────────────────────────────────────┐
│  [←] Atrás                          │
│                                     │
│  ┌─────┐  Juan Pérez               │
│  │     │  ⭐ 4.9 • 47 trabajos      │
│  │Photo│  Desarrollador Web        │
│  └─────┘  juan@email.com           │
│                                     │
│  📍 Santiago, Chile                 │
│  🌐 juanperez.dev                   │
│                                     │
│  Sobre mí:                          │
│  Desarrollador full-stack con 5     │
│  años de experiencia en...          │
│                                     │
│  Habilidades:                       │
│  [React] [Node.js] [Python]         │
│  [PostgreSQL] [Docker]              │
│                                     │
│  Experiencia:                       │
│  • Desarrollador en XYZ Corp        │
│  • Freelance en ABC Proyectos       │
│                                     │
│  Certificaciones:                   │
│  • Certificado en React             │
│  • Certificado en Node.js           │
└─────────────────────────────────────┘
```

### **6. Aplicación a un Anuncio**
```
┌─────────────────────────────────────┐
│  [←] Atrás                          │
│                                     │
│  Aplicar a: Desarrollador Web       │
│  ─────────────────────────          │
│                                     │
│  [Adjuntar CV]                      │
│                                     │
│  Mensaje:                           │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │  Hola, me interesa el       │   │
│  │  trabajo...                 │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📧 Enviar Aplicación       │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### **7. Publicación de un Anuncio**
```
┌─────────────────────────────────────┐
│  [←] Atrás                          │
│                                     │
│  Publicar Trabajo                   │
│  ─────────────────────────          │
│                                     │
│  Título:                            │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │  Desarrollador Web Senior   │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Descripción:                       │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │  Buscamos desarrollador web │   │
│  │  con experiencia en React   │   │
│  │  y Node.js...               │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Requisitos:                        │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │  • 3+ años de experiencia   │   │
│  │  • React, Node.js,          │   │
│  │  PostgreSQL                 │   │
│  │  • Inglés intermedio        │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Presupuesto:                       │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │  $1,500 - $2,000 USD        │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Ubicación:                         │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │  Santiago, Chile            │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Tipo de Contrato:                  │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │  Tiempo completo            │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📧 Publicar Trabajo        │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### **8. Mensajes**
```
┌─────────────────────────────────────┐
│  [←] Atrás                          │
│                                     │
│  📩 Mensajes                        │
│  ─────────────────────────          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Juan Pérez                 │   │
│  │  ⭐ 4.9                      │   │
│  │  Hace 1 hora                │   │
│  │  └── Hola, me interesa...   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Empresa XYZ                │   │
│  │  ⭐ 4.7                      │   │
│  │  Hace 3 horas               │   │
│  │  └── Gracias por tu         │   │
│  │      interés...             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [+ Cargar más]             │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### **9. Configuración de Perfil**
```
┌─────────────────────────────────────┐
│  [←] Atrás                          │
│                                     │
│  Configuración                      │
│  ─────────────────────────          │
│                                     │
│  [Editar Perfil]                    │
│                                     │
│  [Cambiar Contraseña]               │
│                                     │
│  [Cerrar Sesión]                    │
└─────────────────────────────────────┘
```

### **10. Notificaciones**
```
┌─────────────────────────────────────┐
│  [←] Atrás                          │
│                                     │
│  🔔 Notificaciones                │
│  ─────────────────────────          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Nueva aplicación a tu      │   │
│  │  trabajo...                 │   │
│  │  Hace 1 hora                │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Nuevo mensaje de Juan      │   │
│  │  Pérez...                   │   │
│  │  Hace 3 horas               │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [+ Cargar más]             │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### **11. Ayuda y Soporte**
```
┌─────────────────────────────────────┐
│  [←] Atrás                          │
│                                     │
│  🆘 Ayuda y Soporte                │
│  ─────────────────────────          │
│                                     │
│  ¿Cómo funciona la plataforma?      │
│  ┌─────────────────────────────┐   │
│  │  [Leer más]                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ¿Cómo publicar un trabajo?         │
│  ┌─────────────────────────────┐   │
│  │  [Leer más]                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ¿Cómo aplicar a un trabajo?        │
│  ┌─────────────────────────────┐   │
│  │  [Leer más]                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📧 Contactar Soporte       │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

## 🛠️ Sistema de Diseño y Componentes

### **Componentes Reutilizables**
- **Botones**
  - Primario
  - Secundario
  - Éxito
  - Advertencia
  - Error
- **Inputs**
  - Texto
  - Contraseña
  - Email
  - Fecha
- **Tarjetas**
  - Anuncio
  - Perfil
  - Mensaje
- **Modales**
  - Registro
  - Inicio de Sesión
  - Aplicación a Trabajo
  - Publicación de Trabajo

### **Estilos y Clases**
- **Botones**
  - `.btn-primary`
  - `.btn-secondary`
  - `.btn-success`
  - `.btn-warning`
  - `.btn-danger`
- **Inputs**
  - `.input-text`
  - `.input-password`
  - `.input-email`
  - `.input-date`
- **Tarjetas**
  - `.card-job`
  - `.card-profile`
  - `.card-message`
- **Modales**
  - `.modal-register`
  - `.modal-login`
  - `.modal-apply`
  - `.modal-publish`

## 📝 Documentación de Especificaciones de Diseño

### **Wireframes**
- **Pantalla de Bienvenida**
- **Registro - Selección de Rol**
- **Tablón de Anuncios**
- **Detalle del Anuncio**
- **Perfil de Usuario**
- **Aplicación a un Anuncio**
- **Publicación de un Anuncio**
- **Mensajes**
- **Configuración de Perfil**
- **Notificaciones**
- **Ayuda y Soporte**

### **Componentes**
- **Botones**
- **Inputs**
- **Tarjetas**
- **Modales**

### **Estilos**
- **Paleta de Colores**
- **Tipografía**
- **Espaciado**

### **Interacciones**
- **Navegación**
- **Formularios**
- **Modales**
- **Notificaciones**

### **Responsividad**
- **Dispositivos Móviles**
- **Tabletas**
- **Escritorios**

### **Accesibilidad**
- **Contraste de Colores**
- **Tamaño de Texto**
- **Navegación por Teclado**
- **Lectores de Pantalla**

### **Pruebas**
- **Usabilidad**
- **Compatibilidad**
- **Rendimiento**

### **Iteraciones**
- **Feedback de Usuarios**
- **Mejoras Continuas**
- **Actualizaciones**

### **Recursos**
- **Fuentes**
- **Iconos**
- **Imágenes**
- **Videos**

### **Referencias**
- **Documentación de Diseño**
- **Guías de Estilo**
- **Patrones de Diseño**
- **Ejemplos de Diseño**

### **Colaboración**
- **Diseñadores**
- **Desarrolladores**
- **Product Owners**
- **Stakeholders**

### **Entregables**
- **Wireframes**
- **Mockups**
- **Prototipos**
- **Documentación Técnica**
- **Guías de Estilo**

### **Requisitos**
- **Funcionales**
- **No Funcionales**
- **Aceptación**

### **Metodologías**
- **Design Thinking**
- **Agile**
- **Scrum**
- **Kanban**

### **Herramientas**
- **Figma**
- **Adobe XD**
- **Sketch**
- **Zeplin**
- **InVision**
- **Jira**
- **Trello**
- **Slack**
- **GitHub**
- **GitLab**
- **Bitbucket**

### **Proceso**
- **Reuniones de Diseño**
- **Reuniones de Revisión**
- **Reuniones de Aprobación**
- **Reuniones de Retroalimentación**
- **Reuniones de Planificación**

### **Roles**
- **Diseñador UI/UX**
- **Desarrollador Frontend**
- **Desarrollador Backend**
- **Product Owner**
- **Stakeholder**

### **Entregables Finales**
- **Wireframes Detallados**
- **Mockups Detallados**
- **Prototipos Interactivos**
- **Documentación Técnica Completa**
- **Guías de Estilo Completas**
- **Patrones de Diseño Completos**
- **Ejemplos de Diseño Completos**

### **Próximos Pasos**
- **Crear Wireframes Básicos para Pantallas MVP**
- **Definir Sistema de Diseño y Componentes**
- **Documentar Especificaciones de Diseño**

### **Conclusiones**
- **Objetivos Alcanzados**
- **Desafíos Superados**
- **Lecciones Aprendidas**
- **Mejoras Futuras**

### **Referencias**
- **Documentación de Diseño**
- **Guías de Estilo**
- **Patrones de Diseño**
- **Ejemplos de Diseño**

### **Colaboración**
- **Diseñadores**
- **Desarrolladores**
- **Product Owners**
- **Stakeholders**

### **Entregables**
- **Wireframes**
- **Mockups**
- **Prototipos**
- **Documentación Técnica**
- **Guías de Estilo**

### **Requisitos**
- **Funcionales**
- **No Funcionales**
- **Aceptación**

### **Metodologías**
- **Design Thinking**
- **Agile**
- **Scrum**
- **Kanban**

### **Herramientas**
- **Figma**
- **Adobe XD**
- **Sketch**
- **Zeplin**
- **InVision**
- **Jira**
- **Trello**
- **Slack**
- **GitHub**
- **GitLab**
- **Bitbucket**

### **Proceso**
- **Reuniones de Diseño**
- **Reuniones de Revisión**
- **Reuniones de Aprobación**
- **Reuniones de Retroalimentación**
- **Reuniones de Planificación**

### **Roles**
- **Diseñador UI/UX**
- **Desarrollador Frontend**
- **Desarrollador Backend**
- **Product Owner**
- **Stakeholder**

### **Entregables Finales**
- **Wireframes Detallados**
- **Mockups Detallados**
- **Prototipos Interactivos**
- **Documentación Técnica Completa**
- **Guías de Estilo Completas**
- **Patrones de Diseño Completos**
- **Ejemplos de Diseño Completos**

### **Próximos Pasos**
- **Crear Wireframes Básicos para Pantallas MVP**
- **Definir Sistema de Diseño y Componentes**
- **Documentar Especificaciones de Diseño**

### **Conclusiones**
- **Objetivos Alcanzados**
- **Desafíos Superados**
- **Lecciones Aprendidas**
- **Mejoras Futuras**