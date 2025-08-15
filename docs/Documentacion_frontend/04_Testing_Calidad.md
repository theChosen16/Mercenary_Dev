# **🧪 Testing y Calidad - Mercenary App**

## **📋 Información General**

Este documento describe la estrategia de testing, herramientas de calidad de código y métricas implementadas para garantizar la robustez y mantenibilidad de la aplicación móvil Mercenary.

---

## **🎯 Estrategia de Testing**

### **Pirámide de Testing**
```
        /\
       /  \
      / UI \     ← Tests de Integración (E2E)
     /______\
    /        \
   / Widget   \   ← Tests de Widgets (UI)
  /____________\
 /              \
/ Unit Tests     \ ← Tests Unitarios (Lógica)
/________________\
```

### **Cobertura Objetivo**
- **Tests Unitarios**: 80%+ de cobertura
- **Tests de Widgets**: 70%+ de pantallas críticas
- **Tests de Integración**: Flujos principales completos

---

## **🔬 Tests Unitarios**

### **Estructura de Tests**
```
test/
├── unit/
│   ├── core/
│   │   ├── constants/
│   │   └── utils/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   ├── domain/
│   │   │   └── presentation/
│   │   ├── announcements/
│   │   └── profile/
│   └── shared/
├── widget/
│   ├── auth/
│   ├── announcements/
│   └── profile/
└── integration/
    ├── auth_flow_test.dart
    ├── announcement_flow_test.dart
    └── profile_flow_test.dart
```

### **Ejemplo: Auth Bloc Test**
```dart
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';

import '../../../helpers/test_helper.mocks.dart';

void main() {
  group('AuthBloc', () {
    late AuthBloc authBloc;
    late MockAuthRepository mockAuthRepository;

    setUp(() {
      mockAuthRepository = MockAuthRepository();
      authBloc = AuthBloc(authRepository: mockAuthRepository);
    });

    tearDown(() {
      authBloc.close();
    });

    test('initial state should be AuthInitial', () {
      expect(authBloc.state, AuthInitial());
    });

    group('LoginRequested', () {
      const testEmail = 'test@example.com';
      const testPassword = 'password123';
      const testUser = User(
        id: 1,
        email: testEmail,
        firstName: 'Test',
        lastName: 'User',
        userType: UserType.mercenario,
        createdAt: '2025-01-26T00:00:00Z',
        updatedAt: '2025-01-26T00:00:00Z',
      );

      blocTest<AuthBloc, AuthState>(
        'should emit [AuthLoading, AuthSuccess] when login is successful',
        build: () {
          when(mockAuthRepository.login(
            email: testEmail,
            password: testPassword,
          )).thenAnswer((_) async => const Right(testUser));
          return authBloc;
        },
        act: (bloc) => bloc.add(const LoginRequested(
          email: testEmail,
          password: testPassword,
        )),
        expect: () => [
          AuthLoading(),
          const AuthSuccess(user: testUser),
        ],
        verify: (_) {
          verify(mockAuthRepository.login(
            email: testEmail,
            password: testPassword,
          ));
        },
      );

      blocTest<AuthBloc, AuthState>(
        'should emit [AuthLoading, AuthFailure] when login fails',
        build: () {
          when(mockAuthRepository.login(
            email: testEmail,
            password: testPassword,
          )).thenAnswer((_) async => const Left(
            AuthFailure('Invalid credentials'),
          ));
          return authBloc;
        },
        act: (bloc) => bloc.add(const LoginRequested(
          email: testEmail,
          password: testPassword,
        )),
        expect: () => [
          AuthLoading(),
          const AuthFailure(message: 'Invalid credentials'),
        ],
      );
    });
  });
}
```

### **Ejemplo: Repository Test**
```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:dartz/dartz.dart';

void main() {
  group('AuthRepositoryImpl', () {
    late AuthRepositoryImpl repository;
    late MockAuthRemoteDataSource mockRemoteDataSource;
    late MockAuthLocalDataSource mockLocalDataSource;

    setUp(() {
      mockRemoteDataSource = MockAuthRemoteDataSource();
      mockLocalDataSource = MockAuthLocalDataSource();
      repository = AuthRepositoryImpl(
        remoteDataSource: mockRemoteDataSource,
        localDataSource: mockLocalDataSource,
      );
    });

    group('login', () {
      const testEmail = 'test@example.com';
      const testPassword = 'password123';
      const testAuthResponse = AuthResponse(
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        user: testUser,
      );

      test('should return User when login is successful', () async {
        // Arrange
        when(mockRemoteDataSource.login(
          email: testEmail,
          password: testPassword,
        )).thenAnswer((_) async => testAuthResponse);

        // Act
        final result = await repository.login(
          email: testEmail,
          password: testPassword,
        );

        // Assert
        expect(result, const Right(testUser));
        verify(mockRemoteDataSource.login(
          email: testEmail,
          password: testPassword,
        ));
        verify(mockLocalDataSource.saveTokens(
          accessToken: testAuthResponse.accessToken,
          refreshToken: testAuthResponse.refreshToken,
        ));
      });
    });
  });
}
```

---

## **🎨 Tests de Widgets**

### **Ejemplo: Login Screen Test**
```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mockito/mockito.dart';

import '../../../helpers/test_helper.dart';

void main() {
  group('LoginScreen', () {
    late MockAuthBloc mockAuthBloc;

    setUp(() {
      mockAuthBloc = MockAuthBloc();
    });

    testWidgets('should display all required fields', (tester) async {
      // Arrange
      when(() => mockAuthBloc.state).thenReturn(AuthInitial());

      // Act
      await tester.pumpWidget(
        createWidgetUnderTest(
          child: BlocProvider<AuthBloc>(
            create: (_) => mockAuthBloc,
            child: const LoginScreen(),
          ),
        ),
      );

      // Assert
      expect(find.text('Bienvenido a Mercenary'), findsOneWidget);
      expect(find.byType(TextFormField), findsNWidgets(2));
      expect(find.text('Correo electrónico'), findsOneWidget);
      expect(find.text('Contraseña'), findsOneWidget);
      expect(find.text('Iniciar Sesión'), findsOneWidget);
    });

    testWidgets('should show validation errors for empty fields', (tester) async {
      // Arrange
      when(() => mockAuthBloc.state).thenReturn(AuthInitial());

      await tester.pumpWidget(
        createWidgetUnderTest(
          child: BlocProvider<AuthBloc>(
            create: (_) => mockAuthBloc,
            child: const LoginScreen(),
          ),
        ),
      );

      // Act
      await tester.tap(find.text('Iniciar Sesión'));
      await tester.pump();

      // Assert
      expect(find.text('Por favor ingresa tu correo electrónico'), findsOneWidget);
      expect(find.text('Por favor ingresa tu contraseña'), findsOneWidget);
    });

    testWidgets('should trigger login when form is valid', (tester) async {
      // Arrange
      when(() => mockAuthBloc.state).thenReturn(AuthInitial());

      await tester.pumpWidget(
        createWidgetUnderTest(
          child: BlocProvider<AuthBloc>(
            create: (_) => mockAuthBloc,
            child: const LoginScreen(),
          ),
        ),
      );

      // Act
      await tester.enterText(
        find.byType(TextFormField).first,
        'test@example.com',
      );
      await tester.enterText(
        find.byType(TextFormField).last,
        'password123',
      );
      await tester.tap(find.text('Iniciar Sesión'));
      await tester.pump();

      // Assert
      verify(() => mockAuthBloc.add(const LoginRequested(
        email: 'test@example.com',
        password: 'password123',
      ))).called(1);
    });
  });
}
```

### **Test Helpers**
```dart
// test/helpers/test_helper.dart
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

Widget createWidgetUnderTest({required Widget child}) {
  return MaterialApp(
    localizationsDelegates: const [
      GlobalMaterialLocalizations.delegate,
      GlobalWidgetsLocalizations.delegate,
      GlobalCupertinoLocalizations.delegate,
    ],
    supportedLocales: const [Locale('es', 'ES')],
    home: child,
  );
}

// Mock classes
@GenerateMocks([
  AuthRepository,
  AuthRemoteDataSource,
  AuthLocalDataSource,
])
void main() {}
```

---

## **🔄 Tests de Integración**

### **Ejemplo: Auth Flow Test**
```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:mercenary_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Authentication Flow', () {
    testWidgets('complete login flow', (tester) async {
      // Start app
      app.main();
      await tester.pumpAndSettle();

      // Wait for splash screen to finish
      await tester.pumpAndSettle(const Duration(seconds: 4));

      // Should be on login screen
      expect(find.text('Bienvenido a Mercenary'), findsOneWidget);

      // Enter credentials
      await tester.enterText(
        find.byType(TextFormField).first,
        'test@example.com',
      );
      await tester.enterText(
        find.byType(TextFormField).last,
        'password123',
      );

      // Tap login button
      await tester.tap(find.text('Iniciar Sesión'));
      await tester.pumpAndSettle();

      // Should navigate to home screen
      expect(find.text('Trabajos Disponibles'), findsOneWidget);
      expect(find.byType(BottomNavigationBar), findsOneWidget);
    });

    testWidgets('complete registration flow', (tester) async {
      app.main();
      await tester.pumpAndSettle(const Duration(seconds: 4));

      // Navigate to register
      await tester.tap(find.text('Regístrate'));
      await tester.pumpAndSettle();

      // Fill registration form
      await tester.tap(find.text('Mercenario'));
      await tester.enterText(find.byType(TextFormField).at(0), 'Juan');
      await tester.enterText(find.byType(TextFormField).at(1), 'Pérez');
      await tester.enterText(find.byType(TextFormField).at(2), 'juan@test.com');
      await tester.enterText(find.byType(TextFormField).at(3), 'password123');
      await tester.enterText(find.byType(TextFormField).at(4), 'password123');

      // Accept terms
      await tester.tap(find.byType(Checkbox));

      // Submit registration
      await tester.tap(find.text('Crear Cuenta'));
      await tester.pumpAndSettle();

      // Should return to login
      expect(find.text('Bienvenido a Mercenary'), findsOneWidget);
    });
  });
}
```

---

## **📊 Análisis Estático**

### **Configuración de Linting**
```yaml
# analysis_options.yaml
include: package:flutter_lints/flutter.yaml

analyzer:
  exclude:
    - "**/*.g.dart"
    - "**/*.freezed.dart"
  
  strong-mode:
    implicit-casts: false
    implicit-dynamic: false

linter:
  rules:
    # Errores
    avoid_print: true
    avoid_unnecessary_containers: true
    avoid_web_libraries_in_flutter: true
    no_logic_in_create_state: true
    prefer_const_constructors: true
    prefer_const_declarations: true
    prefer_const_literals_to_create_immutables: true
    
    # Estilo
    always_declare_return_types: true
    always_specify_types: false
    annotate_overrides: true
    avoid_function_literals_in_foreach_calls: true
    avoid_redundant_argument_values: true
    avoid_returning_null_for_void: true
    camel_case_types: true
    empty_constructor_bodies: true
    library_names: true
    prefer_single_quotes: true
    sort_constructors_first: true
    sort_unnamed_constructors_first: true
    unawaited_futures: true
    unnecessary_const: true
    unnecessary_new: true
    use_key_in_widget_constructors: true
```

### **Comandos de Análisis**
```bash
# Análisis completo
flutter analyze

# Análisis con métricas
dart analyze --fatal-infos

# Formateo de código
dart format lib/ test/

# Verificación de dependencias
flutter pub deps
```

---

## **📈 Métricas de Calidad**

### **Cobertura de Código**
```bash
# Generar reporte de cobertura
flutter test --coverage

# Convertir a HTML
genhtml coverage/lcov.info -o coverage/html

# Ver reporte
open coverage/html/index.html
```

### **Métricas Objetivo**
```dart
// Métricas actuales (Fase 1)
Cobertura de Tests:     0% (Pendiente implementar)
Complejidad Ciclomática: < 10 por método
Líneas por Archivo:     < 300 líneas
Métodos por Clase:      < 20 métodos
Parámetros por Método:  < 5 parámetros

// Métricas objetivo (Fase 2)
Cobertura de Tests:     80%+
Bugs por KLOC:         < 1
Tiempo de Build:       < 2 minutos
Warnings:              0
```

---

## **🔧 Herramientas de Calidad**

### **Dependencias de Testing**
```yaml
dev_dependencies:
  flutter_test:
    sdk: flutter
  
  # Testing
  bloc_test: ^9.1.7
  mockito: ^5.4.4
  build_runner: ^2.4.9
  
  # Integration Testing
  integration_test:
    sdk: flutter
  
  # Code Generation
  json_annotation: ^4.9.0
  json_serializable: ^6.8.0
  
  # Linting
  flutter_lints: ^5.0.0
  very_good_analysis: ^6.0.0
```

### **Scripts de Automatización**
```bash
#!/bin/bash
# scripts/test.sh

echo "🧪 Ejecutando tests..."

# Tests unitarios
echo "📋 Tests unitarios..."
flutter test test/unit/

# Tests de widgets
echo "🎨 Tests de widgets..."
flutter test test/widget/

# Tests de integración
echo "🔄 Tests de integración..."
flutter test integration_test/

# Generar cobertura
echo "📊 Generando cobertura..."
flutter test --coverage

echo "✅ Tests completados!"
```

---

## **🚀 CI/CD Testing**

### **GitHub Actions**
```yaml
name: Flutter CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Flutter
      uses: subosito/flutter-action@v2
      with:
        flutter-version: '3.32.8'
        
    - name: Install dependencies
      run: flutter pub get
      
    - name: Analyze code
      run: flutter analyze
      
    - name: Run tests
      run: flutter test --coverage
      
    - name: Upload coverage
      uses: codecov/codecov-action@v4
      with:
        file: coverage/lcov.info
```

---

## **📋 Checklist de Calidad**

### **Pre-commit**
- [ ] Código formateado (`dart format`)
- [ ] Sin warnings de análisis (`flutter analyze`)
- [ ] Tests unitarios pasan
- [ ] Cobertura > 80% en nuevos archivos

### **Pre-release**
- [ ] Todos los tests pasan
- [ ] Tests de integración completos
- [ ] Performance testing
- [ ] Accessibility testing
- [ ] Security scanning

---

## **🎯 Roadmap de Testing**

### **Fase 2 (Próximas 2 semanas)**
- ✅ **Configuración base** completada
- ⏳ **Tests unitarios** para BLoCs y repositorios
- ⏳ **Tests de widgets** para pantallas críticas
- ⏳ **Mocks y fixtures** para datos de prueba

### **Fase 3 (1 mes)**
- **Tests de integración** completos
- **Golden tests** para UI consistency
- **Performance tests** automatizados
- **Accessibility tests**

### **Fase 4 (2 meses)**
- **E2E testing** con dispositivos reales
- **Visual regression testing**
- **Load testing** para APIs
- **Security testing** automatizado

---

*Documentación actualizada el 26 de Julio, 2025*  
*Estado de Testing: Configuración Base - Implementación Pendiente*
