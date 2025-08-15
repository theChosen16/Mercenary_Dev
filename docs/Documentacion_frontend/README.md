# **📱 Documentación Frontend - Mercenary App**

## **🎯 Visión General**

Documentación completa del frontend de **Mercenary**, una aplicación móvil Flutter que conecta oferentes con mercenarios especializados. Esta documentación cubre la arquitectura, implementación actual, y roadmap de desarrollo del cliente móvil.

---

## **📋 Índice de Documentación**

### **1. [Arquitectura Frontend](01_Arquitectura_Frontend.md)**
- Estructura del proyecto Flutter
- Arquitectura Clean Architecture
- Gestión de estado con Bloc
- Navegación y routing
- Organización de archivos y carpetas

### **2. [Pantallas y UI/UX](02_Pantallas_UI_UX.md)**
- Diseño de pantallas implementadas
- Componentes reutilizables
- Sistema de temas y colores
- Guías de estilo y patrones UI
- Flujos de usuario

### **3. [Integración con Backend](03_Integracion_Backend.md)**
- Configuración de APIs
- Autenticación JWT
- Modelos de datos
- Manejo de errores
- Caché y almacenamiento local

### **4. [Testing y Calidad](04_Testing_Calidad.md)**
- Estrategia de testing
- Tests unitarios y de widgets
- Tests de integración
- Análisis estático de código
- Métricas de calidad

### **5. [Despliegue y Distribución](05_Despliegue_Distribucion.md)**
- Configuración de builds
- Distribución en stores
- CI/CD para móvil
- Versionado y releases
- Monitoreo en producción

---

## **🚀 Estado Actual del Proyecto**

### **✅ Completado (Fase 1)**
- ✅ **Estructura base del proyecto** - Arquitectura limpia implementada
- ✅ **Sistema de navegación** - GoRouter configurado con rutas principales
- ✅ **Tema y diseño** - Material Design 3 con colores corporativos
- ✅ **Pantallas de autenticación** - Login, registro y splash screen
- ✅ **Dashboard principal** - Home screen con navegación por tabs
- ✅ **Gestión de perfil** - Pantalla completa de edición de usuario
- ✅ **Validaciones de formularios** - Sistema robusto de validación
- ✅ **Componentes base** - Widgets reutilizables implementados

### **🔄 En Desarrollo (Fase 2)**
- 🔄 **Integración con Backend** - Conexión con APIs REST
- 🔄 **Gestión de estado global** - Implementación de Bloc/Cubit
- 🔄 **Autenticación JWT** - Manejo de tokens y sesiones
- 🔄 **Almacenamiento seguro** - Persistencia de datos sensibles
- 🔄 **Manejo de errores** - Sistema centralizado de errores

### **📋 Pendiente (Fases Futuras)**
- 📋 **Sistema de chat** - Mensajería en tiempo real
- 📋 **Notificaciones push** - Alertas y comunicaciones
- 📋 **Sistema de pagos** - Integración con pasarelas de pago
- 📋 **Geolocalización** - Servicios basados en ubicación
- 📋 **Modo offline** - Funcionalidad sin conexión
- 📋 **Analytics** - Métricas de uso y comportamiento

---

## **🛠️ Stack Tecnológico**

### **Framework y Lenguaje**
- **Flutter**: 3.32.8
- **Dart**: 3.8.1+
- **Material Design**: 3.0

### **Gestión de Estado**
- **flutter_bloc**: 8.1.6
- **bloc**: 8.1.4
- **provider**: 6.1.2
- **equatable**: 2.0.5

### **Navegación y Routing**
- **go_router**: 14.2.0

### **HTTP y APIs**
- **dio**: 5.4.3+1
- **http**: 1.2.1

### **Almacenamiento**
- **shared_preferences**: 2.2.3
- **flutter_secure_storage**: 9.2.2

### **UI y Componentes**
- **material_design_icons_flutter**: 7.0.7296
- **cached_network_image**: 3.3.1
- **shimmer**: 3.0.0
- **lottie**: 3.1.2
- **flutter_rating_bar**: 4.0.1

### **Formularios y Validación**
- **flutter_form_builder**: 9.3.0
- **form_builder_validators**: 10.0.1

### **Utilidades**
- **intl**: 0.19.0
- **logger**: 2.3.0
- **image_picker**: 1.1.2

---

## **📊 Métricas del Proyecto**

### **Estructura de Archivos**
```
lib/
├── core/                    # Configuración y utilidades
│   ├── constants/          # Constantes de la aplicación
│   ├── theme/             # Temas y estilos
│   ├── utils/             # Utilidades generales
│   ├── network/           # Configuración de red
│   └── storage/           # Almacenamiento local
├── features/              # Funcionalidades por módulos
│   ├── auth/             # Autenticación
│   ├── announcements/    # Anuncios y trabajos
│   └── profile/          # Gestión de perfil
└── shared/               # Componentes compartidos
    ├── widgets/          # Widgets reutilizables
    └── models/           # Modelos de datos
```

### **Pantallas Implementadas**
- **5 pantallas principales** completamente funcionales
- **Navegación fluida** entre todas las pantallas
- **Formularios validados** en login, registro y perfil
- **Componentes reutilizables** para consistencia UI

---

## **🎯 Objetivos de Desarrollo**

### **Corto Plazo (1-2 semanas)**
1. **Integración completa con Backend**
2. **Autenticación JWT funcional**
3. **CRUD de anuncios conectado**
4. **Gestión de estado global**

### **Mediano Plazo (1 mes)**
1. **Sistema de chat básico**
2. **Notificaciones push**
3. **Optimización de rendimiento**
4. **Tests automatizados**

### **Largo Plazo (2-3 meses)**
1. **Sistema de pagos**
2. **Funcionalidades avanzadas**
3. **Distribución en stores**
4. **Monitoreo y analytics**

---

## **📞 Información del Proyecto**

### **Configuración de Desarrollo**
- **IDE Recomendado**: VS Code con extensiones Flutter
- **Emuladores**: Android Studio AVD
- **Dispositivos**: Android 7.0+ (API 24+)
- **Resoluciones**: Responsive design para múltiples pantallas

### **Comandos Útiles**
```bash
# Instalar dependencias
flutter pub get

# Ejecutar en modo debug
flutter run

# Generar build de producción
flutter build apk --release

# Análisis de código
flutter analyze

# Tests
flutter test
```

---

*Documentación actualizada el 26 de Julio, 2025*  
*Versión de la App: 1.0.0+1*  
*Flutter SDK: 3.32.8*
