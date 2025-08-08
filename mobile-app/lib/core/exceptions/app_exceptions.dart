/// Custom exceptions for the Mercenary app
class AppException implements Exception {
  final String message;
  final String? code;
  final dynamic details;

  const AppException(this.message, {this.code, this.details});

  @override
  String toString() => 'AppException: $message${code != null ? ' (Code: $code)' : ''}';
}

/// Network related exceptions
class NetworkException extends AppException {
  const NetworkException(super.message, {super.code, super.details});
}

/// Authentication related exceptions
class AuthException extends AppException {
  const AuthException(super.message, {super.code, super.details});
}

/// Payment related exceptions
class PaymentException extends AppException {
  const PaymentException(super.message, {super.code, super.details});
}

/// Server error exceptions
class ServerException extends AppException {
  const ServerException(super.message, {super.code, super.details});
}

/// Validation exceptions
class ValidationException extends AppException {
  const ValidationException(super.message, {super.code, super.details});
}

/// Cache exceptions
class CacheException extends AppException {
  const CacheException(super.message, {super.code, super.details});
}

/// Timeout exceptions
class TimeoutException extends AppException {
  const TimeoutException(super.message, {super.code, super.details});
}
