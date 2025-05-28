"use client"

import React, { Suspense, lazy } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Composant de skeleton par défaut
function ComponentSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}

// Hook pour lazy loading avec Intersection Observer
export function useLazyLoad(threshold = 0.1) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [hasLoaded, setHasLoaded] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true)
          setHasLoaded(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold, hasLoaded])

  return { ref, isVisible, hasLoaded }
}

// Composant wrapper pour lazy loading avec Intersection Observer
interface LazyLoadWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  threshold?: number
  className?: string
}

export function LazyLoadWrapper({ 
  children, 
  fallback = <ComponentSkeleton />, 
  threshold = 0.1,
  className = ""
}: LazyLoadWrapperProps) {
  const { ref, isVisible } = useLazyLoad(threshold)

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : fallback}
    </div>
  )
}

// Composants lazy simplifiés avec gestion d'erreur
const TrendingSectionLazy = lazy(() => 
  import('@/components/dashboard/trending-section')
    .then(module => ({ default: module.TrendingSection }))
    .catch(() => ({ 
      default: () => (
        <div className="p-4 text-center text-muted-foreground">
          Contenu tendance temporairement indisponible
        </div>
      )
    }))
)

const RecentActivitySectionLazy = lazy(() => 
  import('@/components/dashboard/recent-activity-section')
    .then(module => ({ default: module.RecentActivitySection }))
    .catch(() => ({ 
      default: () => (
        <div className="p-4 text-center text-muted-foreground">
          Activité récente temporairement indisponible
        </div>
      )
    }))
)

const FavoritesSectionLazy = lazy(() => 
  import('@/components/dashboard/favorites-section')
    .then(module => ({ default: module.FavoritesSection }))
    .catch(() => ({ 
      default: () => (
        <div className="p-4 text-center text-muted-foreground">
          Favoris temporairement indisponibles
        </div>
      )
    }))
)

const PerformanceMonitorLazy = lazy(() => 
  import('@/components/performance/performance-monitor')
    .then(module => ({ default: module.PerformanceMonitor }))
    .catch(() => ({ 
      default: () => <div className="hidden" />
    }))
)

// Wrappers avec Suspense
export function LazyTrendingSection(props: any) {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    }>
      <TrendingSectionLazy {...props} />
    </Suspense>
  )
}

export function LazyRecentActivitySection(props: any) {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    }>
      <RecentActivitySectionLazy {...props} />
    </Suspense>
  )
}

export function LazyFavoritesSection(props: any) {
  return (
    <Suspense fallback={<div className="h-64 w-full bg-muted animate-pulse rounded-lg" />}>
      <FavoritesSectionLazy {...props} />
    </Suspense>
  )
}

export function LazyPerformanceMonitor(props: any) {
  return (
    <Suspense fallback={null}>
      <PerformanceMonitorLazy {...props} />
    </Suspense>
  )
}

// Hook pour précharger des composants
export function usePreloadComponents() {
  React.useEffect(() => {
    // Précharger les composants après un délai
    const preloadTimer = setTimeout(() => {
      // Précharger les composants non critiques
      import('@/components/dashboard/favorites-section').catch(() => {})
      import('@/components/performance/performance-monitor').catch(() => {})
    }, 2000)

    return () => clearTimeout(preloadTimer)
  }, [])
}

// Composant pour lazy loading d'images avec placeholder
interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  threshold?: number
}

export function LazyImage({ 
  src, 
  alt, 
  className = "", 
  placeholder = "/placeholder.svg",
  threshold = 0.1 
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [imageSrc, setImageSrc] = React.useState(placeholder)
  const { ref, isVisible } = useLazyLoad(threshold)

  React.useEffect(() => {
    if (isVisible && !isLoaded) {
      const img = new Image()
      img.onload = () => {
        setImageSrc(src)
        setIsLoaded(true)
      }
      img.onerror = () => {
        console.warn('Failed to load image:', src)
        setIsLoaded(true) // Marquer comme chargé même en cas d'erreur
      }
      img.src = src
    }
  }, [isVisible, isLoaded, src])

  return (
    <div ref={ref} className={className}>
      <img 
        src={imageSrc} 
        alt={alt} 
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-50'}`}
        loading="lazy"
      />
    </div>
  )
}

// Hook pour lazy loading de données avec cache
export function useLazyData<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    let cancelled = false
    
    const loadData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const result = await fetchFn()
        if (!cancelled) {
          setData(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, dependencies)

  return { data, loading, error }
} 