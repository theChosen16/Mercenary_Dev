'use client'

import React, { useState } from 'react'
import { type VariantProps } from 'class-variance-authority'
import { Button, buttonVariants } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Check } from 'lucide-react'
import { initMercadoPago } from '@mercadopago/sdk-react'
import { useSession } from 'next-auth/react'

const mpPublicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY;
if (mpPublicKey) {
  initMercadoPago(mpPublicKey, { locale: 'es-CL' });
} else {
  console.warn("Mercado Pago public key is not set. Payment button will not work.");
}

type ButtonVariant = VariantProps<typeof buttonVariants>['variant']

interface Plan {
  name: string
  price: string
  priceAmount: number
  description: string
  features: string[]
  cta: string
  variant: ButtonVariant
}

const plans: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    priceAmount: 0,
    description: 'Para freelancers que recién comienzan.',
    features: [
      'Perfil público',
      'Acceso a proyectos públicos',
      'Soporte estándar',
    ],
    cta: 'Comienza Gratis',
    variant: 'outline',
  },
  {
    name: 'Pro',
    price: '$9.990/mes',
    priceAmount: 9990,
    description: 'Para profesionales que buscan destacar.',
    features: [
      'Todo lo del plan Free',
      'Acceso a proyectos exclusivos',
      'Perfil destacado',
      'Soporte prioritario',
    ],
    cta: 'Suscribirse Ahora',
    variant: 'gold',
  },
]

export function PricingSection() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState<string | null>(null);

  const handleSubscription = async (plan: Plan) => {
    if (plan.name !== 'Pro') return;

    setIsLoading(true);
    setError(null);
    setActivePlan(plan.name);

    try {
      const response = await fetch('http://localhost:8000/api/v1/payments/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          reason: `Suscripción ${plan.name}`,
          price: plan.priceAmount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create payment preference.');
      }

      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('Subscription URL not found in response.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="pricing" className="py-20 px-4 bg-muted/50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Planes y Precios</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Elige el plan que se ajuste a tus necesidades y lleva tu carrera al siguiente nivel.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={`flex flex-col ${plan.name === 'Pro' ? 'border-gold-500 shadow-gold-500/20 shadow-lg' : ''}`}>
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="text-4xl font-bold pt-4">{plan.price}</div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex items-center justify-center">
                {plan.name === 'Pro' ? (
                  <Button
                    size="lg"
                    variant={plan.variant}
                    className="w-full"
                    onClick={() => handleSubscription(plan)}
                    disabled={isLoading && activePlan === 'Pro'}
                  >
                    {isLoading && activePlan === 'Pro' ? 'Redirigiendo...' : plan.cta}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant={plan.variant}
                    className="w-full"
                    onClick={() => alert('Disfruta de tu plan gratuito!')}
                  >
                    {plan.cta}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>
    </section>
  );
}
