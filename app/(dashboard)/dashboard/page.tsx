"use client"

import { Suspense, useEffect } from "react"
import { ProgressSection } from "@/components/dashboard/progress-section"
import { Skeleton } from "@/components/ui/skeleton"
import { usePreloader, preloadCriticalResources } from "@/lib/performance/preloader"
import { ServiceWorkerProvider } from "@/components/providers/service-worker-provider"
import { 
  LazyTrendingSection, 
  LazyRecentActivitySection, 
  LazyFavoritesSection, 
  LazyPerformanceMonitor,
  usePreloadComponents,
  LazyLoadWrapper
} from "@/lib/lazy-loading/lazy-components"

// Composants de loading optimisés
function ProgressSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      ))}
    </div>
  )
}

// Wrapper pour RecentActivitySection avec gestion des données utilisateur
function RecentActivityWrapper() {
  const [userData, setUserData] = React.useState<any>(null)
  const [userActivity, setUserActivity] = React.useState<any>(null)

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setUserData({ id: user.id, email: user.email })
          setUserActivity({})
        } else {
          setUserData({ id: 'demo-user', email: 'demo@example.com' })
          setUserActivity({})
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error)
        setUserData({ id: 'demo-user', email: 'demo@example.com' })
        setUserActivity({})
      }
    }

    fetchUserData()
  }, [])

  if (!userData) {
    return (
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
    )
  }

  return <LazyRecentActivitySection userData={userData} userActivity={userActivity} />
}

export default function DashboardPage() {
  // Initialiser le préchargement automatique
  usePreloader()
  
  // Précharger les composants non critiques
  usePreloadComponents()

  // Précharger les ressources critiques
  useEffect(() => {
    preloadCriticalResources()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* En-tête */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Découvrez les contenus tendances et continuez votre apprentissage
        </p>
      </div>

      {/* Progression avec loading prioritaire */}
      <Suspense fallback={<ProgressSkeleton />}>
        <ProgressSection />
      </Suspense>

      {/* Contenus tendances avec lazy loading */}
      <LazyLoadWrapper threshold={0.2}>
        <LazyTrendingSection />
      </LazyLoadWrapper>

      {/* Activité récente avec lazy loading différé */}
      <LazyLoadWrapper threshold={0.1}>
        <RecentActivityWrapper />
      </LazyLoadWrapper>

      {/* Favoris avec lazy loading très différé */}
      <LazyLoadWrapper threshold={0.05}>
        <LazyFavoritesSection />
      </LazyLoadWrapper>

      {/* Moniteur de performance (uniquement en développement) */}
      {process.env.NODE_ENV === 'development' && (
        <LazyLoadWrapper threshold={0.01}>
          <LazyPerformanceMonitor />
        </LazyLoadWrapper>
      )}
    </div>
  )
}

// Import React pour les hooks
import React from 'react' 