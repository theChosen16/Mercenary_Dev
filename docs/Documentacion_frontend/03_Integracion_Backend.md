# **🔌 Integración con Backend - Mercenary App**

## **📋 Información General**

Este documento detalla la integración entre el frontend Flutter y el backend FastAPI, incluyendo configuración de APIs, autenticación, modelos de datos y manejo de errores.

---

## **🌐 Configuración de APIs**

### **Endpoints Base**
```dart
class AppConstants {
  static const String baseUrl = 'http://localhost:8000';
  static const String apiVersion = '/api/v1';
  static const String apiBaseUrl = '$baseUrl$apiVersion';
}
```

### **Endpoints Implementados**
```dart
class ApiEndpoints {
  // Autenticación
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String refreshToken = '/auth/refresh';
  static const String validateToken = '/auth/validate';
  
  // Usuarios
  static const String userProfile = '/users/me';
  static const String updateProfile = '/users/me';
  static const String userById = '/users';
  
  // Anuncios
  static const String announcements = '/announcements';
  static const String myAnnouncements = '/announcements/my';
  static const String createAnnouncement = '/announcements';
  
  // Categorías
  static const String categories = '/categories';
  
  // Contratos
  static const String contracts = '/contracts';
  static const String myContracts = '/contracts/my';
}
```

---

## **🔐 Sistema de Autenticación**

### **JWT Token Management**
```dart
class AuthService {
  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';
  
  // Almacenamiento seguro de tokens
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    final storage = FlutterSecureStorage();
    await storage.write(key: _accessTokenKey, value: accessToken);
    await storage.write(key: _refreshTokenKey, value: refreshToken);
  }
  
  // Recuperación de tokens
  Future<String?> getAccessToken() async {
    final storage = FlutterSecureStorage();
    return await storage.read(key: _accessTokenKey);
  }
  
  // Limpieza de tokens (logout)
  Future<void> clearTokens() async {
    final storage = FlutterSecureStorage();
    await storage.delete(key: _accessTokenKey);
    await storage.delete(key: _refreshTokenKey);
  }
}
```

### **HTTP Interceptor**
```dart
class AuthInterceptor extends Interceptor {
  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await AuthService().getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }
  
  @override
  void onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401) {
      // Token expirado - intentar refresh
      final refreshed = await _refreshToken();
      if (refreshed) {
        // Reintentar request original
        handler.resolve(await _retry(err.requestOptions));
        return;
      }
      // Redirect a login si refresh falla
      _redirectToLogin();
    }
    handler.next(err);
  }
}
```

---

## **📊 Modelos de Datos**

### **User Model**
```dart
class User extends Equatable {
  final int id;
  final String email;
  final String firstName;
  final String lastName;
  final UserType userType;
  final String? phone;
  final String? bio;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  const User({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.userType,
    this.phone,
    this.bio,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      firstName: json['first_name'],
      lastName: json['last_name'],
      userType: UserType.values.firstWhere(
        (e) => e.name == json['user_type'],
      ),
      phone: json['phone'],
      bio: json['bio'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'first_name': firstName,
      'last_name': lastName,
      'user_type': userType.name,
      'phone': phone,
      'bio': bio,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
```

### **Announcement Model**
```dart
class Announcement extends Equatable {
  final int id;
  final String title;
  final String description;
  final double budget;
  final int categoryId;
  final int offererId;
  final AnnouncementStatus status;
  final DateTime deadline;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  // Constructor y métodos fromJson/toJson...
}
```

### **Contract Model**
```dart
class Contract extends Equatable {
  final int id;
  final int announcementId;
  final int mercenaryId;
  final int offererId;
  final double amount;
  final ContractStatus status;
  final DateTime startDate;
  final DateTime? endDate;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  // Constructor y métodos fromJson/toJson...
}
```

---

## **🌐 Servicios HTTP**

### **Base HTTP Service**
```dart
class HttpService {
  late final Dio _dio;
  
  HttpService() {
    _dio = Dio(BaseOptions(
      baseUrl: AppConstants.apiBaseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));
    
    _dio.interceptors.addAll([
      AuthInterceptor(),
      LogInterceptor(
        requestBody: true,
        responseBody: true,
        logPrint: (obj) => Logger().d(obj),
      ),
    ]);
  }
  
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      return await _dio.get<T>(path, queryParameters: queryParameters);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }
  
  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      return await _dio.post<T>(
        path,
        data: data,
        queryParameters: queryParameters,
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }
}
```

### **Auth Service**
```dart
class AuthService {
  final HttpService _httpService;
  
  AuthService(this._httpService);
  
  Future<AuthResponse> login({
    required String email,
    required String password,
  }) async {
    final response = await _httpService.post(
      ApiEndpoints.login,
      data: FormData.fromMap({
        'username': email,
        'password': password,
      }),
    );
    
    return AuthResponse.fromJson(response.data);
  }
  
  Future<User> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    required UserType userType,
  }) async {
    final response = await _httpService.post(
      ApiEndpoints.register,
      data: {
        'email': email,
        'password': password,
        'first_name': firstName,
        'last_name': lastName,
        'user_type': userType.name.toUpperCase(),
      },
    );
    
    return User.fromJson(response.data);
  }
}
```

---

## **❌ Manejo de Errores**

### **Tipos de Errores**
```dart
abstract class Failure extends Equatable {
  final String message;
  final int? statusCode;
  
  const Failure(this.message, [this.statusCode]);
  
  @override
  List<Object?> get props => [message, statusCode];
}

class ServerFailure extends Failure {
  const ServerFailure(String message, [int? statusCode]) 
      : super(message, statusCode);
}

class NetworkFailure extends Failure {
  const NetworkFailure(String message) : super(message);
}

class AuthFailure extends Failure {
  const AuthFailure(String message) : super(message);
}

class ValidationFailure extends Failure {
  const ValidationFailure(String message) : super(message);
}
```

### **Error Handler**
```dart
class ErrorHandler {
  static Failure handleError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return const NetworkFailure('Tiempo de conexión agotado');
        
      case DioExceptionType.badResponse:
        return _handleHttpError(error.response!);
        
      case DioExceptionType.cancel:
        return const NetworkFailure('Solicitud cancelada');
        
      default:
        return const NetworkFailure('Error de conexión');
    }
  }
  
  static Failure _handleHttpError(Response response) {
    switch (response.statusCode) {
      case 400:
        return ValidationFailure(
          response.data['detail'] ?? 'Datos inválidos'
        );
      case 401:
        return const AuthFailure('No autorizado');
      case 403:
        return const AuthFailure('Acceso denegado');
      case 404:
        return const ServerFailure('Recurso no encontrado');
      case 500:
        return const ServerFailure('Error interno del servidor');
      default:
        return ServerFailure(
          'Error del servidor: ${response.statusCode}'
        );
    }
  }
}
```

---

## **💾 Almacenamiento Local**

### **Secure Storage**
```dart
class SecureStorageService {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: IOSAccessibility.first_unlock_this_device,
    ),
  );
  
  Future<void> write(String key, String value) async {
    await _storage.write(key: key, value: value);
  }
  
  Future<String?> read(String key) async {
    return await _storage.read(key: key);
  }
  
  Future<void> delete(String key) async {
    await _storage.delete(key: key);
  }
  
  Future<void> deleteAll() async {
    await _storage.deleteAll();
  }
}
```

### **Shared Preferences**
```dart
class PreferencesService {
  static SharedPreferences? _prefs;
  
  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }
  
  static bool getBool(String key, {bool defaultValue = false}) {
    return _prefs?.getBool(key) ?? defaultValue;
  }
  
  static Future<bool> setBool(String key, bool value) async {
    return await _prefs?.setBool(key, value) ?? false;
  }
  
  static String getString(String key, {String defaultValue = ''}) {
    return _prefs?.getString(key) ?? defaultValue;
  }
  
  static Future<bool> setString(String key, String value) async {
    return await _prefs?.setString(key, value) ?? false;
  }
}
```

---

## **🔄 Estados de Carga**

### **Resource State**
```dart
abstract class ResourceState<T> extends Equatable {
  const ResourceState();
}

class ResourceInitial<T> extends ResourceState<T> {
  const ResourceInitial();
  
  @override
  List<Object> get props => [];
}

class ResourceLoading<T> extends ResourceState<T> {
  const ResourceLoading();
  
  @override
  List<Object> get props => [];
}

class ResourceSuccess<T> extends ResourceState<T> {
  final T data;
  
  const ResourceSuccess(this.data);
  
  @override
  List<Object> get props => [data as Object];
}

class ResourceFailure<T> extends ResourceState<T> {
  final Failure failure;
  
  const ResourceFailure(this.failure);
  
  @override
  List<Object> get props => [failure];
}
```

---

## **🚀 Próximas Implementaciones**

### **Pendiente - Fase 2**
- ✅ **Configuración base** completada
- ⏳ **Autenticación JWT** - En desarrollo
- ⏳ **CRUD de anuncios** - Pendiente
- ⏳ **Gestión de perfil** - Pendiente
- ⏳ **Sistema de contratos** - Pendiente

### **Funcionalidades Avanzadas**
- **Refresh automático** de tokens
- **Caché inteligente** de datos
- **Sincronización offline** 
- **Push notifications**
- **Real-time updates** con WebSockets

### **Optimizaciones**
- **Request batching** para múltiples llamadas
- **Image caching** optimizado
- **Background sync** para datos críticos
- **Error retry** con backoff exponencial

---

*Documentación actualizada el 26 de Julio, 2025*  
*Estado de Integración: Configuración Base Completada*
