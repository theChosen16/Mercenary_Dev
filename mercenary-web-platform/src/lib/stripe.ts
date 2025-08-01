import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Client-side Stripe instance
export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
};

// Escrow configuration
export const ESCROW_CONFIG = {
  PLATFORM_FEE_PERCENTAGE: 10, // 10% platform fee
  STRIPE_FEE_PERCENTAGE: 2.9, // Stripe's fee
  STRIPE_FIXED_FEE: 30, // 30 cents in cents
  MINIMUM_AMOUNT: 500, // $5.00 minimum
  MAXIMUM_AMOUNT: 100000000, // $1,000,000 maximum
};

// Calculate fees
export const calculateFees = (amount: number) => {
  const platformFee = Math.round(amount * (ESCROW_CONFIG.PLATFORM_FEE_PERCENTAGE / 100));
  const stripeFee = Math.round(amount * (ESCROW_CONFIG.STRIPE_FEE_PERCENTAGE / 100)) + ESCROW_CONFIG.STRIPE_FIXED_FEE;
  const totalFees = platformFee + stripeFee;
  const freelancerAmount = amount - totalFees;

  return {
    originalAmount: amount,
    platformFee,
    stripeFee,
    totalFees,
    freelancerAmount,
    clientTotal: amount + totalFees // Client pays amount + fees
  };
};

// Create payment intent for escrow
export const createEscrowPaymentIntent = async (
  amount: number,
  projectId: string,
  clientId: string,
  freelancerId: string,
  description: string
) => {
  const fees = calculateFees(amount);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: fees.clientTotal,
    currency: 'usd',
    metadata: {
      type: 'escrow',
      projectId,
      clientId,
      freelancerId,
      originalAmount: amount.toString(),
      platformFee: fees.platformFee.toString(),
      stripeFee: fees.stripeFee.toString(),
    },
    description: `Escrow payment for project: ${description}`,
    capture_method: 'manual', // Hold funds until project completion
  });

  return {
    paymentIntent,
    fees
  };
};

// Release escrow payment to freelancer
export const releaseEscrowPayment = async (paymentIntentId: string) => {
  try {
    // Capture the payment
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
    
    // Create transfer to freelancer (minus platform fee)
    const originalAmount = parseInt(paymentIntent.metadata.originalAmount);
    const platformFee = parseInt(paymentIntent.metadata.platformFee);
    const freelancerAmount = originalAmount - platformFee;

    // Note: In production, you'd need to create Stripe Connect accounts for freelancers
    // const transfer = await stripe.transfers.create({
    //   amount: freelancerAmount,
    //   currency: 'usd',
    //   destination: freelancerStripeAccountId,
    //   metadata: {
    //     projectId: paymentIntent.metadata.projectId,
    //     type: 'escrow_release'
    //   }
    // });

    return {
      success: true,
      paymentIntent,
      freelancerAmount,
      platformFee
    };
  } catch (error) {
    console.error('Error releasing escrow payment:', error);
    throw error;
  }
};

// Refund escrow payment to client
export const refundEscrowPayment = async (paymentIntentId: string, reason: string) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: 'requested_by_customer',
      metadata: {
        refund_reason: reason,
        type: 'escrow_refund'
      }
    });

    return {
      success: true,
      refund
    };
  } catch (error) {
    console.error('Error refunding escrow payment:', error);
    throw error;
  }
};

// Webhook signature verification
export const verifyWebhookSignature = (payload: string, signature: string) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw error;
  }
};
