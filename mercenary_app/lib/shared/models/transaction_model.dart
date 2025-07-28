import 'package:equatable/equatable.dart';

/// Enum para los tipos de transacción
enum TransactionType {
  payment,
  refund,
  withdrawal,
  deposit,
  fee,
  bonus,
}

/// Enum para los estados de transacción
enum TransactionStatus {
  pending,
  processing,
  completed,
  failed,
  cancelled,
  refunded,
}

/// Modelo de transacción
class Transaction extends Equatable {
  final String id;
  final String userId;
  final String? contractId;
  final double amount;
  final String currency;
  final TransactionType type;
  final TransactionStatus status;
  final String? description;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? paymentMethodId;
  final String? externalId;
  final String? failureReason;

  const Transaction({
    required this.id,
    required this.userId,
    this.contractId,
    required this.amount,
    required this.currency,
    required this.type,
    required this.status,
    this.description,
    this.metadata,
    required this.createdAt,
    required this.updatedAt,
    this.paymentMethodId,
    this.externalId,
    this.failureReason,
  });

  @override
  List<Object?> get props => [
        id,
        userId,
        contractId,
        amount,
        currency,
        type,
        status,
        description,
        metadata,
        createdAt,
        updatedAt,
        paymentMethodId,
        externalId,
        failureReason,
      ];

  /// Crea una copia de la transacción con los campos especificados actualizados
  Transaction copyWith({
    String? id,
    String? userId,
    String? contractId,
    double? amount,
    String? currency,
    TransactionType? type,
    TransactionStatus? status,
    String? description,
    Map<String, dynamic>? metadata,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? paymentMethodId,
    String? externalId,
    String? failureReason,
  }) {
    return Transaction(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      contractId: contractId ?? this.contractId,
      amount: amount ?? this.amount,
      currency: currency ?? this.currency,
      type: type ?? this.type,
      status: status ?? this.status,
      description: description ?? this.description,
      metadata: metadata ?? this.metadata,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      paymentMethodId: paymentMethodId ?? this.paymentMethodId,
      externalId: externalId ?? this.externalId,
      failureReason: failureReason ?? this.failureReason,
    );
  }

  /// Convierte la transacción a un mapa JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'contract_id': contractId,
      'amount': amount,
      'currency': currency,
      'type': type.name,
      'status': status.name,
      'description': description,
      'metadata': metadata,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'payment_method_id': paymentMethodId,
      'external_id': externalId,
      'failure_reason': failureReason,
    };
  }

  /// Crea una transacción desde un mapa JSON
  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      contractId: json['contract_id'] as String?,
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String,
      type: TransactionType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => TransactionType.payment,
      ),
      status: TransactionStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => TransactionStatus.pending,
      ),
      description: json['description'] as String?,
      metadata: json['metadata'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      paymentMethodId: json['payment_method_id'] as String?,
      externalId: json['external_id'] as String?,
      failureReason: json['failure_reason'] as String?,
    );
  }

  /// Verifica si la transacción está completada
  bool get isCompleted => status == TransactionStatus.completed;

  /// Verifica si la transacción está pendiente
  bool get isPending => status == TransactionStatus.pending;

  /// Verifica si la transacción falló
  bool get isFailed => status == TransactionStatus.failed;

  /// Verifica si la transacción fue cancelada
  bool get isCancelled => status == TransactionStatus.cancelled;

  /// Verifica si la transacción fue reembolsada
  bool get isRefunded => status == TransactionStatus.refunded;

  /// Obtiene el color asociado al tipo de transacción
  String get typeDisplayName {
    switch (type) {
      case TransactionType.payment:
        return 'Pago';
      case TransactionType.refund:
        return 'Reembolso';
      case TransactionType.withdrawal:
        return 'Retiro';
      case TransactionType.deposit:
        return 'Depósito';
      case TransactionType.fee:
        return 'Comisión';
      case TransactionType.bonus:
        return 'Bonus';
    }
  }

  /// Obtiene el nombre de estado para mostrar
  String get statusDisplayName {
    switch (status) {
      case TransactionStatus.pending:
        return 'Pendiente';
      case TransactionStatus.processing:
        return 'Procesando';
      case TransactionStatus.completed:
        return 'Completado';
      case TransactionStatus.failed:
        return 'Fallido';
      case TransactionStatus.cancelled:
        return 'Cancelado';
      case TransactionStatus.refunded:
        return 'Reembolsado';
    }
  }
}
