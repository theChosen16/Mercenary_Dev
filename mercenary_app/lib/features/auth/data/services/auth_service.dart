import 'package:dio/dio.dart';
import '../../../../core/network/http_service.dart';
import '../../../../core/storage/secure_storage_service.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../shared/models/user_model.dart';

class AuthService {
  final HttpService _httpService = HttpService();

  // Login
  Future<AuthResponse> login({
    required String email,
    required String password,
  }) async {
    try {
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
      
      // Guardar token y obtener información del usuario
      await SecureStorageService.saveToken(authResponse.accessToken);
      if (authResponse.refreshToken != null) {
        await SecureStorageService.saveRefreshToken(authResponse.refreshToken!);
      }

      // Obtener información del usuario actual
      final userInfo = await getCurrentUser();
      
      // Guardar información del usuario
      await SecureStorageService.saveUserInfo(
        userId: userInfo.id.toString(),
        email: userInfo.email,
        userType: userInfo.userType,
      );

      return authResponse.copyWith(user: userInfo);
    } catch (e) {
      throw _handleAuthError(e);
    }
  }

  // Registro
  Future<AuthResponse> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    required String userType,
    String? phone,
  }) async {
    try {
      await _httpService.post(
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

      // Después del registro, hacer login automático
      return await login(email: email, password: password);
    } catch (e) {
      throw _handleAuthError(e);
    }
  }

  // Obtener usuario actual
  Future<UserModel> getCurrentUser() async {
    try {
      final response = await _httpService.get(ApiEndpoints.currentUser);
      return UserModel.fromJson(response.data);
    } catch (e) {
      throw _handleAuthError(e);
    }
  }

  // Actualizar perfil
  Future<UserModel> updateProfile({
    String? firstName,
    String? lastName,
    String? phone,
    String? bio,
    String? location,
    String? website,
    List<String>? skills,
  }) async {
    try {
      final response = await _httpService.put(
        ApiEndpoints.updateProfile,
        data: {
          if (firstName != null) 'first_name': firstName,
          if (lastName != null) 'last_name': lastName,
          if (phone != null) 'phone': phone,
          if (bio != null) 'bio': bio,
          if (location != null) 'location': location,
          if (website != null) 'website': website,
          if (skills != null) 'skills': skills,
        },
      );

      return UserModel.fromJson(response.data);
    } catch (e) {
      throw _handleAuthError(e);
    }
  }

  // Cambiar contraseña
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      await _httpService.put(
        ApiEndpoints.changePassword,
        data: {
          'current_password': currentPassword,
          'new_password': newPassword,
        },
      );
    } catch (e) {
      throw _handleAuthError(e);
    }
  }

  // Logout
  Future<void> logout() async {
    try {
      // Intentar logout en el servidor
      await _httpService.post(ApiEndpoints.logout);
    } catch (e) {
      // Continuar con logout local aunque falle el servidor
    } finally {
      // Limpiar almacenamiento local
      await SecureStorageService.clearAll();
    }
  }

  // Refresh token
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
      // Si falla el refresh, limpiar tokens y requerir login
      await SecureStorageService.clearAll();
      throw AuthException('Session expired. Please login again.');
    }
  }

  // Verificar si está autenticado
  Future<bool> isAuthenticated() async {
    return await SecureStorageService.isAuthenticated();
  }

  // Manejo de errores de autenticación
  AuthException _handleAuthError(dynamic error) {
    if (error is DioException) {
      final statusCode = error.response?.statusCode;
      final message = error.response?.data?['detail'] ?? 
                     error.response?.data?['message'] ?? 
                     'Error de autenticación';

      switch (statusCode) {
        case 400:
          return AuthException('Datos inválidos: $message');
        case 401:
          return AuthException('Credenciales incorrectas');
        case 403:
          return AuthException('Acceso denegado');
        case 409:
          return AuthException('El usuario ya existe');
        case 422:
          return AuthException('Datos de entrada inválidos');
        default:
          return AuthException(message);
      }
    }
    return AuthException('Error inesperado de autenticación');
  }
}

// Modelo de respuesta de autenticación
class AuthResponse {
  final String accessToken;
  final String? refreshToken;
  final String tokenType;
  final UserModel? user;

  AuthResponse({
    required this.accessToken,
    this.refreshToken,
    required this.tokenType,
    this.user,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      accessToken: json['access_token'] as String,
      refreshToken: json['refresh_token'] as String?,
      tokenType: json['token_type'] as String? ?? 'bearer',
      user: json['user'] != null 
          ? UserModel.fromJson(json['user'] as Map<String, dynamic>)
          : null,
    );
  }

  AuthResponse copyWith({
    String? accessToken,
    String? refreshToken,
    String? tokenType,
    UserModel? user,
  }) {
    return AuthResponse(
      accessToken: accessToken ?? this.accessToken,
      refreshToken: refreshToken ?? this.refreshToken,
      tokenType: tokenType ?? this.tokenType,
      user: user ?? this.user,
    );
  }
}

// Excepción personalizada para autenticación
class AuthException implements Exception {
  final String message;
  AuthException(this.message);

  @override
  String toString() => message;
}
