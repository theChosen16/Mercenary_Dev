import 'package:equatable/equatable.dart';

/// Modelo para representar un pago
class Payment extends Equatable {
  final String id;
  final String contractId;
  final String payerId;
  final String receiverId;
  final double amount;
  final String currency;
  final PaymentStatus status;
  final PaymentMethod method;
  final DateTime createdAt;
  final DateTime? processedAt;
  final String? transactionId;
  final String? description;
  final Map<String, dynamic>? metadata;

  const Payment({
    required this.id,
    required this.contractId,
    required this.payerId,
    required this.receiverId,
    required this.amount,
    required this.currency,
    required this.status,
    required this.method,
    required this.createdAt,
    this.processedAt,
    this.transactionId,
    this.description,
    this.metadata,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'] as String,
      contractId: json['contract_id'] as String,
      payerId: json['payer_id'] as String,
      receiverId: json['receiver_id'] as String,
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String,
      status: PaymentStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => PaymentStatus.pending,
      ),
      method: PaymentMethod.values.firstWhere(
        (e) => e.name == json['method'],
        orElse: () => PaymentMethod.stripe,
      ),
      createdAt: DateTime.parse(json['created_at'] as String),
      processedAt: json['processed_at'] != null
          ? DateTime.parse(json['processed_at'] as String)
          : null,
      transactionId: json['transaction_id'] as String?,
      description: json['description'] as String?,
      metadata: json['metadata'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'contract_id': contractId,
      'payer_id': payerId,
      'receiver_id': receiverId,
      'amount': amount,
      'currency': currency,
      'status': status.name,
      'method': method.name,
      'created_at': createdAt.toIso8601String(),
      if (processedAt != null) 'processed_at': processedAt!.toIso8601String(),
      if (transactionId != null) 'transaction_id': transactionId,
      if (description != null) 'description': description,
      if (metadata != null) 'metadata': metadata,
    };
  }

  Payment copyWith({
    String? id,
    String? contractId,
    String? payerId,
    String? receiverId,
    double? amount,
    String? currency,
    PaymentStatus? status,
    PaymentMethod? method,
    DateTime? createdAt,
    DateTime? processedAt,
    String? transactionId,
    String? description,
    Map<String, dynamic>? metadata,
  }) {
    return Payment(
      id: id ?? this.id,
      contractId: contractId ?? this.contractId,
      payerId: payerId ?? this.payerId,
      receiverId: receiverId ?? this.receiverId,
      amount: amount ?? this.amount,
      currency: currency ?? this.currency,
      status: status ?? this.status,
      method: method ?? this.method,
      createdAt: createdAt ?? this.createdAt,
      processedAt: processedAt ?? this.processedAt,
      transactionId: transactionId ?? this.transactionId,
      description: description ?? this.description,
      metadata: metadata ?? this.metadata,
    );
  }

  @override
  List<Object?> get props => [
        id,
        contractId,
        payerId,
        receiverId,
        amount,
        currency,
        status,
        method,
        createdAt,
        processedAt,
        transactionId,
        description,
        metadata,
      ];
}

/// Modelo para representar un método de pago guardado
class PaymentMethodInfo extends Equatable {
  final String id;
  final String userId;
  final PaymentMethod type;
  final String displayName;
  final String? last4;
  final String? brand;
  final DateTime expiryDate;
  final bool isDefault;
  final DateTime createdAt;

  const PaymentMethodInfo({
    required this.id,
    required this.userId,
    required this.type,
    required this.displayName,
    this.last4,
    this.brand,
    required this.expiryDate,
    this.isDefault = false,
    required this.createdAt,
  });

  factory PaymentMethodInfo.fromJson(Map<String, dynamic> json) {
    return PaymentMethodInfo(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      type: PaymentMethod.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => PaymentMethod.stripe,
      ),
      displayName: json['display_name'] as String,
      last4: json['last4'] as String?,
      brand: json['brand'] as String?,
      expiryDate: DateTime.parse(json['expiry_date'] as String),
      isDefault: json['is_default'] as bool? ?? false,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'type': type.name,
      'display_name': displayName,
      if (last4 != null) 'last4': last4,
      if (brand != null) 'brand': brand,
      'expiry_date': expiryDate.toIso8601String(),
      'is_default': isDefault,
      'created_at': createdAt.toIso8601String(),
    };
  }

  PaymentMethodInfo copyWith({
    String? id,
    String? userId,
    PaymentMethod? type,
    String? displayName,
    String? last4,
    String? brand,
    DateTime? expiryDate,
    bool? isDefault,
    DateTime? createdAt,
  }) {
    return PaymentMethodInfo(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      type: type ?? this.type,
      displayName: displayName ?? this.displayName,
      last4: last4 ?? this.last4,
      brand: brand ?? this.brand,
      expiryDate: expiryDate ?? this.expiryDate,
      isDefault: isDefault ?? this.isDefault,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        userId,
        type,
        displayName,
        last4,
        brand,
        expiryDate,
        isDefault,
        createdAt,
      ];
}

/// Modelo para representar una intención de pago
class PaymentIntent extends Equatable {
  final String id;
  final String clientSecret;
  final double amount;
  final String currency;
  final PaymentIntentStatus status;
  final String? description;
  final Map<String, dynamic>? metadata;

  const PaymentIntent({
    required this.id,
    required this.clientSecret,
    required this.amount,
    required this.currency,
    required this.status,
    this.description,
    this.metadata,
  });

  factory PaymentIntent.fromJson(Map<String, dynamic> json) {
    return PaymentIntent(
      id: json['id'] as String,
      clientSecret: json['client_secret'] as String,
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String,
      status: PaymentIntentStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => PaymentIntentStatus.requiresPaymentMethod,
      ),
      description: json['description'] as String?,
      metadata: json['metadata'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'client_secret': clientSecret,
      'amount': amount,
      'currency': currency,
      'status': status.name,
      if (description != null) 'description': description,
      if (metadata != null) 'metadata': metadata,
    };
  }

  @override
  List<Object?> get props => [
        id,
        clientSecret,
        amount,
        currency,
        status,
        description,
        metadata,
      ];
}

/// Estados de pago
enum PaymentStatus {
  pending,
  processing,
  completed,
  failed,
  cancelled,
  refunded,
}

/// Métodos de pago soportados
enum PaymentMethod {
  stripe,
  paypal,
  mercadoPago,
  applePay,
  googlePay,
  bankTransfer,
}

/// Estados de intención de pago
enum PaymentIntentStatus {
  requiresPaymentMethod,
  requiresConfirmation,
  requiresAction,
  processing,
  succeeded,
  requiresCapture,
  canceled,
}

/// Tipos de transacción
enum TransactionType {
  payment,
  refund,
  transfer,
  fee,
}

/// Modelo para historial de transacciones
class Transaction extends Equatable {
  final String id;
  final String userId;
  final TransactionType type;
  final double amount;
  final String currency;
  final String description;
  final DateTime createdAt;
  final String? relatedPaymentId;
  final Map<String, dynamic>? metadata;

  const Transaction({
    required this.id,
    required this.userId,
    required this.type,
    required this.amount,
    required this.currency,
    required this.description,
    required this.createdAt,
    this.relatedPaymentId,
    this.metadata,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      type: TransactionType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => TransactionType.payment,
      ),
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String,
      description: json['description'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      relatedPaymentId: json['related_payment_id'] as String?,
      metadata: json['metadata'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'type': type.name,
      'amount': amount,
      'currency': currency,
      'description': description,
      'created_at': createdAt.toIso8601String(),
      if (relatedPaymentId != null) 'related_payment_id': relatedPaymentId,
      if (metadata != null) 'metadata': metadata,
    };
  }

  @override
  List<Object?> get props => [
        id,
        userId,
        type,
        amount,
        currency,
        description,
        createdAt,
        relatedPaymentId,
        metadata,
      ];
}
