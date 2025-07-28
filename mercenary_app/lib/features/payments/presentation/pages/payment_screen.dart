import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../shared/models/payment_model.dart';
import '../bloc/payment_bloc.dart';

class PaymentScreen extends StatefulWidget {
  final String contractId;
  final double amount;
  final String currency;
  final String? description;

  const PaymentScreen({
    super.key,
    required this.contractId,
    required this.amount,
    required this.currency,
    this.description,
  });

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  PaymentMethod selectedMethod = PaymentMethod.stripe;
  PaymentMethodInfo? selectedPaymentMethod;
  Map<String, dynamic>? calculatedFees;

  @override
  void initState() {
    super.initState();
    _loadPaymentMethods();
    _calculateFees();
  }

  void _loadPaymentMethods() {
    context.read<PaymentBloc>().add(LoadPaymentMethods());
  }

  void _calculateFees() {
    context.read<PaymentBloc>().add(
          CalculatePaymentFees(
            amount: widget.amount,
            method: selectedMethod,
          ),
        );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Realizar Pago'),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
      ),
      body: BlocConsumer<PaymentBloc, PaymentState>(
        listener: (context, state) {
          if (state is PaymentError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.error),
                backgroundColor: Colors.red,
              ),
            );
          } else if (state is PaymentCompleted) {
            _showPaymentSuccessDialog(state.payment);
          } else if (state is PaymentIntentCreated) {
            _processStripePayment(state.paymentIntent);
          } else if (state is PayPalPaymentCreated) {
            _processPayPalPayment(state.paypalData);
          } else if (state is PaymentFeesCalculated) {
            setState(() {
              calculatedFees = {
                'total_fees': state.fees,
                'platform_fee': state.fees * 0.7, // Estimated platform fee
                'processing_fee': state.fees * 0.3, // Estimated processing fee
              };
            });
          }
        },
        builder: (context, state) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildPaymentSummary(),
                const SizedBox(height: 24),
                _buildPaymentMethodSelector(),
                const SizedBox(height: 24),
                if (state is PaymentMethodsLoaded)
                  _buildSavedPaymentMethods(state.paymentMethods),
                const SizedBox(height: 24),
                if (calculatedFees != null) _buildFeesBreakdown(),
                const SizedBox(height: 32),
                _buildPaymentButton(state),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildPaymentSummary() {
    final total = calculatedFees != null
        ? (calculatedFees!['total_amount'] as num?)?.toDouble() ?? widget.amount
        : widget.amount;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Resumen del Pago',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Subtotal:'),
                Text(
                  '${widget.amount.toStringAsFixed(2)} ${widget.currency.toUpperCase()}',
                  style: const TextStyle(fontWeight: FontWeight.w500),
                ),
              ],
            ),
            if (calculatedFees != null) ...[
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Comisión de la plataforma:'),
                  Text(
                    '${(calculatedFees!['platform_fee'] as num?)?.toDouble().toStringAsFixed(2) ?? '0.00'} ${widget.currency.toUpperCase()}',
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                ],
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Comisión de procesamiento:'),
                  Text(
                    '${(calculatedFees!['processing_fee'] as num?)?.toDouble().toStringAsFixed(2) ?? '0.00'} ${widget.currency.toUpperCase()}',
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                ],
              ),
              const Divider(),
            ],
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Total:',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '${total.toStringAsFixed(2)} ${widget.currency.toUpperCase()}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryColor,
                  ),
                ),
              ],
            ),
            if (widget.description != null) ...[
              const SizedBox(height: 12),
              Text(
                'Descripción: ${widget.description}',
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 14,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentMethodSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Método de Pago',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [PaymentMethod.stripe, PaymentMethod.paypal, PaymentMethod.mercadoPago].map((method) {
            final isSelected = selectedMethod == method;
            return ChoiceChip(
              label: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    _getPaymentMethodIcon(method),
                    size: 16,
                    color: isSelected ? AppTheme.primaryColor : Colors.grey,
                  ),
                  const SizedBox(width: 8),
                  Text(_getPaymentMethodName(method)),
                ],
              ),
              selected: isSelected,
              onSelected: (selected) {
                if (selected) {
                  setState(() {
                    selectedMethod = method;
                    selectedPaymentMethod = null;
                  });
                  _calculateFees();
                }
              },
              selectedColor: AppTheme.primaryColor.withValues(alpha: 0.2),
              labelStyle: TextStyle(
                color: isSelected ? AppTheme.primaryColor : null,
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildSavedPaymentMethods(List<PaymentMethodInfo> paymentMethods) {
    final filteredMethods = paymentMethods
        .where((method) => method.type == selectedMethod)
        .toList();

    if (filteredMethods.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Icon(
                Icons.payment,
                size: 48,
                color: Colors.grey[400],
              ),
              const SizedBox(height: 8),
              Text(
                'No tienes métodos de pago guardados para ${_getPaymentMethodName(selectedMethod)}',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey[600]),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () {
                  // Navegar a la pantalla de métodos de pago
                  Navigator.of(context).pushNamed('/payment-methods');
                },
                child: const Text('Agregar método de pago'),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Métodos Guardados',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        ...filteredMethods.map((method) => _buildPaymentMethodTile(method)),
      ],
    );
  }

  Widget _buildPaymentMethodTile(PaymentMethodInfo method) {
    final isSelected = selectedPaymentMethod?.id == method.id;

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: _getPaymentMethodColor(method.type),
          child: Icon(
            _getPaymentMethodIcon(method.type),
            color: Colors.white,
            size: 20,
          ),
        ),
        title: Text(method.displayName),
        subtitle: method.last4 != null
            ? Text('**** **** **** ${method.last4}')
            : null,
        trailing: Radio<String>(
          value: method.id,
          groupValue: selectedPaymentMethod?.id,
          onChanged: (value) {
            setState(() {
              selectedPaymentMethod = method;
            });
          },
          activeColor: AppTheme.primaryColor,
        ),
        onTap: () {
          setState(() {
            selectedPaymentMethod = method;
          });
        },
        selected: isSelected,
        selectedTileColor: AppTheme.primaryColor.withValues(alpha: 0.1),
      ),
    );
  }

  Widget _buildFeesBreakdown() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Desglose de Comisiones',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            _buildFeeRow(
              'Comisión de la plataforma',
              '${((calculatedFees!['platform_fee_percentage'] as num?)?.toDouble() ?? 0).toStringAsFixed(1)}%',
              (calculatedFees!['platform_fee'] as num?)?.toDouble() ?? 0,
            ),
            _buildFeeRow(
              'Comisión de procesamiento',
              '${((calculatedFees!['processing_fee_percentage'] as num?)?.toDouble() ?? 0).toStringAsFixed(1)}%',
              (calculatedFees!['processing_fee'] as num?)?.toDouble() ?? 0,
            ),
            if (calculatedFees!['fixed_fee'] != null)
              _buildFeeRow(
                'Tarifa fija',
                'Fija',
                (calculatedFees!['fixed_fee'] as num?)?.toDouble() ?? 0,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeeRow(String label, String percentage, double amount) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              '$label ($percentage)',
              style: TextStyle(color: Colors.grey[600]),
            ),
          ),
          Text(
            '${amount.toStringAsFixed(2)} ${widget.currency.toUpperCase()}',
            style: const TextStyle(fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentButton(PaymentState state) {
    final isLoading = state is PaymentLoading;
    final canPay = selectedMethod == PaymentMethod.paypal || 
                   (selectedPaymentMethod != null);

    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: canPay && !isLoading ? _processPayment : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppTheme.primaryColor,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          disabledBackgroundColor: Colors.grey[300],
        ),
        child: isLoading
            ? const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
            : Text(
                'Pagar ${(calculatedFees != null ? (calculatedFees!['total_amount'] as num?)?.toDouble() ?? widget.amount : widget.amount).toStringAsFixed(2)} ${widget.currency.toUpperCase()}',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
      ),
    );
  }

  void _processPayment() {
    if (selectedMethod == PaymentMethod.stripe) {
      context.read<PaymentBloc>().add(
            CreatePaymentIntent(
              amount: widget.amount,
              currency: widget.currency,
              contractId: widget.contractId,
              method: selectedMethod,
              description: widget.description,
            ),
          );
    } else if (selectedMethod == PaymentMethod.paypal) {
      context.read<PaymentBloc>().add(
            CreatePayPalPayment(
              amount: widget.amount,
              currency: widget.currency,
              contractId: widget.contractId,
              description: widget.description,
            ),
          );
    } else if (selectedMethod == PaymentMethod.mercadoPago) {
      context.read<PaymentBloc>().add(
            CreateMercadoPagoPreference(
              amount: widget.amount,
              currency: widget.currency,
              contractId: widget.contractId,
              description: widget.description,
            ),
          );
    }
  }

  void _processStripePayment(PaymentIntent paymentIntent) {
    if (selectedPaymentMethod != null) {
      context.read<PaymentBloc>().add(
            ConfirmPayment(
              paymentIntentId: paymentIntent.id,
              paymentMethodId: selectedPaymentMethod!.id,
            ),
          );
    }
  }

  void _processPayPalPayment(Map<String, dynamic> paypalData) {
    // En una implementación real, aquí se abriría el navegador web
    // para completar el flujo de PayPal
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('PayPal'),
        content: const Text(
          'Serás redirigido a PayPal para completar el pago.',
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              // Simular ejecución exitosa del pago
              context.read<PaymentBloc>().add(
                    ExecutePayPalPayment(
                      paymentId: paypalData['id'] as String,
                      payerId: 'simulated_payer_id',
                    ),
                  );
            },
            child: const Text('Continuar'),
          ),
        ],
      ),
    );
  }

  void _showPaymentSuccessDialog(Payment payment) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(
              Icons.check_circle,
              color: Colors.green,
              size: 28,
            ),
            SizedBox(width: 8),
            Text('Pago Exitoso'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Tu pago ha sido procesado exitosamente.'),
            const SizedBox(height: 12),
            Text(
              'ID de transacción: ${payment.transactionId ?? payment.id}',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
                fontFamily: 'monospace',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop(); // Cerrar diálogo
              Navigator.of(context).pop(); // Volver a la pantalla anterior
            },
            child: const Text('Aceptar'),
          ),
        ],
      ),
    );
  }

  Color _getPaymentMethodColor(PaymentMethod type) {
    switch (type) {
      case PaymentMethod.stripe:
        return const Color(0xFF635BFF);
      case PaymentMethod.paypal:
        return const Color(0xFF0070BA);
      case PaymentMethod.mercadoPago:
        return const Color(0xFF009EE3);
      case PaymentMethod.applePay:
        return Colors.black;
      case PaymentMethod.googlePay:
        return const Color(0xFF4285F4);
      case PaymentMethod.bankTransfer:
        return Colors.green;
    }
  }

  IconData _getPaymentMethodIcon(PaymentMethod type) {
    switch (type) {
      case PaymentMethod.stripe:
        return Icons.credit_card;
      case PaymentMethod.paypal:
        return Icons.account_balance_wallet;
      case PaymentMethod.mercadoPago:
        return Icons.payment;
      case PaymentMethod.applePay:
        return Icons.phone_iphone;
      case PaymentMethod.googlePay:
        return Icons.android;
      case PaymentMethod.bankTransfer:
        return Icons.account_balance;
    }
  }

  String _getPaymentMethodName(PaymentMethod method) {
    switch (method) {
      case PaymentMethod.stripe:
        return 'Tarjeta de Crédito';
      case PaymentMethod.paypal:
        return 'PayPal';
      case PaymentMethod.mercadoPago:
        return 'MercadoPago';
      case PaymentMethod.applePay:
        return 'Apple Pay';
      case PaymentMethod.googlePay:
        return 'Google Pay';
      case PaymentMethod.bankTransfer:
        return 'Transferencia';
    }
  }
}
