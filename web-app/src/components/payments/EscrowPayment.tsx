import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface EscrowPaymentProps {
  projectId: string;
  amount: number;
  projectTitle: string;
  freelancerName: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

export function EscrowPayment({
  projectId,
  amount,
  projectTitle,
  freelancerName,
  onSuccess,
  onError
}: EscrowPaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [fees, setFees] = useState<any>(null);

  React.useEffect(() => {
    // Calculate fees when component mounts
    calculateFees();
  }, [amount]);

  const calculateFees = async () => {
    try {
      const response = await fetch('/api/v1/payments/calculate-fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      
      if (response.ok) {
        const data = await response.json();
        setFees(data.fees);
      }
    } catch (error) {
      console.error('Error calculating fees:', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent
      const response = await fetch('/api/v1/payments/create-escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          amount,
          description: projectTitle
        })
      });

      const { clientSecret, error } = await response.json();

      if (error) {
        onError(error);
        setIsProcessing(false);
        return;
      }

      // Confirm payment
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        onError('Card element not found');
        setIsProcessing(false);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          }
        }
      );

      if (confirmError) {
        onError(confirmError.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'requires_capture') {
        onSuccess(paymentIntent.id);
      }
    } catch (error) {
      onError('An unexpected error occurred');
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">🔒 Pago Seguro con Escrow</CardTitle>
        <p className="text-sm text-gray-600">
          Tu pago se mantendrá seguro hasta que el proyecto se complete
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Project Details */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Detalles del Proyecto</h4>
            <p className="text-sm text-gray-700">{projectTitle}</p>
            <p className="text-sm text-gray-600">Freelancer: {freelancerName}</p>
          </div>

          {/* Fee Breakdown */}
          {fees && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">💰 Desglose de Costos</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Monto del proyecto:</span>
                  <span>{formatCurrency(fees.originalAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Comisión plataforma (10%):</span>
                  <span>{formatCurrency(fees.platformFee)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Comisión procesamiento:</span>
                  <span>{formatCurrency(fees.stripeFee)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total a pagar:</span>
                  <span>{formatCurrency(fees.clientTotal)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 border border-gray-300 rounded-lg">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-1">🛡️ Protección Escrow</h4>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Tu pago se mantiene seguro hasta completar el proyecto</li>
                <li>• Solo se libera cuando apruebes el trabajo</li>
                <li>• Reembolso completo si no estás satisfecho</li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={!stripe || isProcessing}
              loading={isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Procesando...' : `Pagar ${fees ? formatCurrency(fees.clientTotal) : ''}`}
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center">
            🔒 Pago seguro procesado por Stripe. Tus datos están protegidos.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
