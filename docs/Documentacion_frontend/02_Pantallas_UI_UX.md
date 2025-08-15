# **🎨 Pantallas y UI/UX - Mercenary App**

## **📋 Información General**

Este documento detalla el diseño de interfaz de usuario, experiencia de usuario y todas las pantallas implementadas en la aplicación móvil Mercenary.

---

## **🎯 Principios de Diseño**

### **Material Design 3**
- **Colores**: Paleta corporativa con verde profesional (#2E7D32) y naranja energético (#FF6F00)
- **Tipografía**: Jerarquía clara con pesos y tamaños definidos
- **Elevación**: Uso consistente de sombras y profundidad
- **Bordes**: Radio de 12px para elementos principales

### **Experiencia de Usuario**
- **Simplicidad**: Interfaces limpias y fáciles de navegar
- **Consistencia**: Patrones de diseño unificados
- **Accesibilidad**: Contraste adecuado y tamaños de toque
- **Feedback**: Respuesta visual inmediata a acciones

---

## **📱 Pantallas Implementadas**

### **1. Splash Screen**
**Propósito**: Pantalla de bienvenida con carga inicial

**Características**:
- Logo animado con efecto de escala y fade
- Indicador de carga
- Transición automática después de 3 segundos
- Fondo con color primario de la marca

**Componentes**:
```dart
- Container con logo (120x120px)
- Animaciones: FadeTransition + ScaleTransition
- CircularProgressIndicator
- Texto de bienvenida
```

**Flujo**: `Splash → Login (automático)`

---

### **2. Login Screen**
**Propósito**: Autenticación de usuarios existentes

**Características**:
- Formulario con validación en tiempo real
- Toggle de visibilidad de contraseña
- Enlace a recuperación de contraseña
- Navegación a registro
- Estado de carga durante autenticación

**Campos del Formulario**:
- **Email**: Validación de formato
- **Contraseña**: Mínimo 8 caracteres

**Validaciones**:
```dart
- Email: RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$')
- Contraseña: Longitud mínima 8 caracteres
- Campos requeridos: Validación de campos vacíos
```

**Estados**:
- Normal, Loading, Error
- Botón deshabilitado durante carga

**Flujo**: `Login → Home (éxito) | Error (fallo)`

---

### **3. Register Screen**
**Propósito**: Registro de nuevos usuarios

**Características**:
- Selección de tipo de usuario (Radio buttons)
- Formulario completo con validaciones
- Confirmación de contraseña
- Checkbox de términos y condiciones
- Navegación de regreso a login

**Campos del Formulario**:
- **Tipo de usuario**: Mercenario/Oferente
- **Nombre y Apellido**: Campos separados
- **Email**: Con validación
- **Contraseña**: Con confirmación
- **Términos**: Checkbox obligatorio

**Validaciones Especiales**:
```dart
- Confirmación de contraseña: Coincidencia exacta
- Términos: Debe estar marcado
- Nombres: No pueden estar vacíos
```

**Flujo**: `Register → Login (éxito) | Error (fallo)`

---

### **4. Home Screen**
**Propósito**: Dashboard principal con navegación por tabs

**Características**:
- BottomNavigationBar con 4 tabs
- PageView para navegación fluida
- AppBar contextual según tab activo
- FloatingActionButton en tab de trabajos

**Tabs Implementados**:

#### **4.1 Trabajos Tab**
- **Lista de anuncios** con RefreshIndicator
- **Tarjetas de trabajo** con información completa
- **Indicadores visuales** (urgente, categoría)
- **Datos mostrados**: Título, descripción, presupuesto, tiempo

#### **4.2 Mi Trabajo Tab**
- **Estado vacío** con ilustración
- **Mensaje informativo** para nuevos usuarios
- **Preparado para** lista de trabajos activos

#### **4.3 Mensajes Tab**
- **Estado vacío** con ilustración
- **Preparado para** lista de conversaciones
- **Diseño base** para sistema de chat

#### **4.4 Perfil Tab**
- **Avatar circular** con placeholder
- **Información básica** del usuario
- **Opciones de navegación** (Editar perfil, Configuración, Ayuda)
- **Cerrar sesión** con estilo destructivo

**Componentes Reutilizables**:
```dart
- AnnouncementCard: Tarjeta de trabajo
- _ProfileOption: Opción de menú de perfil
- EmptyState: Estados vacíos consistentes
```

---

### **5. Profile Screen**
**Propósito**: Gestión completa del perfil de usuario

**Características**:
- **Modo edición** toggleable
- **Avatar** con opción de cambio de foto
- **Formularios validados** para información personal
- **Estadísticas visuales** del usuario
- **Sistema de habilidades** con chips

**Secciones**:

#### **5.1 Información Personal**
- Nombre y apellido (campos separados)
- Email con validación
- Teléfono opcional
- Biografía (textarea multilínea)

#### **5.2 Estadísticas**
- **Trabajos Completados**: 12 (verde)
- **Calificación**: 4.8 estrellas (amarillo)
- **Tiempo Respuesta**: 2h (azul)
- **Proyectos Activos**: 3 (naranja)

#### **5.3 Habilidades**
- Chips con tecnologías: Flutter, Dart, Firebase, etc.
- Diseño responsive con Wrap widget
- Colores consistentes con tema

**Estados**:
- **Visualización**: Solo lectura con botón editar
- **Edición**: Campos habilitados con botones guardar/cancelar
- **Carga**: Indicador durante guardado

---

## **🎨 Sistema de Colores**

### **Paleta Principal**
```dart
Primary Color:    #2E7D32 (Verde profesional)
Primary Variant:  #1B5E20 (Verde oscuro)
Secondary Color:  #FF6F00 (Naranja energético)
Secondary Variant: #E65100 (Naranja oscuro)
```

### **Colores de Estado**
```dart
Success:  #4CAF50 (Verde éxito)
Error:    #F44336 (Rojo error)
Warning:  #FF9800 (Naranja advertencia)
Info:     #2196F3 (Azul información)
```

### **Colores Neutros**
```dart
Background:   #F5F5F5 (Gris claro)
Surface:      #FFFFFF (Blanco)
Text Primary: #212121 (Negro)
Text Secondary: #757575 (Gris)
Divider:      #E0E0E0 (Gris claro)
```

---

## **📝 Tipografía**

### **Jerarquía Tipográfica**
```dart
Display Large:   32px, Bold    (Títulos principales)
Display Medium:  28px, Bold    (Títulos secundarios)
Headline Large:  22px, SemiBold (Encabezados)
Headline Medium: 20px, SemiBold (Subtítulos)
Title Large:     16px, SemiBold (Títulos de tarjetas)
Body Large:      16px, Regular  (Texto principal)
Body Medium:     14px, Regular  (Texto secundario)
Label Large:     14px, Medium   (Etiquetas)
```

---

## **🧩 Componentes Reutilizables**

### **AnnouncementCard**
```dart
Propósito: Mostrar información de trabajos
Propiedades:
- title: String
- description: String
- budget: String
- category: String
- timeAgo: String
- isUrgent: bool
```

### **_ProfileOption**
```dart
Propósito: Opciones de menú en perfil
Propiedades:
- icon: IconData
- title: String
- onTap: VoidCallback
- isDestructive: bool
```

### **Formularios Consistentes**
- **InputDecoration** unificado
- **Validaciones** reutilizables
- **Estados de carga** consistentes
- **Mensajes de error** estandarizados

---

## **📐 Espaciado y Dimensiones**

### **Constantes de Espaciado**
```dart
Small Padding:   8px
Default Padding: 16px
Large Padding:   24px
Border Radius:   12px
Button Height:   48px
```

### **Breakpoints Responsive**
```dart
Mobile:  < 600px
Tablet:  600px - 900px
Desktop: > 900px
```

---

## **🎭 Animaciones**

### **Duraciones Estándar**
```dart
Short Animation:  200ms (Hover, tap)
Medium Animation: 300ms (Navegación)
Long Animation:   500ms (Splash, transiciones)
```

### **Curvas de Animación**
- **easeIn**: Entrada suave
- **easeOut**: Salida suave
- **easeInOut**: Transición completa
- **elasticOut**: Efecto elástico (splash)

---

## **♿ Accesibilidad**

### **Implementaciones**
- **Contraste**: Mínimo 4.5:1 para texto
- **Tamaños de toque**: Mínimo 44x44px
- **Semantics**: Labels descriptivos
- **Focus**: Navegación por teclado

### **Pendientes**
- Screen reader support
- High contrast mode
- Font scaling support
- Voice navigation

---

## **📱 Estados de la Aplicación**

### **Estados Globales**
- **Loading**: Indicadores de carga
- **Error**: Mensajes de error consistentes
- **Empty**: Estados vacíos con ilustraciones
- **Success**: Confirmaciones visuales

### **Feedback Visual**
- **SnackBar**: Mensajes temporales
- **Dialog**: Confirmaciones importantes
- **Progress**: Indicadores de progreso
- **Shimmer**: Carga de contenido

---

## **🚀 Próximas Mejoras UI/UX**

### **Corto Plazo**
- **Dark mode** completo
- **Animaciones** de transición mejoradas
- **Componentes** adicionales reutilizables
- **Validaciones** más robustas

### **Mediano Plazo**
- **Onboarding** interactivo
- **Tutoriales** contextuales
- **Personalización** de tema
- **Gestos** avanzados

### **Largo Plazo**
- **Design system** completo
- **Storybook** para componentes
- **A/B testing** de interfaces
- **Analytics** de UX

---

*Documentación actualizada el 26 de Julio, 2025*  
*Versión UI/UX: 1.0*
