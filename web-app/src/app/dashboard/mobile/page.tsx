import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UnifiedDashboard from '@/components/mobile/UnifiedDashboard'

export const metadata: Metadata = {
  title: 'Dashboard Móvil - Mercenary',
  description:
    'Dashboard unificado con sincronización móvil/web en tiempo real',
}

export default async function MobileDashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedDashboard />
    </div>
  )
}
