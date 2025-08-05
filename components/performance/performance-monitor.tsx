"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { performanceCache } from '@/lib/performance/cache'
import { getConnectionStats } from '@/lib/supabase/client'
import { Activity, Database, Clock, Zap, RefreshCw } from 'lucide-react'

interface PerformanceMetrics {
  cacheStats: {
    size: number
    keys: string[]
  }
  connectionStats: {
    activeConnections: number
    maxConnections: number
    connectionCount: number
  }
  pageLoadTime: number
  apiResponseTimes: Record<string, number>
  memoryUsage?: number
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const getApiResponseTimes = useCallback((): Record<string, number> => {
    // En production, ceci serait collecté depuis les vraies requêtes
    return {
      '/api/trending': Math.random() * 200 + 50,
      '/api/library': Math.random() * 300 + 100,
      '/api/content': Math.random() * 150 + 75
    }
  }, [])

  const collectMetrics = useCallback(() => {
    try {
      const cacheStats = performanceCache.getStats()
      const connectionStats = getConnectionStats()
      
      // Mesurer le temps de chargement de la page
      const pageLoadTime = performance.timing 
        ? performance.timing.loadEventEnd - performance.timing.navigationStart
        : 0

      // Obtenir l'utilisation mémoire si disponible
      const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0

      const newMetrics: PerformanceMetrics = {
        cacheStats,
        connectionStats,
        pageLoadTime,
        apiResponseTimes: getApiResponseTimes(),
        memoryUsage
      }

      setMetrics(newMetrics)
      setLastUpdate(new Date())
    } catch (error) {
      console.warn('Erreur lors de la collecte des métriques:', error)
    }
  }, [getApiResponseTimes])

  useEffect(() => {
    // Collecter les métriques au montage
    collectMetrics()

    // Mettre à jour toutes les 5 secondes
    const interval = setInterval(collectMetrics, 5000)

    return () => clearInterval(interval)
  }, [collectMetrics])

  // Raccourci clavier pour afficher/masquer le moniteur
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        setIsVisible(!isVisible)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isVisible])

  const clearCache = () => {
    performanceCache.clear()
    collectMetrics()
  }

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'bg-green-500'
    if (value <= thresholds.warning) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (!isVisible || !metrics) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-background/80 backdrop-blur-sm"
        >
          <Activity className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="bg-background/95 backdrop-blur-sm border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <CardTitle className="text-lg">Performance Monitor</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={collectMetrics}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVisible(false)}
              >
                ×
              </Button>
            </div>
          </div>
          <CardDescription>
            Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Cache Performance */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="font-medium">Cache</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Éléments en cache:</span>
              <Badge variant="secondary">{metrics.cacheStats.size}</Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearCache}
              className="w-full"
            >
              Vider le cache
            </Button>
          </div>

          {/* Database Connections */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="font-medium">Connexions DB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Actives:</span>
              <Badge variant="secondary">
                {metrics.connectionStats.activeConnections}/{metrics.connectionStats.maxConnections}
              </Badge>
            </div>
          </div>

          {/* Page Load Time */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Temps de chargement</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Page:</span>
              <Badge 
                className={`text-white ${getPerformanceColor(metrics.pageLoadTime, { good: 1000, warning: 3000 })}`}
              >
                {metrics.pageLoadTime}ms
              </Badge>
            </div>
          </div>

          {/* API Response Times */}
          <div className="space-y-2">
            <span className="font-medium">Temps de réponse API</span>
            {Object.entries(metrics.apiResponseTimes).map(([endpoint, time]) => (
              <div key={endpoint} className="flex justify-between items-center">
                <span className="text-sm">{endpoint}:</span>
                <Badge 
                  className={`text-white ${getPerformanceColor(time, { good: 100, warning: 300 })}`}
                >
                  {Math.round(time)}ms
                </Badge>
              </div>
            ))}
          </div>

          {/* Memory Usage */}
          {metrics.memoryUsage && (
            <div className="space-y-2">
              <span className="font-medium">Mémoire utilisée</span>
              <div className="flex justify-between items-center">
                <span className="text-sm">JS Heap:</span>
                <Badge variant="secondary">
                  {Math.round(metrics.memoryUsage / 1024 / 1024)}MB
                </Badge>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground pt-2 border-t">
            Ctrl+Shift+P pour afficher/masquer
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 