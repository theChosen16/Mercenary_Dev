'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Eye, 
  Lock,
  Users,
  Globe,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

interface SecurityEvent {
  id: string
  type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  ip: string
  userAgent: string
  timestamp: string
  user?: {
    name: string
    email: string
  }
  metadata?: any
}

interface SecurityDashboardData {
  summary: {
    totalEvents: number
    timeRange: string
  }
  eventsByType: Array<{ type: string; _count: { type: number } }>
  eventsBySeverity: Array<{ severity: string; _count: { severity: number } }>
  topIPs: Array<{ ip: string; _count: { ip: number } }>
  recentEvents: SecurityEvent[]
}

export function SecurityDashboard() {
  const [data, setData] = useState<SecurityDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h')

  useEffect(() => {
    loadSecurityData()
  }, [timeRange])

  const loadSecurityData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/v1/security/dashboard?timeRange=${timeRange}`)
      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
      }
    } catch (error) {
      console.error('Error loading security data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    const colors = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800'
    }
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getEventTypeIcon = (type: string) => {
    const icons = {
      LOGIN_ATTEMPT: '🔐',
      FAILED_LOGIN: '❌',
      SUSPICIOUS_ACTIVITY: '⚠️',
      RATE_LIMIT_EXCEEDED: '🚫',
      DATA_BREACH_ATTEMPT: '🔓'
    }
    return icons[type as keyof typeof icons] || '📊'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center text-gray-500 py-8">
        Error loading security data
      </div>
    )
  }

  const criticalEvents = data.eventsBySeverity.find(e => e.severity === 'CRITICAL')?._count.severity || 0
  const highEvents = data.eventsBySeverity.find(e => e.severity === 'HIGH')?._count.severity || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Security Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor security events and threats in real-time
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={timeRange === '24h' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('24h')}
          >
            24h
          </Button>
          <Button
            variant={timeRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('7d')}
          >
            7d
          </Button>
          <Button
            variant={timeRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('30d')}
          >
            30d
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      {(criticalEvents > 0 || highEvents > 0) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">Security Alert</h3>
                <p className="text-red-700">
                  {criticalEvents > 0 && `${criticalEvents} critical events`}
                  {criticalEvents > 0 && highEvents > 0 && ' and '}
                  {highEvents > 0 && `${highEvents} high-severity events`}
                  {' '}detected in the last {timeRange}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Last {timeRange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique IPs</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.topIPs.length}</div>
            <p className="text-xs text-muted-foreground">
              Distinct sources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              criticalEvents > 0 ? 'text-red-600' :
              highEvents > 5 ? 'text-orange-600' :
              'text-green-600'
            }`}>
              {criticalEvents > 0 ? 'HIGH' :
               highEvents > 5 ? 'MEDIUM' :
               'LOW'}
            </div>
            <p className="text-xs text-muted-foreground">
              Current assessment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Events by Type</CardTitle>
            <CardDescription>
              Distribution of security events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.eventsByType.map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getEventTypeIcon(item.type)}</span>
                    <span className="text-sm font-medium">
                      {item.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <Badge variant="secondary">
                    {item._count.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Events by Severity */}
        <Card>
          <CardHeader>
            <CardTitle>Events by Severity</CardTitle>
            <CardDescription>
              Security event severity levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.eventsBySeverity.map((item) => (
                <div key={item.severity} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.severity}</span>
                  <Badge className={getSeverityColor(item.severity)}>
                    {item._count.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top IPs and Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top IPs */}
        <Card>
          <CardHeader>
            <CardTitle>Top Source IPs</CardTitle>
            <CardDescription>
              Most active IP addresses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topIPs.slice(0, 10).map((item, index) => (
                <div key={item.ip} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">#{index + 1}</span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {item.ip}
                    </code>
                  </div>
                  <Badge variant="outline">
                    {item._count.ip} events
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>
              Latest security events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {data.recentEvents.slice(0, 10).map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <span className="text-lg flex-shrink-0">
                    {getEventTypeIcon(event.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {event.type.replace(/_/g, ' ')}
                      </span>
                      <Badge 
                        variant="secondary" 
                        className={getSeverityColor(event.severity)}
                      >
                        {event.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      IP: {event.ip}
                    </p>
                    {event.user && (
                      <p className="text-xs text-gray-600 mb-1">
                        User: {event.user.name} ({event.user.email})
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
