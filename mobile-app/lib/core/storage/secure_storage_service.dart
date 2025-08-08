import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SecureStorageService {
  static const FlutterSecureStorage _secureStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
  );

  // Claves para el almacenamiento
  static const String _tokenKey = 'auth_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const String _userIdKey = 'user_id';
  static const String _userEmailKey = 'user_email';
  static const String _userTypeKey = 'user_type';

  // Token de autenticación
  static Future<void> saveToken(String token) async {
    await _secureStorage.write(key: _tokenKey, value: token);
  }

  static Future<String?> getToken() async {
    return await _secureStorage.read(key: _tokenKey);
  }

  static Future<void> deleteToken() async {
    await _secureStorage.delete(key: _tokenKey);
  }

  // Refresh token
  static Future<void> saveRefreshToken(String refreshToken) async {
    await _secureStorage.write(key: _refreshTokenKey, value: refreshToken);
  }

  static Future<String?> getRefreshToken() async {
    return await _secureStorage.read(key: _refreshTokenKey);
  }

  static Future<void> deleteRefreshToken() async {
    await _secureStorage.delete(key: _refreshTokenKey);
  }

  // Información del usuario
  static Future<void> saveUserInfo({
    required String userId,
    required String email,
    required String userType,
  }) async {
    await Future.wait([
      _secureStorage.write(key: _userIdKey, value: userId),
      _secureStorage.write(key: _userEmailKey, value: email),
      _secureStorage.write(key: _userTypeKey, value: userType),
    ]);
  }

  static Future<String?> getUserId() async {
    return await _secureStorage.read(key: _userIdKey);
  }

  static Future<String?> getUserEmail() async {
    return await _secureStorage.read(key: _userEmailKey);
  }

  static Future<String?> getUserType() async {
    return await _secureStorage.read(key: _userTypeKey);
  }

  // Verificar si el usuario está autenticado
  static Future<bool> isAuthenticated() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  // Limpiar toda la información de autenticación
  static Future<void> clearAll() async {
    await Future.wait([
      _secureStorage.delete(key: _tokenKey),
      _secureStorage.delete(key: _refreshTokenKey),
      _secureStorage.delete(key: _userIdKey),
      _secureStorage.delete(key: _userEmailKey),
      _secureStorage.delete(key: _userTypeKey),
    ]);
  }

  // Obtener toda la información del usuario
  static Future<Map<String, String?>> getUserInfo() async {
    return {
      'userId': await getUserId(),
      'email': await getUserEmail(),
      'userType': await getUserType(),
    };
  }
}

class PreferencesService {
  static SharedPreferences? _prefs;

  static Future<void> initialize() async {
    _prefs = await SharedPreferences.getInstance();
  }

  static SharedPreferences get prefs {
    if (_prefs == null) {
      throw Exception('PreferencesService no ha sido inicializado');
    }
    return _prefs!;
  }

  // Configuraciones de la app
  static Future<void> setThemeMode(String mode) async {
    await prefs.setString('theme_mode', mode);
  }

  static String getThemeMode() {
    return prefs.getString('theme_mode') ?? 'system';
  }

  static Future<void> setLanguage(String language) async {
    await prefs.setString('language', language);
  }

  static String getLanguage() {
    return prefs.getString('language') ?? 'es';
  }

  static Future<void> setFirstLaunch(bool isFirst) async {
    await prefs.setBool('first_launch', isFirst);
  }

  static bool isFirstLaunch() {
    return prefs.getBool('first_launch') ?? true;
  }

  // Configuraciones de notificaciones
  static Future<void> setNotificationsEnabled(bool enabled) async {
    await prefs.setBool('notifications_enabled', enabled);
  }

  static bool areNotificationsEnabled() {
    return prefs.getBool('notifications_enabled') ?? true;
  }

  // Cache de datos
  static Future<void> setCachedData(String key, String data) async {
    await prefs.setString('cache_$key', data);
  }

  static String? getCachedData(String key) {
    return prefs.getString('cache_$key');
  }

  static Future<void> clearCache() async {
    final keys = prefs.getKeys().where((key) => key.startsWith('cache_'));
    for (final key in keys) {
      await prefs.remove(key);
    }
  }
}
