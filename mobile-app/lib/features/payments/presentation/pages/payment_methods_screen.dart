import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../shared/models/payment_model.dart';
import '../bloc/payment_bloc.dart';

class PaymentMethodsScreen extends StatefulWidget {
  const PaymentMethodsScreen({super.key});

  @override
  State<PaymentMethodsScreen> createState() => _PaymentMethodsScreenState();
}

class _PaymentMethodsScreenState extends State<PaymentMethodsScreen> {
  @override
  void initState() {
    super.initState();
    context.read<PaymentBloc>().add(LoadPaymentMethods());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Métodos de Pago'),
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
          } else if (state is PaymentSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: Colors.green,
              ),
            );
          }
        },
        builder: (context, state) {
          if (state is PaymentLoading) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          if (state is PaymentMethodsLoaded) {
            return _buildPaymentMethodsList(state.paymentMethods);
          }

          return const Center(
            child: Text('No hay métodos de pago disponibles'),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddPaymentMethodDialog(),
        backgroundColor: AppTheme.primaryColor,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildPaymentMethodsList(List<PaymentMethodInfo> paymentMethods) {
    if (paymentMethods.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.payment,
              size: 64,
              color: Colors.grey,
            ),
            SizedBox(height: 16),
            Text(
              'No tienes métodos de pago guardados',
              style: TextStyle(
                fontSize: 18,
                color: Colors.grey,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Agrega uno para realizar pagos más rápido',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: paymentMethods.length,
      itemBuilder: (context, index) {
        final method = paymentMethods[index];
        return _buildPaymentMethodCard(method);
      },
    );
  }

  Widget _buildPaymentMethodCard(PaymentMethodInfo method) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: _getPaymentMethodColor(method.type),
          child: Icon(
            _getPaymentMethodIcon(method.type),
            color: Colors.white,
          ),
        ),
        title: Text(
          method.displayName,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (method.last4 != null)
              Text('**** **** **** ${method.last4}'),
            if (method.brand != null)
              Text(method.brand!.toUpperCase()),
            Text(
              'Expira: ${method.expiryDate.month.toString().padLeft(2, '0')}/${method.expiryDate.year}',
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 12,
              ),
            ),
          ],
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (method.isDefault)
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: Colors.green,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  'Predeterminado',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                  ),
                ),
              ),
            PopupMenuButton<String>(
              onSelected: (value) => _handleMenuAction(value, method),
              itemBuilder: (context) => [
                if (!method.isDefault)
                  const PopupMenuItem(
                    value: 'set_default',
                    child: Text('Establecer como predeterminado'),
                  ),
                const PopupMenuItem(
                  value: 'remove',
                  child: Text('Eliminar'),
                ),
              ],
            ),
          ],
        ),
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

  void _handleMenuAction(String action, PaymentMethodInfo method) {
    switch (action) {
      case 'set_default':
        context.read<PaymentBloc>().add(
              SetDefaultPaymentMethod(method.id),
            );
        break;
      case 'remove':
        _showRemoveConfirmationDialog(method);
        break;
    }
  }

  void _showRemoveConfirmationDialog(PaymentMethodInfo method) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Eliminar método de pago'),
        content: Text(
          '¿Estás seguro de que quieres eliminar ${method.displayName}?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              context.read<PaymentBloc>().add(
                RemovePaymentMethod(method.id),
              );
            },
            style: TextButton.styleFrom(
              foregroundColor: Colors.red,
            ),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );
  }

  void _showAddPaymentMethodDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => const AddPaymentMethodSheet(),
    );
  }
}

class AddPaymentMethodSheet extends StatefulWidget {
  const AddPaymentMethodSheet({super.key});

  @override
  State<AddPaymentMethodSheet> createState() => _AddPaymentMethodSheetState();
}

class _AddPaymentMethodSheetState extends State<AddPaymentMethodSheet> {
  PaymentMethod selectedMethod = PaymentMethod.stripe;
  final _formKey = GlobalKey<FormState>();
  final _cardNumberController = TextEditingController();
  final _expiryController = TextEditingController();
  final _cvvController = TextEditingController();
  final _nameController = TextEditingController();

  @override
  void dispose() {
    _cardNumberController.dispose();
    _expiryController.dispose();
    _cvvController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.9,
        minChildSize: 0.5,
        expand: false,
        builder: (context, scrollController) {
          return Container(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Agregar método de pago',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: const Icon(Icons.close),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                _buildPaymentMethodSelector(),
                const SizedBox(height: 20),
                Expanded(
                  child: SingleChildScrollView(
                    controller: scrollController,
                    child: _buildPaymentForm(),
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _addPaymentMethod,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryColor,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: const Text('Agregar método de pago'),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildPaymentMethodSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Tipo de método de pago',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          children: PaymentMethod.values.map((method) {
            final isSelected = selectedMethod == method;
            return ChoiceChip(
              label: Text(_getPaymentMethodName(method)),
              selected: isSelected,
              onSelected: (selected) {
                if (selected) {
                  setState(() {
                    selectedMethod = method;
                  });
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

  Widget _buildPaymentForm() {
    switch (selectedMethod) {
      case PaymentMethod.stripe:
        return _buildCreditCardForm();
      case PaymentMethod.paypal:
        return _buildPayPalForm();
      default:
        return _buildGenericForm();
    }
  }

  Widget _buildCreditCardForm() {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          TextFormField(
            controller: _cardNumberController,
            decoration: const InputDecoration(
              labelText: 'Número de tarjeta',
              hintText: '1234 5678 9012 3456',
              prefixIcon: Icon(Icons.credit_card),
            ),
            keyboardType: TextInputType.number,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Ingresa el número de tarjeta';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _expiryController,
                  decoration: const InputDecoration(
                    labelText: 'MM/AA',
                    hintText: '12/25',
                    prefixIcon: Icon(Icons.calendar_today),
                  ),
                  keyboardType: TextInputType.number,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Ingresa la fecha de expiración';
                    }
                    return null;
                  },
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: TextFormField(
                  controller: _cvvController,
                  decoration: const InputDecoration(
                    labelText: 'CVV',
                    hintText: '123',
                    prefixIcon: Icon(Icons.security),
                  ),
                  keyboardType: TextInputType.number,
                  obscureText: true,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Ingresa el CVV';
                    }
                    return null;
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _nameController,
            decoration: const InputDecoration(
              labelText: 'Nombre en la tarjeta',
              hintText: 'Juan Pérez',
              prefixIcon: Icon(Icons.person),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Ingresa el nombre en la tarjeta';
              }
              return null;
            },
          ),
        ],
      ),
    );
  }

  Widget _buildPayPalForm() {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          const Icon(
            Icons.account_balance_wallet,
            size: 64,
            color: Color(0xFF0070BA),
          ),
          const SizedBox(height: 16),
          const Text(
            'PayPal',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Color(0xFF0070BA),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Serás redirigido a PayPal para autorizar este método de pago.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey),
          ),
        ],
      ),
    );
  }

  Widget _buildGenericForm() {
    return const Center(
      child: Text(
        'Método de pago no disponible aún',
        style: TextStyle(color: Colors.grey),
      ),
    );
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

  void _addPaymentMethod() {
    if (selectedMethod == PaymentMethod.stripe && 
        (_formKey.currentState?.validate() ?? false)) {
      context.read<PaymentBloc>().add(
            AddPaymentMethod(
              cardNumber: _cardNumberController.text,
              expiryDate: _expiryController.text,
              cvv: _cvvController.text,
              cardholderName: _nameController.text,
              type: selectedMethod,
              setAsDefault: false,
            ),
          );

      Navigator.of(context).pop();
    } else if (selectedMethod == PaymentMethod.paypal) {
      // Para PayPal, simplemente enviamos datos básicos
      context.read<PaymentBloc>().add(
            AddPaymentMethod(
              cardNumber: '',
              expiryDate: '',
              cvv: '',
              cardholderName: '',
              type: selectedMethod,
              setAsDefault: false,
            ),
          );

      Navigator.of(context).pop();
    }
  }
}
