import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

import '../../data/services/payment_service.dart';
import '../../../../shared/models/payment_model.dart';
import '../../../../shared/models/transaction_model.dart' as txn;

// Events
abstract class PaymentEvent extends Equatable {
  const PaymentEvent();

  @override
  List<Object?> get props => [];
}

class LoadPaymentMethods extends PaymentEvent {}

class AddPaymentMethod extends PaymentEvent {
  final String cardNumber;
  final String expiryDate;
  final String cvv;
  final String cardholderName;
  final PaymentMethod type;
  final bool setAsDefault;

  const AddPaymentMethod({
    required this.cardNumber,
    required this.expiryDate,
    required this.cvv,
    required this.cardholderName,
    required this.type,
    this.setAsDefault = false,
  });

  @override
  List<Object> get props => [cardNumber, expiryDate, cvv, cardholderName, type, setAsDefault];
}

class RemovePaymentMethod extends PaymentEvent {
  final String paymentMethodId;

  const RemovePaymentMethod(this.paymentMethodId);

  @override
  List<Object> get props => [paymentMethodId];
}

class SetDefaultPaymentMethod extends PaymentEvent {
  final String paymentMethodId;

  const SetDefaultPaymentMethod(this.paymentMethodId);

  @override
  List<Object> get props => [paymentMethodId];
}

class CreatePaymentIntent extends PaymentEvent {
  final double amount;
  final String currency;
  final String contractId;
  final PaymentMethod method;
  final String? description;
  final Map<String, dynamic>? metadata;

  const CreatePaymentIntent({
    required this.amount,
    required this.currency,
    required this.contractId,
    required this.method,
    this.description,
    this.metadata,
  });

  @override
  List<Object?> get props => [amount, currency, contractId, method, description, metadata];
}

class ConfirmPayment extends PaymentEvent {
  final String paymentIntentId;
  final String? paymentMethodId;

  const ConfirmPayment({
    required this.paymentIntentId,
    this.paymentMethodId,
  });

  @override
  List<Object?> get props => [paymentIntentId, paymentMethodId];
}

class CreatePayPalPayment extends PaymentEvent {
  final double amount;
  final String currency;
  final String contractId;
  final String? description;

  const CreatePayPalPayment({
    required this.amount,
    required this.currency,
    required this.contractId,
    this.description,
  });

  @override
  List<Object?> get props => [amount, currency, contractId, description];
}

class ExecutePayPalPayment extends PaymentEvent {
  final String paymentId;
  final String payerId;

  const ExecutePayPalPayment({
    required this.paymentId,
    required this.payerId,
  });

  @override
  List<Object> get props => [paymentId, payerId];
}

class CreateMercadoPagoPreference extends PaymentEvent {
  final double amount;
  final String currency;
  final String contractId;
  final String? description;

  const CreateMercadoPagoPreference({
    required this.amount,
    required this.currency,
    required this.contractId,
    this.description,
  });

  @override
  List<Object?> get props => [amount, currency, contractId, description];
}

class ProcessMercadoPagoPayment extends PaymentEvent {
  final String preferenceId;
  final Map<String, dynamic> paymentData;

  const ProcessMercadoPagoPayment({
    required this.preferenceId,
    required this.paymentData,
  });

  @override
  List<Object> get props => [preferenceId, paymentData];
}

class LoadPaymentHistory extends PaymentEvent {
  final int page;
  final int limit;
  final PaymentStatus? status;
  final PaymentMethod? method;

  const LoadPaymentHistory({
    this.page = 1,
    this.limit = 20,
    this.status,
    this.method,
  });

  @override
  List<Object?> get props => [page, limit, status, method];
}

class LoadPaymentDetails extends PaymentEvent {
  final String paymentId;

  const LoadPaymentDetails(this.paymentId);

  @override
  List<Object> get props => [paymentId];
}

class RequestPaymentRefund extends PaymentEvent {
  final String paymentId;
  final double? amount;
  final String? reason;
  final Map<String, dynamic>? metadata;

  const RequestPaymentRefund({
    required this.paymentId,
    this.amount,
    this.reason,
    this.metadata,
  });

  @override
  List<Object?> get props => [paymentId, amount, reason, metadata];
}

class LoadTransactionHistory extends PaymentEvent {
  final int page;
  final int limit;
  final txn.TransactionType? type;
  final txn.TransactionStatus? status;

  const LoadTransactionHistory({
    this.page = 1,
    this.limit = 20,
    this.type,
    this.status,
  });

  @override
  List<Object?> get props => [page, limit, type, status];
}

class LoadUserBalance extends PaymentEvent {}

class RequestWithdrawal extends PaymentEvent {
  final double amount;
  final String bankAccount;
  final String? description;
  final Map<String, dynamic>? metadata;

  const RequestWithdrawal({
    required this.amount,
    required this.bankAccount,
    this.description,
    this.metadata,
  });

  @override
  List<Object?> get props => [amount, bankAccount, description, metadata];
}

class CalculatePaymentFees extends PaymentEvent {
  final double amount;
  final PaymentMethod method;

  const CalculatePaymentFees({
    required this.amount,
    required this.method,
  });

  @override
  List<Object> get props => [amount, method];
}

// States
abstract class PaymentState extends Equatable {
  const PaymentState();

  @override
  List<Object?> get props => [];
}

class PaymentInitial extends PaymentState {}

class PaymentLoading extends PaymentState {}

class PaymentMethodsLoaded extends PaymentState {
  final List<PaymentMethodInfo> paymentMethods;

  const PaymentMethodsLoaded(this.paymentMethods);

  @override
  List<Object> get props => [paymentMethods];
}

class PaymentIntentCreated extends PaymentState {
  final PaymentIntent paymentIntent;

  const PaymentIntentCreated(this.paymentIntent);

  @override
  List<Object> get props => [paymentIntent];
}

class PayPalPaymentCreated extends PaymentState {
  final Map<String, dynamic> paypalData;

  const PayPalPaymentCreated(this.paypalData);

  @override
  List<Object> get props => [paypalData];
}

class MercadoPagoPreferenceCreated extends PaymentState {
  final Map<String, dynamic> preferenceData;

  const MercadoPagoPreferenceCreated(this.preferenceData);

  @override
  List<Object> get props => [preferenceData];
}

class PaymentCompleted extends PaymentState {
  final Payment payment;

  const PaymentCompleted(this.payment);

  @override
  List<Object> get props => [payment];
}

class PaymentHistoryLoaded extends PaymentState {
  final List<Payment> payments;
  final int currentPage;
  final bool hasMore;

  const PaymentHistoryLoaded({
    required this.payments,
    required this.currentPage,
    required this.hasMore,
  });

  PaymentHistoryLoaded copyWith({
    List<Payment>? payments,
    int? currentPage,
    bool? hasMore,
  }) {
    return PaymentHistoryLoaded(
      payments: payments ?? this.payments,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
    );
  }

  @override
  List<Object> get props => [payments, currentPage, hasMore];
}

class PaymentDetailsLoaded extends PaymentState {
  final Payment payment;

  const PaymentDetailsLoaded(this.payment);

  @override
  List<Object> get props => [payment];
}

class TransactionHistoryLoaded extends PaymentState {
  final List<txn.Transaction> transactions;
  final int currentPage;
  final bool hasMore;

  const TransactionHistoryLoaded({
    required this.transactions,
    required this.currentPage,
    required this.hasMore,
  });

  TransactionHistoryLoaded copyWith({
    List<txn.Transaction>? transactions,
    int? currentPage,
    bool? hasMore,
  }) {
    return TransactionHistoryLoaded(
      transactions: transactions ?? this.transactions,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
    );
  }

  @override
  List<Object> get props => [transactions, currentPage, hasMore];
}

class UserBalanceLoaded extends PaymentState {
  final double balance;

  const UserBalanceLoaded(this.balance);

  @override
  List<Object> get props => [balance];
}

class PaymentFeesCalculated extends PaymentState {
  final double fees;

  const PaymentFeesCalculated(this.fees);

  @override
  List<Object> get props => [fees];
}

class PaymentSuccess extends PaymentState {
  final String message;

  const PaymentSuccess(this.message);

  @override
  List<Object> get props => [message];
}

class PaymentError extends PaymentState {
  final String error;

  const PaymentError(this.error);

  @override
  List<Object> get props => [error];
}

// BLoC
class PaymentBloc extends Bloc<PaymentEvent, PaymentState> {
  final PaymentService _paymentService;

  PaymentBloc(this._paymentService) : super(PaymentInitial()) {
    on<LoadPaymentMethods>(_onLoadPaymentMethods);
    on<AddPaymentMethod>(_onAddPaymentMethod);
    on<RemovePaymentMethod>(_onRemovePaymentMethod);
    on<SetDefaultPaymentMethod>(_onSetDefaultPaymentMethod);
    on<CreatePaymentIntent>(_onCreatePaymentIntent);
    on<ConfirmPayment>(_onConfirmPayment);
    on<CreatePayPalPayment>(_onCreatePayPalPayment);
    on<ExecutePayPalPayment>(_onExecutePayPalPayment);
    on<CreateMercadoPagoPreference>(_onCreateMercadoPagoPreference);
    on<ProcessMercadoPagoPayment>(_onProcessMercadoPagoPayment);
    on<LoadPaymentHistory>(_onLoadPaymentHistory);
    on<LoadPaymentDetails>(_onLoadPaymentDetails);
    on<RequestPaymentRefund>(_onRequestPaymentRefund);
    on<LoadTransactionHistory>(_onLoadTransactionHistory);
    on<LoadUserBalance>(_onLoadUserBalance);
    on<RequestWithdrawal>(_onRequestWithdrawal);
    on<CalculatePaymentFees>(_onCalculatePaymentFees);
  }

  Future<void> _onLoadPaymentMethods(
    LoadPaymentMethods event,
    Emitter<PaymentState> emit,
  ) async {
    try {
      emit(PaymentLoading());
      final methods = await _paymentService.getPaymentMethods();
      emit(PaymentMethodsLoaded(methods));
    } catch (e) {
      emit(PaymentError(e.toString()));
    }
  }

  Future<void> _onAddPaymentMethod(
    AddPaymentMethod event,
    Emitter<PaymentState> emit,
  ) async {
    try {
      emit(PaymentLoading());
      await _paymentService.addPaymentMethod(
        cardNumber: event.cardNumber,
        expiryDate: event.expiryDate,
        cvv: event.cvv,
        cardholderName: event.cardholderName,
        type: event.type,
        setAsDefault: event.setAsDefault,
      );
      final methods = await _paymentService.getPaymentMethods();
      emit(PaymentMethodsLoaded(methods));
    } catch (e) {
      emit(PaymentError(e.toString()));
    }
  }

  Future<void> _onRemovePaymentMethod(
    RemovePaymentMethod event,
    Emitter<PaymentState> emit,
  ) async {
    try {
      emit(PaymentLoading());
      await _paymentService.removePaymentMethod(event.paymentMethodId);
      final methods = await _paymentService.getPaymentMethods();
      emit(PaymentMethodsLoaded(methods));
    } catch (e) {
      emit(PaymentError(e.toString()));
    }
  }

  Future<void> _onSetDefaultPaymentMethod(
    SetDefaultPaymentMethod event,
    Emitter<PaymentState> emit,
  ) async {
    try {
      emit(PaymentLoading());
      await _paymentService.setDefaultPaymentMethod(event.paymentMethodId);
      final methods = await _paymentService.getPaymentMethods();
      emit(PaymentMethodsLoaded(methods));
    } catch (e) {
      emit(PaymentError(e.toString()));
    }
  }

  Future<void> _onCreatePaymentIntent(
    CreatePaymentIntent event,
    Emitter<PaymentState> emit,
  ) async {
    try {
      emit(PaymentLoading());
      if (event.method == PaymentMethod.stripe) {
        final paymentIntent = await _paymentService.createPaymentIntent(
          amount: event.amount,
          currency: event.currency,
          contractId: event.contractId,
          description: event.description,
          metadata: event.metadata,
        );
        emit(PaymentIntentCreated(paymentIntent));
      } else {
        emit(PaymentError('Método de pago no soportado para intents'));
      }
    } catch (e) {
      emit(PaymentError(e.toString()));
    }
  }

  Future<void> _onConfirmPayment(
    ConfirmPayment event,
    Emitter<PaymentState> emit,
  ) async {
    try {
      emit(PaymentLoading());
      final payment = await _paymentService.confirmPayment(
        event.paymentIntentId,
        event.paymentMethodId,
      );
      emit(PaymentCompleted(payment));
    } catch (e) {
      emit(PaymentError(e.toString()));
    }
  }

  Future<void> _onCreatePayPalPayment(
    CreatePayPalPayment event,
    Emitter<PaymentState> emit,
  ) async {
    try {
      emit(PaymentLoading());
      final paypalData = await _paymentService.createPayPalPayment(
        amount: event.amount,
        currency: event.currency,
        contractId: event.contractId,
        description: event.description,
      );
      emit(PayPalPaymentCreated(paypalData));
    } catch (e) {
      emit(PaymentError(e.toString()));
    }
  }

  Future<void> _onExecutePayPalPayment(
    ExecutePayPalPayment event,
    Emitter<PaymentState> emit,
  ) async {
    try {
      emit(PaymentLoading());
      final payment = await _paymentService.executePayPalPayment(
        event.paymentId,
        event.payerId,
      );
      emit(PaymentCompleted(payment));
    } catch (e) {
      emit(PaymentError(e.toString()));
    }
  }

  Future<void> _onCreateMercadoPagoPreference(
    CreateMercadoPagoPreference event,
    Emitter<PaymentState> emit,
  ) async {
    try {
      emit(PaymentLoading());
      final preferenceData = await _paymentService.createMercadoPagoPreference(
        amount: event.amount,
        currency: event.currency,
        contractId: event.contractId,
        description: event.description,
      );
      emit(MercadoPagoPreferenceCreated(preferenceData));
    } catch (e) {
      emit(PaymentError(e.toString()));
    }
  }

  Future<void> _onProcessMercadoPagoPayment(
    ProcessMercadoPagoPayment event,
    Emitter<PaymentState> emit,
  ) async {
    try {
      emit(PaymentLoading());
      final payment = await _paymentService.processMercadoPagoPayment(
        event.preferenceId,
        event.paymentData,
      );
      emit(PaymentCompleted(payment));
    } catch (e) {
      emit(PaymentError(e.toString()));
    }
  }

  Future<void> _onLoadPaymentHistory(
    LoadPaymentHistory event,
    Emitter<PaymentState> emit,
  ) async {
    try {
      emit(PaymentLoading());
      final result = await _paymentService.getPaymentHistory(
        page: event.page,
        limit: event.limit,
        status: event.status,
        method: event.method,
      );
      emit(PaymentHistoryLoaded(
        payments: result['payments'],
        currentPage: result['currentPage'],
        hasMore: result['hasMore'],
      ));
    } catch (e) {
      emit(PaymentError(e.toString()));
    }
  }

  Future<void> _onLoadPaymentDetails(
    LoadPaymentDetails event,
    Emitter<PaymentState> emit,
  ) async {
    try {
      emit(PaymentLoading());
      final payment = await _paymentService.getPaymentDetails(event.paymentId);
      emit(PaymentDetailsLoaded(payment));
    } catch (e) {
      emit(PaymentError(e.toString()));
    }
  }

  Future<void> _onRequestPaymentRefund(
    RequestPaymentRefund event,
    Emitter<PaymentState> emit,
  ) async {
    try {
      emit(PaymentLoading());
      await _paymentService.requestRefund(
        paymentId: event.paymentId,
        amount: event.amount,
        reason: event.reason,
        metadata: event.metadata,
      );
      emit(PaymentSuccess('Reembolso solicitado exitosamente'));
    } catch (e) {
      emit(PaymentError(e.toString()));
    }
  }

  Future<void> _onLoadTransactionHistory(
    LoadTransactionHistory event,
    Emitter<PaymentState> emit,
  ) async {
    try {
      emit(PaymentLoading());
      final result = await _paymentService.getTransactionHistory(
        page: event.page,
        limit: event.limit,
        type: event.type,
        status: event.status,
      );
      emit(TransactionHistoryLoaded(
        transactions: result['transactions'],
        currentPage: result['currentPage'],
        hasMore: result['hasMore'],
      ));
    } catch (e) {
      emit(PaymentError(e.toString()));
    }
  }

  Future<void> _onLoadUserBalance(
    LoadUserBalance event,
    Emitter<PaymentState> emit,
  ) async {
    try {
      emit(PaymentLoading());
      final balance = await _paymentService.getUserBalance();
      emit(UserBalanceLoaded(balance));
    } catch (e) {
      emit(PaymentError(e.toString()));
    }
  }

  Future<void> _onRequestWithdrawal(
    RequestWithdrawal event,
    Emitter<PaymentState> emit,
  ) async {
    try {
      emit(PaymentLoading());
      await _paymentService.requestWithdrawal(
        amount: event.amount,
        currency: 'CLP', // Default currency
        withdrawalMethod: event.bankAccount, // Using bankAccount as withdrawalMethod
        description: event.description,
        metadata: event.metadata,
      );
      emit(PaymentSuccess('Retiro solicitado exitosamente'));
    } catch (e) {
      emit(PaymentError(e.toString()));
    }
  }

  Future<void> _onCalculatePaymentFees(
    CalculatePaymentFees event,
    Emitter<PaymentState> emit,
  ) async {
    try {
      emit(PaymentLoading());
      final fees = await _paymentService.calculateFees(
        event.amount,
        event.method,
      );
      emit(PaymentFeesCalculated(fees));
    } catch (e) {
      emit(PaymentError(e.toString()));
    }
  }
}
