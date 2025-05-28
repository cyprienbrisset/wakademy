"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CheckCircle, Play, Users, BarChart, Book, Sparkles, ArrowRight } from "lucide-react"
import { LoginModal } from "@/components/auth/login-modal"
import { isAuthenticated } from "@/lib/auth"

export default function LandingPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(isAuthenticated())
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

      {/* Header */}
      <header className="container mx-auto py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Image src="/wakademy-logo.png" alt="Wakademy" width={180} height={60} className="h-14 w-auto" />
        </div>
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button>Accès dashboard</Button>
            </Link>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setIsLoginModalOpen(true)}>
                Connexion
              </Button>
              <Link href="/setup">
                <Button>Commencer</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-10">
            <Image src="/abstract-digital-network.png" alt="Background pattern" fill className="object-cover" />
          </div>
          <div className="container mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Votre plateforme de contenus <span className="text-primary">internes</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Inspirée de Netflix, conçue pour votre entreprise. Partagez vidéos, podcasts et documents dans une
                interface immersive et élégante.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/setup">
                  <Button size="lg" className="px-8 group">
                    Commencer maintenant
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="px-8" onClick={() => setIsLoginModalOpen(true)}>
                  <Play className="mr-2 h-4 w-4" /> Voir la démo
                </Button>
              </div>
            </div>
            <div className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-2xl transition-all hover:shadow-primary/20">
              <Image src="/content-platform-dark-interface.png" alt="Wakademy Platform" fill className="object-cover" />
            </div>
          </div>
        </section>

        {/* Benefits Bento Grid */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Tout ce dont votre entreprise a besoin</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Une plateforme complète pour partager et gérer vos contenus internes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Bento Box 1 - Feature Highlight */}
              <div className="bg-background rounded-xl p-6 border shadow-sm row-span-1 md:row-span-2 flex flex-col justify-between group hover:shadow-md transition-all">
                <div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Expérience utilisateur immersive</h3>
                  <p className="text-muted-foreground">
                    Une interface inspirée de Netflix, offrant une navigation fluide et intuitive pour tous vos
                    contenus.
                  </p>
                </div>
                <div className="mt-8 h-40 relative rounded-lg overflow-hidden">
                  <Image
                    src="/netflix-style-content-grid.png"
                    alt="Interface utilisateur"
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Bento Box 2 - Stats */}
              <div className="bg-primary text-primary-foreground rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Performance prouvée</h3>
                  <BarChart className="h-6 w-6" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-4xl font-bold">87%</p>
                    <p className="text-sm">Augmentation de l'engagement</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-4xl font-bold">65%</p>
                    <p className="text-sm">Gain de temps</p>
                  </div>
                </div>
              </div>

              {/* Bento Box 3 - Quick Feature */}
              <div className="bg-background rounded-xl p-6 border shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">IA intégrée</h3>
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-600 text-lg font-bold">AI</span>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Résumés automatiques, transcription et organisation intelligente de vos contenus.
                </p>
              </div>

              {/* Bento Box 4 - Testimonial */}
              <div className="bg-background rounded-xl p-6 border shadow-sm md:col-span-2 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">MD</span>
                  </div>
                  <div>
                    <p className="italic text-muted-foreground mb-4">
                      "Wakademy a transformé notre façon de partager les connaissances en interne. L'interface intuitive
                      et l'expérience immersive ont considérablement augmenté l'engagement de nos équipes."
                    </p>
                    <p className="font-semibold">Marie Dupont</p>
                    <p className="text-sm text-muted-foreground">Directrice RH, Entreprise A</p>
                  </div>
                </div>
              </div>

              {/* Bento Box 5 - Feature List */}
              <div className="bg-background rounded-xl p-6 border shadow-sm hover:shadow-md transition-all">
                <h3 className="text-xl font-semibold mb-4">Sécurité avancée</h3>
                <ul className="space-y-3">
                  {["Contrôle d'accès granulaire", "Authentification sécurisée", "Données chiffrées"].map(
                    (feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>{feature}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Fonctionnalités principales</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Tout ce dont vous avez besoin pour créer une bibliothèque de contenus engageante
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Play className="h-10 w-10" />,
                  title: "Vidéos",
                  description:
                    "Partagez des formations, webinaires et présentations dans un format immersif avec progression sauvegardée.",
                },
                {
                  icon: <Book className="h-10 w-10" />,
                  title: "Podcasts",
                  description:
                    "Convertissez automatiquement vos vidéos en podcasts pour une écoute flexible en déplacement.",
                },
                {
                  icon: <Users className="h-10 w-10" />,
                  title: "Gestion des accès",
                  description:
                    "Contrôlez finement qui peut accéder à quel contenu selon les rôles et groupes de votre organisation.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-background border shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="text-primary mb-4 group-hover:scale-110 transition-transform origin-left">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à transformer votre partage de connaissances ?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Rejoignez les entreprises qui ont déjà adopté Wakademy pour leur bibliothèque de contenus interne.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/setup">
                <Button size="lg" variant="secondary" className="px-8">
                  Commencer gratuitement
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-white px-8 hover:bg-white/10"
                onClick={() => setIsLoginModalOpen(true)}
              >
                Se connecter
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto py-8 mt-8 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <span className="text-sm text-muted-foreground mb-4 md:mb-0">
            © {new Date().getFullYear()} Wakademy. Tous droits réservés.
          </span>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Confidentialité
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Conditions
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
