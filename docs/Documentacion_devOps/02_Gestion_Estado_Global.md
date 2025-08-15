# **🔄 Gestión de Estado Global - Mercenary Project**

## **📋 Información General**

Este documento detalla la implementación completa de la gestión de estado global usando el patrón BLoC, incluyendo AuthBloc, AppBloc, inyección de dependencias y arquitectura reactiva.

---

## **🏗️ Arquitectura de Estado**

### **Patrón BLoC Implementado**
```
UI Events → BLoC → Business Logic → State Changes → UI Updates
    ↓         ↓           ↓              ↓           ↓
 User Input  Events   Services      New State    Rebuild
```

### **BLoCs Implementados**
- ✅ **AuthBloc**: Gestión de autenticación y usuario
- ✅ **AppBloc**: Configuraciones globales de la aplicación
- 🔄 **AnnouncementBloc**: Gestión de anuncios (futuro)
- 🔄 **ChatBloc**: Gestión de mensajería (futuro)

---

## **🔐 AuthBloc Implementation**

### **Events Definidos**
```dart
abstract class AuthEvent extends Equatable {
  const AuthEvent();
}

class AuthCheckRequested extends AuthEvent {}

class AuthLoginRequested extends AuthEvent {
  final String email;
  final String password;
  
  const AuthLoginRequested({
    required this.email,
    required this.password,
  });
}

class AuthRegisterRequested extends AuthEvent {
  final String email;
  final String password;
  final String firstName;
  final String lastName;
  final String userType;
  final String? phone;
}

class AuthLogoutRequested extends AuthEvent {}

class AuthUserUpdateRequested extends AuthEvent {
  final UserModel user;
  const AuthUserUpdateRequested(this.user);
}
```

### **States Definidos**
```dart
abstract class AuthState extends Equatable {
  const AuthState();
}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthAuthenticated extends AuthState {
  final UserModel user;
  const AuthAuthenticated(this.user);
}

class AuthUnauthenticated extends AuthState {}

class AuthError extends AuthState {
  final String message;
  const AuthError(this.message);
}
```

### **BLoC Logic Implementation**
```dart
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthService _authService;

  AuthBloc({required AuthService authService})
      : _authService = authService,
        super(AuthInitial()) {
    
    on<AuthCheckRequested>(_onAuthCheckRequested);
    on<AuthLoginRequested>(_onAuthLoginRequested);
    on<AuthRegisterRequested>(_onAuthRegisterRequested);
    on<AuthLogoutRequested>(_onAuthLogoutRequested);
    on<AuthUserUpdateRequested>(_onAuthUserUpdateRequested);
  }

  Future<void> _onAuthLoginRequested(
    AuthLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    try {
      emit(AuthLoading());
      
      final authResponse = await _authService.login(
        email: event.email,
        password: event.password,
      );

      if (authResponse.user != null) {
        emit(AuthAuthenticated(authResponse.user!));
      } else {
        final user = await _authService.getCurrentUser();
        emit(AuthAuthenticated(user));
      }
    } catch (e) {
      emit(AuthError(e.toString()));
    }
  }
}
```

---

## **⚙️ AppBloc Implementation**

### **Events para Configuraciones**
```dart
abstract class AppEvent extends Equatable {
  const AppEvent();
}

class AppStarted extends AppEvent {}

class AppThemeChanged extends AppEvent {
  final String themeMode;
  const AppThemeChanged(this.themeMode);
}

class AppLanguageChanged extends AppEvent {
  final String language;
  const AppLanguageChanged(this.language);
}

class AppNotificationsToggled extends AppEvent {
  final bool enabled;
  const AppNotificationsToggled(this.enabled);
}
```

### **State de Configuraciones**
```dart
class AppReady extends AppState {
  final String themeMode;
  final String language;
  final bool notificationsEnabled;
  final bool isFirstLaunch;

  const AppReady({
    required this.themeMode,
    required this.language,
    required this.notificationsEnabled,
    required this.isFirstLaunch,
  });

  AppReady copyWith({
    String? themeMode,
    String? language,
    bool? notificationsEnabled,
    bool? isFirstLaunch,
  }) {
    return AppReady(
      themeMode: themeMode ?? this.themeMode,
      language: language ?? this.language,
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      isFirstLaunch: isFirstLaunch ?? this.isFirstLaunch,
    );
  }
}
```

### **Initialization Logic**
```dart
Future<void> _onAppStarted(
  AppStarted event,
  Emitter<AppState> emit,
) async {
  try {
    emit(AppLoading());

    // Inicializar servicios
    await PreferencesService.initialize();

    // Cargar configuraciones
    final themeMode = PreferencesService.getThemeMode();
    final language = PreferencesService.getLanguage();
    final notificationsEnabled = PreferencesService.areNotificationsEnabled();
    final isFirstLaunch = PreferencesService.isFirstLaunch();

    emit(AppReady(
      themeMode: themeMode,
      language: language,
      notificationsEnabled: notificationsEnabled,
      isFirstLaunch: isFirstLaunch,
    ));
  } catch (e) {
    // Valores por defecto en caso de error
    emit(const AppReady(
      themeMode: 'system',
      language: 'es',
      notificationsEnabled: true,
      isFirstLaunch: false,
    ));
  }
}
```

---

## **🔧 Dependency Injection**

### **MultiBlocProvider Setup**
```dart
class MercenaryApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (context) => AppBloc()..add(AppStarted()),
        ),
        BlocProvider(
          create: (context) => AuthBloc(authService: AuthService())
            ..add(AuthCheckRequested()),
        ),
      ],
      child: BlocBuilder<AppBloc, AppState>(
        builder: (context, appState) {
          // App configuration logic
        },
      ),
    );
  }
}
```

### **Service Locator Pattern**
```dart
// Futuro: Implementar GetIt para inyección de dependencias
class ServiceLocator {
  static final GetIt _getIt = GetIt.instance;
  
  static void setup() {
    _getIt.registerLazySingleton<HttpService>(() => HttpService());
    _getIt.registerLazySingleton<AuthService>(() => AuthService());
  }
  
  static T get<T extends Object>() => _getIt<T>();
}
```

---

## **🔄 State Management Flow**

### **Authentication Flow**
```
1. User Input (Login Form)
   ↓
2. AuthLoginRequested Event
   ↓
3. AuthBloc processes event
   ↓
4. AuthService.login() call
   ↓
5. HTTP request to backend
   ↓
6. Token storage + User data
   ↓
7. AuthAuthenticated State
   ↓
8. UI Navigation to Home
```

### **App Configuration Flow**
```
1. App Startup
   ↓
2. AppStarted Event
   ↓
3. PreferencesService.initialize()
   ↓
4. Load saved preferences
   ↓
5. AppReady State
   ↓
6. UI renders with configurations
```

---

## **🎨 UI Integration**

### **BlocBuilder Pattern**
```dart
BlocBuilder<AuthBloc, AuthState>(
  builder: (context, state) {
    if (state is AuthLoading) {
      return const CircularProgressIndicator();
    } else if (state is AuthAuthenticated) {
      return HomeScreen(user: state.user);
    } else if (state is AuthUnauthenticated) {
      return const LoginScreen();
    } else if (state is AuthError) {
      return ErrorWidget(message: state.message);
    }
    return const SplashScreen();
  },
)
```

### **BlocListener Pattern**
```dart
BlocListener<AuthBloc, AuthState>(
  listener: (context, state) {
    if (state is AuthError) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(state.message),
          backgroundColor: Colors.red,
        ),
      );
    } else if (state is AuthAuthenticated) {
      // Navegación automática o acciones adicionales
    }
  },
  child: // UI widgets
)
```

### **BlocConsumer Pattern**
```dart
BlocConsumer<AuthBloc, AuthState>(
  listener: (context, state) {
    // Side effects (navigation, snackbars, etc.)
  },
  builder: (context, state) {
    // UI building based on state
  },
)
```

---

## **🔀 Navigation Integration**

### **Conditional Routing**
```dart
GoRouter _createRouter(AuthState authState) {
  return GoRouter(
    initialLocation: _getInitialLocation(authState),
    redirect: (context, state) {
      final isAuthenticated = authState is AuthAuthenticated;
      final isOnAuthPage = state.uri.path == '/login' || 
                          state.uri.path == '/register' ||
                          state.uri.path == '/';

      // Redirect logic based on auth state
      if (isAuthenticated && isOnAuthPage) {
        return '/home';
      }

      if (!isAuthenticated && !isOnAuthPage) {
        return '/login';
      }

      return null; // No redirect needed
    },
    routes: [
      // Route definitions
    ],
  );
}
```

### **Theme Integration**
```dart
BlocBuilder<AppBloc, AppState>(
  builder: (context, appState) {
    if (appState is! AppReady) {
      return LoadingScreen();
    }

    return MaterialApp.router(
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: _getThemeMode(appState.themeMode),
      routerConfig: _createRouter(authState),
    );
  },
)
```

---

## **🧪 Testing Strategy**

### **BLoC Testing with bloc_test**
```dart
group('AuthBloc', () {
  late AuthBloc authBloc;
  late MockAuthService mockAuthService;

  setUp(() {
    mockAuthService = MockAuthService();
    authBloc = AuthBloc(authService: mockAuthService);
  });

  blocTest<AuthBloc, AuthState>(
    'emits [AuthLoading, AuthAuthenticated] when login succeeds',
    build: () {
      when(mockAuthService.login(
        email: 'test@example.com',
        password: 'password123',
      )).thenAnswer((_) async => mockAuthResponse);
      return authBloc;
    },
    act: (bloc) => bloc.add(const AuthLoginRequested(
      email: 'test@example.com',
      password: 'password123',
    )),
    expect: () => [
      AuthLoading(),
      AuthAuthenticated(mockUser),
    ],
  );
});
```

### **Widget Testing with BLoC**
```dart
testWidgets('LoginScreen should show error on AuthError state', (tester) async {
  final authBloc = MockAuthBloc();
  
  when(() => authBloc.state).thenReturn(const AuthError('Login failed'));
  
  await tester.pumpWidget(
    BlocProvider<AuthBloc>.value(
      value: authBloc,
      child: MaterialApp(home: LoginScreen()),
    ),
  );
  
  expect(find.text('Login failed'), findsOneWidget);
});
```

---

## **📊 Performance Optimizations**

### **State Equality**
```dart
class AuthAuthenticated extends AuthState {
  final UserModel user;
  
  const AuthAuthenticated(this.user);
  
  @override
  List<Object> get props => [user];
}
```

### **Selective Rebuilds**
```dart
BlocSelector<AuthBloc, AuthState, String?>(
  selector: (state) {
    if (state is AuthAuthenticated) {
      return state.user.fullName;
    }
    return null;
  },
  builder: (context, userName) {
    return Text(userName ?? 'Guest');
  },
)
```

### **BLoC Disposal**
```dart
@override
void dispose() {
  authBloc.close();
  appBloc.close();
  super.dispose();
}
```

---

## **🔄 State Persistence**

### **Hydrated BLoC (Futuro)**
```dart
class AuthBloc extends HydratedBloc<AuthEvent, AuthState> {
  @override
  AuthState? fromJson(Map<String, dynamic> json) {
    try {
      if (json['type'] == 'AuthAuthenticated') {
        return AuthAuthenticated(
          UserModel.fromJson(json['user']),
        );
      }
    } catch (_) {
      return null;
    }
    return null;
  }

  @override
  Map<String, dynamic>? toJson(AuthState state) {
    if (state is AuthAuthenticated) {
      return {
        'type': 'AuthAuthenticated',
        'user': state.user.toJson(),
      };
    }
    return null;
  }
}
```

---

## **🔧 Advanced Patterns**

### **BLoC Composition**
```dart
class HomeBloc extends Bloc<HomeEvent, HomeState> {
  final AuthBloc authBloc;
  final AnnouncementBloc announcementBloc;
  
  late StreamSubscription authSubscription;
  
  HomeBloc({
    required this.authBloc,
    required this.announcementBloc,
  }) : super(HomeInitial()) {
    // Listen to auth changes
    authSubscription = authBloc.stream.listen((authState) {
      if (authState is AuthAuthenticated) {
        add(HomeUserChanged(authState.user));
      }
    });
  }
  
  @override
  Future<void> close() {
    authSubscription.cancel();
    return super.close();
  }
}
```

### **Event Transformation**
```dart
@override
Stream<Transition<AuthEvent, AuthState>> transformEvents(
  Stream<AuthEvent> events,
  TransitionFunction<AuthEvent, AuthState> transitionFn,
) {
  return events
      .debounceTime(const Duration(milliseconds: 300))
      .switchMap(transitionFn);
}
```

---

## **✅ State Management Checklist**

### **Completado**
- [x] AuthBloc con eventos y estados completos
- [x] AppBloc para configuraciones globales
- [x] MultiBlocProvider setup
- [x] Navigation integration
- [x] Error handling en BLoCs
- [x] Testing framework configurado

### **Pendiente**
- [ ] HydratedBloc para persistencia
- [ ] BLoC composition avanzada
- [ ] Performance monitoring
- [ ] State debugging tools
- [ ] Advanced error recovery

---

## **🎯 Métricas de Estado**

### **Funcionalidad**
- ✅ **State Transitions**: Fluidas y predecibles
- ✅ **Error Handling**: Centralizado y user-friendly
- ✅ **Navigation**: Reactiva al estado de auth
- ✅ **Persistence**: Configuraciones guardadas

### **Performance**
- 🎯 **Rebuild Efficiency**: Solo widgets necesarios
- 🎯 **Memory Usage**: BLoCs disposed correctamente
- 🎯 **State Size**: Optimizado con Equatable

---

*Documentación actualizada el 26 de Julio, 2025*  
*Estado: Implementación Completa - Estado Global Funcional*
