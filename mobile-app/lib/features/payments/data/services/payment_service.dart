import 'dart:async';

import '../../../../core/network/http_service.dart';
import '../../../../shared/models/payment_model.dart';
import '../../../../core/exceptions/app_exceptions.dart';

class PaymentService {
  final HttpService _httpService;

  PaymentService({required HttpService httpService}) : _httpService = httpService;

  /// Obtener métodos de pago del usuario
  Future<List<PaymentMethodInfo>> getPaymentMethods() async {
    try {
      final response = await _httpService.get('/api/v1/payments/methods');
      final List<dynamic> data = response.data as List<dynamic>;
      return data.map((json) => PaymentMethodInfo.fromJson(json as Map<String, dynamic>)).toList();
    } catch (e) {
      throw PaymentException('Error al obtener métodos de pago: $e');
    }
  }

  /// Agregar método de pago
  Future<PaymentMethodInfo> addPaymentMethod({
    required String cardNumber,
    required String expiryDate,
    required String cvv,
    required String cardholderName,
    required PaymentMethod type,
    bool setAsDefault = false,
  }) async {
    try {
      final response = await _httpService.post(
        '/api/v1/payments/methods',
        data: {
          'card_number': cardNumber,
          'expiry_date': expiryDate,
          'cvv': cvv,
          'cardholder_name': cardholderName,
          'type': type.name,
          'set_as_default': setAsDefault,
        },
      );

      return PaymentMethodInfo.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      throw PaymentException('Error al agregar método de pago: $e');
    }
  }

  /// Eliminar método de pago
  Future<void> removePaymentMethod(String paymentMethodId) async {
    try {
      await _httpService.delete('/api/v1/payments/methods/$paymentMethodId');
    } catch (e) {
      throw PaymentException('Error al eliminar método de pago: $e');
    }
  }

  /// Establecer método de pago por defecto
  Future<void> setDefaultPaymentMethod(String paymentMethodId) async {
    try {
      await _httpService.patch(
        '/api/v1/payments/methods/$paymentMethodId/default',
        data: {},
      );
    } catch (e) {
      throw PaymentException('Error al establecer método de pago por defecto: $e');
    }
  }

  /// Crear intención de pago con Stripe
  Future<PaymentIntent> createPaymentIntent({
    required double amount,
    required String currency,
    required String contractId,
    String? description,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      final response = await _httpService.post(
        '/api/v1/payments/stripe/create-intent',
        data: {
          'amount': (amount * 100).round(), // Stripe usa centavos
          'currency': currency.toLowerCase(),
          'contract_id': contractId,
          if (description != null) 'description': description,
          if (metadata != null) 'metadata': metadata,
        },
      );

      return PaymentIntent.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      throw PaymentException('Error al crear intención de pago: $e');
    }
  }

  /// Confirmar pago con Stripe
  Future<Payment> confirmPayment(
    String paymentIntentId,
    String? paymentMethodId,
  ) async {
    try {
      final response = await _httpService.post(
        '/api/v1/payments/stripe/confirm',
        data: {
          'payment_intent_id': paymentIntentId,
          'payment_method_id': paymentMethodId,
        },
      );

      return Payment.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      throw PaymentException('Error al confirmar pago: $e');
    }
  }

  /// Crear pago con PayPal
  Future<Map<String, dynamic>> createPayPalPayment({
    required double amount,
    required String currency,
    required String contractId,
    String? description,
  }) async {
    try {
      final response = await _httpService.post(
        '/api/v1/payments/paypal/create',
        data: {
          'amount': amount,
          'currency': currency.toUpperCase(),
          'contract_id': contractId,
          if (description != null) 'description': description,
        },
      );

      return response.data as Map<String, dynamic>;
    } catch (e) {
      throw PaymentException('Error al crear pago PayPal: $e');
    }
  }

  /// Ejecutar pago de PayPal
  Future<Payment> executePayPalPayment(String paymentId, String payerId) async {
    try {
      final response = await _httpService.post(
        '/api/v1/payments/paypal/execute',
        data: {
          'payment_id': paymentId,
          'payer_id': payerId,
        },
      );

      return Payment.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      throw PaymentException('Error al ejecutar pago de PayPal: $e');
    }
  }

  /// Crear preferencia de MercadoPago
  Future<Map<String, dynamic>> createMercadoPagoPreference({
    required double amount,
    required String currency,
    required String contractId,
    String? description,
  }) async {
    try {
      final response = await _httpService.post(
        '/api/v1/payments/mercadopago/create-preference',
        data: {
          'amount': amount,
          'currency': currency.toUpperCase(),
          'contract_id': contractId,
          if (description != null) 'description': description,
        },
      );

      return response.data as Map<String, dynamic>;
    } catch (e) {
      throw PaymentException('Error al crear preferencia MercadoPago: $e');
    }
  }

  /// Procesar pago de MercadoPago
  Future<Payment> processMercadoPagoPayment(
    String preferenceId,
    Map<String, dynamic> paymentData,
  ) async {
    try {
      final response = await _httpService.post(
        '/api/v1/payments/mercadopago/process',
        data: {
          'preference_id': preferenceId,
          'payment_data': paymentData,
        },
      );

      return Payment.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      throw PaymentException('Error al procesar pago MercadoPago: $e');
    }
  }

  /// Obtener estado de pago de MercadoPago
  Future<Map<String, dynamic>> getMercadoPagoPaymentStatus(String paymentId) async {
    try {
      final response = await _httpService.get('/api/v1/payments/mercadopago/status/$paymentId');
      return response.data as Map<String, dynamic>;
    } catch (e) {
      throw PaymentException('Error al obtener estado de pago MercadoPago: $e');
    }
  }

  /// Obtener historial de pagos
  Future<Map<String, dynamic>> getPaymentHistory({
    int page = 1,
    int limit = 20,
    PaymentStatus? status,
    PaymentMethod? method,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
        if (status != null) 'status': status.name,
        if (method != null) 'method': method.name,
      };

      final response = await _httpService.get(
        '/api/v1/payments/history',
        queryParameters: queryParams,
      );

      final data = response.data as Map<String, dynamic>;
      return {
        'payments': (data['payments'] as List<dynamic>)
            .map((json) => Payment.fromJson(json as Map<String, dynamic>))
            .toList(),
        'currentPage': data['current_page'] as int,
        'hasMore': data['has_more'] as bool,
      };
    } catch (e) {
      throw PaymentException('Error al obtener historial de pagos: $e');
    }
  }

  /// Obtener detalles de un pago
  Future<Payment> getPaymentDetails(String paymentId) async {
    try {
      final response = await _httpService.get('/api/v1/payments/$paymentId');
      return Payment.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      throw PaymentException('Error al obtener detalles del pago: $e');
    }
  }

  /// Solicitar reembolso
  Future<void> requestRefund({
    required String paymentId,
    double? amount,
    String? reason,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      await _httpService.post(
        '/api/v1/payments/$paymentId/refund',
        data: {
          if (amount != null) 'amount': amount,
          if (reason != null) 'reason': reason,
          if (metadata != null) 'metadata': metadata,
        },
      );
    } catch (e) {
      throw PaymentException('Error al solicitar reembolso: $e');
    }
  }

  /// Obtener historial de transacciones
  Future<Map<String, dynamic>> getTransactionHistory({
    int page = 1,
    int limit = 20,
    dynamic type,
    dynamic status,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
        if (type != null) 'type': type.toString(),
        if (status != null) 'status': status.toString(),
      };

      final response = await _httpService.get(
        '/api/v1/transactions/history',
        queryParameters: queryParams,
      );

      final data = response.data as Map<String, dynamic>;
      return {
        'transactions': data['transactions'] ?? [],
        'currentPage': data['current_page'] as int,
        'hasMore': data['has_more'] as bool,
      };
    } catch (e) {
      throw PaymentException('Error al obtener historial de transacciones: $e');
    }
  }

  /// Obtener balance del usuario
  Future<double> getUserBalance() async {
    try {
      final response = await _httpService.get('/api/v1/payments/balance');
      return (response.data['balance'] as num).toDouble();
    } catch (e) {
      throw PaymentException('Error al obtener balance del usuario: $e');
    }
  }

  /// Solicitar retiro
  Future<void> requestWithdrawal({
    required double amount,
    required String currency,
    required String withdrawalMethod,
    String? description,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      await _httpService.post(
        '/api/v1/payments/withdraw',
        data: {
          'amount': amount,
          'currency': currency,
          'withdrawal_method': withdrawalMethod,
          if (description != null) 'description': description,
          if (metadata != null) 'metadata': metadata,
        },
      );
    } catch (e) {
      throw PaymentException('Error al solicitar retiro: $e');
    }
  }

  /// Calcular comisiones de pago
  Future<double> calculateFees(double amount, PaymentMethod method) async {
    try {
      final response = await _httpService.post(
        '/api/v1/payments/calculate-fees',
        data: {
          'amount': amount,
          'method': method.name,
        },
      );

      return (response.data['fees'] as num).toDouble();
    } catch (e) {
      throw PaymentException('Error al calcular comisiones: $e');
    }
  }
}

/// Excepción específica para errores de pago
class PaymentException extends AppException {
  PaymentException(super.message);
}
