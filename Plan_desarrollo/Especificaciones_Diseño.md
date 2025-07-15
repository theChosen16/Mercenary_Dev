# Especificaciones de Diseño - Plataforma de Mercenarios

## 1. Guía de Estilos

### 1.1 Paleta de Colores
- **Primario:** #007bff (Azul)
- **Secundario:** #6c757d (Gris)
- **Acento:** #28a745 (Verde)
- **Error:** #dc3545 (Rojo)
- **Fondo:** #ffffff (Blanco)
- **Texto:** #343a40 (Gris Oscuro)

### 1.2 Tipografía
- **Fuente Principal:** Arial, sans-serif
- **Tamaño de Texto:**
  - Título: 24px
  - Subtítulo: 20px
  - Cuerpo: 16px
  - Pequeño: 14px

### 1.3 Espaciado
- **Margen:** 16px
- **Padding:** 16px
- **Espaciado entre elementos:** 8px

## 2. Componentes Reutilizables

### 2.1 Botones
- **Estilo:** Redondeado con sombra suave
- **Colores:**
  - Primario: #007bff (Azul)
  - Secundario: #6c757d (Gris)
  - Acento: #28a745 (Verde)
  - Error: #dc3545 (Rojo)
- **Estados de Interacción:**
  - Hover: Opacidad 0.8
  - Presionado: Opacidad 0.6

#### Ejemplo de Botón Primario
```
┌─────────────────────────────┐
│  [Botón Primario]           │
└─────────────────────────────┘
```

### 2.2 Inputs
- **Estilo:** Rectángulo con bordes redondeados
- **Colores:**
  - Fondo: #ffffff (Blanco)
  - Borde: #ced4da (Gris Claro)
  - Texto: #343a40 (Gris Oscuro)
  - Placeholder: #6c757d (Gris)
- **Estados de Interacción:**
  - Foco: Borde #007bff (Azul)
  - Error: Borde #dc3545 (Rojo)

#### Ejemplo de Input de Texto
```
┌─────────────────────────────┐
│  [Texto de entrada...]      │
└─────────────────────────────┘
```

### 2.3 Tarjetas
- **Estilo:** Rectángulo con bordes redondeados y sombra suave
- **Colores:**
  - Fondo: #ffffff (Blanco)
  - Borde: #ced4da (Gris Claro)
  - Texto: #343a40 (Gris Oscuro)
- **Estados de Interacción:**
  - Hover: Opacidad 0.8

#### Ejemplo de Tarjeta
```
┌─────────────────────────────┐
│  [Título]                   │
│  [Contenido]                │
└─────────────────────────────┘
```

### 2.4 Modales
- **Estilo:** Ventana emergente con bordes redondeados y sombra suave
- **Colores:**
  - Fondo: #ffffff (Blanco)
  - Borde: #ced4da (Gris Claro)
  - Texto: #343a40 (Gris Oscuro)
- **Estados de Interacción:**
  - Cerrar: Botón con icono de "X" en la esquina superior derecha

#### Ejemplo de Modal
```
┌─────────────────────────────┐
│  [Título]                   │
│  [Contenido]                │
│  [Botón Aceptar] [Botón Cancelar] │
└─────────────────────────────┘
```

### 2.5 Navegación
- **Estilo:** Barra de navegación horizontal en la parte superior
- **Colores:**
  - Fondo: #007bff (Azul)
  - Texto: #ffffff (Blanco)
- **Estados de Interacción:**
  - Hover: Opacidad 0.8

#### Ejemplo de Navegación
```
┌─────────────────────────────┐
│  [Inicio] [Anuncios] [Perfil] [Mensajes] [Configuración] │
└─────────────────────────────┘
```

### 2.6 Iconos
- **Estilo:** Iconos vectoriales en blanco sobre fondo azul
- **Colores:**
  - Primario: #ffffff (Blanco)
  - Secundario: #6c757d (Gris)

#### Ejemplo de Icono
```
┌─────────────────────────────┐
│  [Icono]                    │
└─────────────────────────────┘
```

## 3. Patrones de Diseño

### 3.1 Pantalla de Bienvenida
- **Componentes:**
  - Logo de la App
  - Texto de Bienvenida
  - Botón de Iniciar Sesión
  - Botón de Registrarse
  - Texto de Invitación a Crear Cuenta

#### Ejemplo de Pantalla de Bienvenida
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

### 3.2 Registro - Selección de Rol
- **Componentes:**
  - Botón de Atrás
  - Texto de Selección de Rol
  - Opciones de Rol (Mercenario, Oferente)
  - Texto de Instrucción

#### Ejemplo de Registro - Selección de Rol
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

### 3.3 Tablón de Anuncios
- **Componentes:**
  - Título de Sección
  - Barra de Búsqueda y Filtros
  - Tarjetas de Anuncios
  - Botón de Cargar Más

#### Ejemplo de Tablón de Anuncios
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

### 3.4 Detalle del Anuncio
- **Componentes:**
  - Botón de Atrás
  - Botón de Mensajes
  - Título del Anuncio
  - Información del Anuncio (Presupuesto, Ubicación, Tipo de Contrato)
  - Descripción del Anuncio
  - Requisitos del Anuncio
  - Botón de Aplicar

#### Ejemplo de Detalle del Anuncio
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

### 3.5 Perfil de Usuario
- **Componentes:**
  - Botón de Atrás
  - Foto de Perfil
  - Nombre del Usuario
  - Calificación y Número de Trabajos
  - Información de Contacto
  - Sobre Mí
  - Habilidades
  - Experiencia
  - Certificaciones

#### Ejemplo de Perfil de Usuario
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

### 3.6 Aplicación a un Anuncio
- **Componentes:**
  - Botón de Atrás
  - Título del Anuncio
  - Sección de Adjuntar CV
  - Sección de Mensaje
  - Botón de Enviar Aplicación

#### Ejemplo de Aplicación a un Anuncio
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

### 3.7 Publicación de un Anuncio
- **Componentes:**
  - Botón de Atrás
  - Título del Anuncio
  - Sección de Descripción
  - Sección de Requisitos
  - Sección de Presupuesto
  - Sección de Ubicación
  - Sección de Tipo de Contrato
  - Botón de Publicar Trabajo

#### Ejemplo de Publicación de un Anuncio
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

### 3.8 Mensajes
- **Componentes:**
  - Botón de Atrás
  - Lista de Mensajes
  - Botón de Cargar Más

#### Ejemplo de Mensajes
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

### 3.9 Configuración de Perfil
- **Componentes:**
  - Botón de Atrás
  - Sección de Configuración
  - Botón de Editar Perfil
  - Botón de Cambiar Contraseña
  - Botón de Cerrar Sesión

#### Ejemplo de Configuración de Perfil
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

### 3.10 Notificaciones
- **Componentes:**
  - Botón de Atrás
  - Lista de Notificaciones
  - Botón de Cargar Más

#### Ejemplo de Notificaciones
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

### 3.11 Ayuda y Soporte
- **Componentes:**
  - Botón de Atrás
  - Sección de Ayuda y Soporte
  - Enlaces a Documentación
  - Botón de Contactar Soporte

#### Ejemplo de Ayuda y Soporte
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

## 4. Ejemplos de Uso

### 4.1 Pantalla de Bienvenida
- **Descripción:** Pantalla inicial que presenta la plataforma y ofrece opciones para iniciar sesión o registrarse.
- **Componentes Utilizados:**
  - Logo de la App
  - Botones de Iniciar Sesión y Registrarse

### 4.2 Registro - Selección de Rol
- **Descripción:** Pantalla que permite al usuario seleccionar su rol en la plataforma (Mercenario u Oferente).
- **Componentes Utilizados:**
  - Botón de Atrás
  - Opciones de Rol

### 4.3 Tablón de Anuncios
- **Descripción:** Pantalla que muestra una lista de anuncios disponibles para los usuarios.
- **Componentes Utilizados:**
  - Barra de Búsqueda y Filtros
  - Tarjetas de Anuncios

### 4.4 Detalle del Anuncio
- **Descripción:** Pantalla que muestra los detalles de un anuncio específico.
- **Componentes Utilizados:**
  - Botón de Atrás
  - Información del Anuncio
  - Botón de Aplicar

### 4.5 Perfil de Usuario
- **Descripción:** Pantalla que muestra la información del usuario.
- **Componentes Utilizados:**
  - Foto de Perfil
  - Información de Contacto
  - Sobre Mí
  - Habilidades
  - Experiencia
  - Certificaciones

### 4.6 Aplicación a un Anuncio
- **Descripción:** Pantalla que permite al usuario aplicar a un anuncio específico.
- **Componentes Utilizados:**
  - Sección de Adjuntar CV
  - Sección de Mensaje
  - Botón de Enviar Aplicación

### 4.7 Publicación de un Anuncio
- **Descripción:** Pantalla que permite al usuario publicar un nuevo anuncio.
- **Componentes Utilizados:**
  - Sección de Descripción
  - Sección de Requisitos
  - Sección de Presupuesto
  - Sección de Ubicación
  - Sección de Tipo de Contrato
  - Botón de Publicar Trabajo

### 4.8 Mensajes
- **Descripción:** Pantalla que muestra la lista de mensajes del usuario.
- **Componentes Utilizados:**
  - Lista de Mensajes

### 4.9 Configuración de Perfil
- **Descripción:** Pantalla que permite al usuario configurar su perfil.
- **Componentes Utilizados:**
  - Sección de Configuración
  - Botones de Editar Perfil, Cambiar Contraseña y Cerrar Sesión

### 4.10 Notificaciones
- **Descripción:** Pantalla que muestra las notificaciones del usuario.
- **Componentes Utilizados:**
  - Lista de Notificaciones

### 4.11 Ayuda y Soporte
- **Descripción:** Pantalla que ofrece información de ayuda y soporte al usuario.
- **Componentes Utilizados:**
  - Enlaces a Documentación
  - Botón de Contactar Soporte