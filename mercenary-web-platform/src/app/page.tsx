'use client'

import React from 'react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Trophy, Star, Users, Zap, Shield, Clock } from 'lucide-react'

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-gold/10">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="gold" className="mb-6">
              🎮 Plataforma Gamificada
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-gold-600 bg-clip-text text-transparent">
              Conecta Talento con Oportunidades
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              La primera plataforma de freelancers gamificada de Chile. Sube de nivel, gana badges y accede a proyectos exclusivos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="gold" asChild>
                <Link href="/register">Comenzar Ahora</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/how-it-works">Cómo Funciona</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Por qué elegir Mercenary?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Una experiencia única que combina trabajo profesional con elementos de gamificación.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Trophy className="h-12 w-12 text-gold-500 mx-auto mb-4" />
                <CardTitle>Sistema de Ranking</CardTitle>
                <CardDescription>
                  Compite con otros freelancers y sube en el ranking global basado en tu desempeño.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Badges y Logros</CardTitle>
                <CardDescription>
                  Desbloquea badges únicos y demuestra tu expertise en diferentes áreas.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <CardTitle>Comunidad Elite</CardTitle>
                <CardDescription>
                  Únete a una comunidad selecta de profesionales de alto rendimiento.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <CardTitle>Matching Inteligente</CardTitle>
                <CardDescription>
                  Algoritmo avanzado que conecta proyectos con el freelancer perfecto.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <CardTitle>Pagos Seguros</CardTitle>
                <CardDescription>
                  Sistema de escrow que protege tanto a clientes como a freelancers.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <CardTitle>Tiempo Real</CardTitle>
                <CardDescription>
                  Chat integrado y notificaciones instantáneas para mejor comunicación.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1,000+</div>
              <div className="text-muted-foreground">Freelancers Activos</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gold-500 mb-2">500+</div>
              <div className="text-muted-foreground">Proyectos Completados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-500 mb-2">98%</div>
              <div className="text-muted-foreground">Satisfacción Cliente</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-500 mb-2">24/7</div>
              <div className="text-muted-foreground">Soporte Disponible</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Listo para comenzar tu aventura?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Únete a la revolución del freelancing gamificado y lleva tu carrera al siguiente nivel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="gold" asChild>
                <Link href="/register?type=freelancer">Soy Freelancer</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/register?type=client">Busco Talento</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
