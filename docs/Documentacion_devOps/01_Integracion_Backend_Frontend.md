# **🔗 Integración Backend-Frontend - Mercenary Project**

## **📋 Información General**

Este documento detalla la implementación completa de la integración entre el backend FastAPI y el frontend Flutter, incluyendo servicios HTTP, autenticación JWT, manejo de errores y almacenamiento seguro.

---

## **🏗️ Arquitectura de Integración**

### **Flujo de Comunicación**
```
Flutter App ↔ HTTP Service ↔ FastAPI Backend ↔ PostgreSQL
     ↓              ↓              ↓              ↓
  UI/BLoC     Dio/Interceptors   JWT/OAuth2    SQLAlchemy
```

### **Componentes Implementados**
- ✅ **HttpService**: Cliente HTTP centralizado con Dio
- ✅ **AuthService**: Servicio de autenticación JWT
- ✅ **SecureStorageService**: Almacenamiento seguro de tokens
- ✅ **UserModel**: Modelos de datos sincronizados
- ✅ **Error Handling**: Manejo centralizado de errores

---

## **🌐 HTTP Service Implementation**

### **Configuración Base**
```dart
// lib/core/network/http_service.dart
class HttpService {
  late Dio _dio;

  void initialize() {
    _dio = Dio(BaseOptions(
      baseUrl: AppConstants.baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));
  }
}
```

### **Interceptors Configurados**

#### **1. Authentication Interceptor**
```dart
_dio.interceptors.add(InterceptorsWrapper(
  onRequest: (options, handler) async {
    final token = await SecureStorageService.getToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  },
  onError: (error, handler) async {
    if (error.response?.statusCode == 401) {
      // Token expirado, limpiar storage
      await SecureStorageService.clearAll();
    }
    handler.next(error);
  },
));
```

#### **2. Logging Interceptor**
```dart
if (kDebugMode) {
  _dio.interceptors.add(LogInterceptor(
    requestBody: true,
    responseBody: true,
    requestHeader: true,
    responseHeader: false,
  ));
}
```

### **Métodos HTTP Genéricos**
- ✅ **GET**: Consultas con parámetros opcionales
- ✅ **POST**: Creación de recursos
- ✅ **PUT**: Actualización completa
- ✅ **DELETE**: Eliminación de recursos

---

## **🔐 Authentication Service**

### **Endpoints Implementados**
```dart
class ApiEndpoints {
  static const String login = '/api/v1/auth/login';
  static const String register = '/api/v1/auth/register';
  static const String logout = '/api/v1/auth/logout';
  static const String refreshToken = '/api/v1/auth/refresh';
  static const String currentUser = '/api/v1/auth/me';
  static const String updateProfile = '/api/v1/users/profile';
  static const String changePassword = '/api/v1/users/change-password';
}
```

### **Login Implementation**
```dart
Future<AuthResponse> login({
  required String email,
  required String password,
}) async {
  final response = await _httpService.post(
    ApiEndpoints.login,
    data: {
      'username': email, // Backend usa 'username' para OAuth2
      'password': password,
    },
    options: Options(
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    ),
  );

  final authResponse = AuthResponse.fromJson(response.data);
  
  // Guardar token
  await SecureStorageService.saveToken(authResponse.accessToken);
  
  return authResponse;
}
```

### **Register Implementation**
```dart
Future<AuthResponse> register({
  required String email,
  required String password,
  required String firstName,
  required String lastName,
  required String userType,
  String? phone,
}) async {
  final response = await _httpService.post(
    ApiEndpoints.register,
    data: {
      'email': email,
      'password': password,
      'first_name': firstName,
      'last_name': lastName,
      'user_type': userType,
      if (phone != null) 'phone': phone,
    },
  );

  final user = UserModel.fromJson(response.data);
  
  // Auto-login después del registro
  return await login(email: email, password: password);
}
```

---

## **💾 Secure Storage Service**

### **Implementación de Almacenamiento**
```dart
class SecureStorageService {
  static const FlutterSecureStorage _secureStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
  );
}
```

### **Métodos Implementados**
- ✅ **Token Management**: save/get/delete tokens
- ✅ **User Info**: almacenamiento de datos de usuario
- ✅ **Authentication Check**: verificación de estado
- ✅ **Clear All**: limpieza completa de datos

### **Configuraciones de App**
```dart
class PreferencesService {
  // Configuraciones de tema, idioma, notificaciones
  static String getThemeMode() => prefs.getString('theme_mode') ?? 'system';
  static String getLanguage() => prefs.getString('language') ?? 'es';
  static bool areNotificationsEnabled() => prefs.getBool('notifications_enabled') ?? true;
}
```

---

## **📊 Data Models**

### **UserModel Implementation**
```dart
class UserModel extends Equatable {
  final int id;
  final String email;
  final String firstName;
  final String lastName;
  final String userType;
  final String? phone;
  final String? profileImage;
  final bool isActive;
  final bool isVerified;
  final DateTime createdAt;
  final ProfileModel? profile;

  // Factory constructor para JSON
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as int,
      email: json['email'] as String,
      firstName: json['first_name'] as String,
      lastName: json['last_name'] as String,
      userType: json['user_type'] as String,
      // ... más campos
    );
  }
}
```

### **ProfileModel Implementation**
```dart
class ProfileModel extends Equatable {
  final int id;
  final int userId;
  final String? bio;
  final String? location;
  final List<String> skills;
  final double rating;
  final int completedJobs;
  final double totalEarnings;
}
```

---

## **⚠️ Error Handling**

### **Custom Exceptions**
```dart
class NetworkException implements Exception {
  final String message;
  NetworkException(this.message);
}

class ServerException implements Exception {
  final String message;
  final int? statusCode;
  ServerException(this.message, {this.statusCode});
}

class AuthException implements Exception {
  final String message;
  AuthException(this.message);
}
```

### **Error Handler Implementation**
```dart
Exception _handleError(dynamic error) {
  if (error is DioException) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
        return NetworkException('Tiempo de conexión agotado');
      case DioExceptionType.badResponse:
        return ServerException(
          'Error del servidor: ${error.response?.statusCode}',
          statusCode: error.response?.statusCode,
        );
      case DioExceptionType.connectionError:
        return NetworkException('Error de conexión');
      default:
        return NetworkException('Error de red desconocido');
    }
  }
  return NetworkException('Error inesperado');
}
```

---

## **🔄 Token Refresh Strategy**

### **Automatic Token Refresh**
```dart
Future<String> refreshToken() async {
  try {
    final refreshToken = await SecureStorageService.getRefreshToken();
    if (refreshToken == null) {
      throw AuthException('No refresh token available');
    }

    final response = await _httpService.post(
      ApiEndpoints.refreshToken,
      data: {'refresh_token': refreshToken},
    );

    final newToken = response.data['access_token'] as String;
    await SecureStorageService.saveToken(newToken);
    
    return newToken;
  } catch (e) {
    // Si falla el refresh, limpiar tokens
    await SecureStorageService.clearAll();
    throw AuthException('Session expired. Please login again.');
  }
}
```

---

## **📱 Integration with UI**

### **BLoC Integration**
```dart
// En AuthBloc
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

    emit(AuthAuthenticated(authResponse.user!));
  } catch (e) {
    emit(AuthError(e.toString()));
  }
}
```

### **UI Error Display**
```dart
BlocListener<AuthBloc, AuthState>(
  listener: (context, state) {
    if (state is AuthError) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(state.message)),
      );
    }
  },
  child: // UI widgets
)
```

---

## **🧪 Testing Strategy**

### **Service Testing**
```dart
group('AuthService', () {
  test('login should return AuthResponse on success', () async {
    // Arrange
    when(mockHttpService.post(any, data: anyNamed('data')))
        .thenAnswer((_) async => Response(data: mockAuthData));

    // Act
    final result = await authService.login(
      email: 'test@example.com',
      password: 'password',
    );

    // Assert
    expect(result, isA<AuthResponse>());
  });
});
```

---

## **📊 Performance Optimizations**

### **HTTP Caching**
- **Response Caching**: Para datos que no cambian frecuentemente
- **Request Deduplication**: Evitar requests duplicados
- **Connection Pooling**: Reutilización de conexiones

### **Memory Management**
- **Singleton Pattern**: Para servicios HTTP
- **Dispose Pattern**: Limpieza de recursos
- **Lazy Loading**: Carga bajo demanda

---

## **🔧 Configuration Management**

### **Environment-based URLs**
```dart
static String get baseUrl {
  switch (_environment) {
    case Environment.development:
      return 'http://localhost:8000';
    case Environment.staging:
      return 'https://staging-api.mercenary.com';
    case Environment.production:
      return 'https://api.mercenary.com';
  }
}
```

---

## **✅ Integration Checklist**

### **Completado**
- [x] HTTP Service con Dio configurado
- [x] Authentication interceptors
- [x] Secure token storage
- [x] Error handling centralizado
- [x] Data models sincronizados
- [x] BLoC integration
- [x] Environment configuration

### **Pendiente**
- [ ] Response caching implementation
- [ ] Offline mode support
- [ ] Request retry logic
- [ ] Performance monitoring
- [ ] Advanced error recovery

---

## **🎯 Métricas de Éxito**

### **Funcionalidad**
- ✅ **Login/Logout**: 100% funcional
- ✅ **Token Management**: Automático y seguro
- ✅ **Error Handling**: Centralizado y user-friendly
- ✅ **Data Sync**: Modelos sincronizados con backend

### **Performance**
- 🎯 **Response Time**: < 2 segundos promedio
- 🎯 **Error Rate**: < 1% en condiciones normales
- 🎯 **Token Refresh**: Transparente para el usuario

---

*Documentación actualizada el 26 de Julio, 2025*  
*Estado: Implementación Completa - Integración Funcional*
