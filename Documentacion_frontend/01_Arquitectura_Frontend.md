# **🏗️ Arquitectura Frontend - Mercenary App**

## **📋 Información General**

Este documento describe la arquitectura del frontend móvil de Mercenary, implementado en Flutter siguiendo principios de Clean Architecture y mejores prácticas de desarrollo móvil.

---

## **🎯 Principios Arquitectónicos**

### **Clean Architecture**
La aplicación sigue los principios de Clean Architecture con separación clara de responsabilidades:

```
┌─────────────────────────────────────────┐
│              PRESENTATION               │
│  (UI, Widgets, Pages, Bloc/Cubit)     │
├─────────────────────────────────────────┤
│               DOMAIN                    │
│     (Entities, Use Cases, Repos)       │
├─────────────────────────────────────────┤
│                DATA                     │
│  (Models, Data Sources, Repositories)  │
└─────────────────────────────────────────┘
```

### **Separación por Features**
Cada funcionalidad principal está organizada como un módulo independiente:
- **Auth**: Autenticación y gestión de sesiones
- **Announcements**: Anuncios y trabajos
- **Profile**: Gestión de perfil de usuario
- **Contracts**: Contratos y acuerdos (futuro)
- **Chat**: Sistema de mensajería (futuro)

---

## **📁 Estructura del Proyecto**

```
lib/
├── main.dart                           # Punto de entrada de la aplicación
├── core/                              # Configuración y utilidades centrales
│   ├── constants/
│   │   └── app_constants.dart         # Constantes globales
│   ├── theme/
│   │   └── app_theme.dart            # Tema y estilos
│   ├── utils/                        # Utilidades generales
│   ├── network/                      # Configuración HTTP
│   └── storage/                      # Almacenamiento local
├── features/                         # Funcionalidades por módulos
│   ├── auth/                        # Módulo de autenticación
│   │   ├── data/                    # Capa de datos
│   │   │   ├── datasources/         # Fuentes de datos
│   │   │   ├── models/              # Modelos de datos
│   │   │   └── repositories/        # Implementación de repositorios
│   │   ├── domain/                  # Capa de dominio
│   │   │   ├── entities/            # Entidades de negocio
│   │   │   ├── repositories/        # Interfaces de repositorios
│   │   │   └── usecases/            # Casos de uso
│   │   └── presentation/            # Capa de presentación
│   │       ├── bloc/                # Gestión de estado
│   │       ├── pages/               # Pantallas
│   │       └── widgets/             # Widgets específicos
│   ├── announcements/               # Módulo de anuncios
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   └── profile/                     # Módulo de perfil
│       ├── data/
│       ├── domain/
│       └── presentation/
└── shared/                          # Componentes compartidos
    ├── widgets/                     # Widgets reutilizables
    └── models/                      # Modelos compartidos
```

---

## **🔄 Gestión de Estado**

### **Patrón BLoC**
Utilizamos el patrón BLoC (Business Logic Component) para la gestión de estado:

```dart
// Ejemplo de estructura BLoC
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository authRepository;
  
  AuthBloc({required this.authRepository}) : super(AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
    on<LogoutRequested>(_onLogoutRequested);
  }
  
  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final user = await authRepository.login(
        email: event.email,
        password: event.password,
      );
      emit(AuthSuccess(user: user));
    } catch (e) {
      emit(AuthFailure(message: e.toString()));
    }
  }
}
```

### **Estados Globales vs Locales**
- **Estados Globales**: Autenticación, configuración de usuario
- **Estados Locales**: Formularios, animaciones, UI temporal

---

## **🌐 Navegación y Routing**

### **GoRouter Configuration**
Utilizamos GoRouter para navegación declarativa:

```dart
final GoRouter _router = GoRouter(
  initialLocation: '/splash',
  routes: [
    GoRoute(
      path: '/splash',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/home',
      builder: (context, state) => const HomeScreen(),
    ),
    // Más rutas...
  ],
);
```

### **Flujo de Navegación**
```
Splash Screen → Login Screen → Home Screen
      ↓              ↓             ↓
   (3 segundos)   Register    Profile/Settings
```

---

## **🎨 Sistema de Temas**

### **Material Design 3**
Implementación completa de Material Design 3 con:

```dart
class AppTheme {
  static const Color primaryColor = Color(0xFF2E7D32);
  static const Color secondaryColor = Color(0xFFFF6F00);
  
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: const ColorScheme.light(
        primary: primaryColor,
        secondary: secondaryColor,
        // Más colores...
      ),
      // Configuración de componentes...
    );
  }
}
```

### **Componentes Temáticos**
- **AppBar**: Estilo consistente con colores corporativos
- **Buttons**: ElevatedButton, OutlinedButton, TextButton
- **Cards**: Diseño con elevación y bordes redondeados
- **Forms**: InputDecoration unificado
- **Typography**: Jerarquía tipográfica clara

---

## **📱 Responsive Design**

### **Breakpoints**
```dart
class Breakpoints {
  static const double mobile = 600;
  static const double tablet = 900;
  static const double desktop = 1200;
}
```

### **Adaptabilidad**
- **Layouts flexibles** con Flex y Expanded
- **Padding dinámico** basado en tamaño de pantalla
- **Tipografía escalable** con MediaQuery
- **Imágenes responsivas** con AspectRatio

---

## **🔌 Inyección de Dependencias**

### **Provider Pattern**
Utilizamos Provider para inyección de dependencias:

```dart
void main() {
  runApp(
    MultiProvider(
      providers: [
        Provider<AuthRepository>(
          create: (_) => AuthRepositoryImpl(),
        ),
        BlocProvider<AuthBloc>(
          create: (context) => AuthBloc(
            authRepository: context.read<AuthRepository>(),
          ),
        ),
      ],
      child: const MercenaryApp(),
    ),
  );
}
```

---

## **🛡️ Manejo de Errores**

### **Estrategia de Errores**
```dart
abstract class Failure extends Equatable {
  final String message;
  const Failure(this.message);
}

class ServerFailure extends Failure {
  const ServerFailure(String message) : super(message);
}

class NetworkFailure extends Failure {
  const NetworkFailure(String message) : super(message);
}
```

### **Error Boundaries**
- **Try-catch** en casos de uso
- **Error states** en BLoC
- **Fallback UI** para errores de red
- **Logging** centralizado de errores

---

## **📊 Rendimiento**

### **Optimizaciones Implementadas**
- **Lazy loading** de pantallas
- **Cached network images** para imágenes
- **ListView.builder** para listas grandes
- **const constructors** donde sea posible

### **Métricas de Rendimiento**
- **Tiempo de inicio**: < 3 segundos
- **Navegación**: < 300ms entre pantallas
- **Memoria**: Gestión eficiente de widgets
- **Batería**: Optimización de animaciones

---

## **🔄 Ciclo de Vida**

### **Application Lifecycle**
```dart
class _MercenaryAppState extends State<MercenaryApp> 
    with WidgetsBindingObserver {
  
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }
  
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.resumed:
        // App en primer plano
        break;
      case AppLifecycleState.paused:
        // App en segundo plano
        break;
      // Más estados...
    }
  }
}
```

---

## **🚀 Próximas Mejoras Arquitectónicas**

### **Corto Plazo**
- **Repository Pattern** completo
- **Use Cases** para lógica de negocio
- **Error handling** centralizado
- **Logging** estructurado

### **Mediano Plazo**
- **Modularización** por packages
- **Code generation** con build_runner
- **Dependency injection** con get_it
- **State management** avanzado

### **Largo Plazo**
- **Micro-frontends** architecture
- **Plugin architecture** para extensibilidad
- **Performance monitoring** integrado
- **A/B testing** framework

---

*Documentación actualizada el 26 de Julio, 2025*  
*Versión de la Arquitectura: 1.0*
