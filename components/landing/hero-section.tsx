import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="py-20 px-4 md:px-6 lg:py-32 bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Votre plateforme de contenus internes</h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10">
          Inspirée de Netflix, conçue pour votre entreprise. Partagez vidéos, podcasts et documents dans une interface
          immersive et élégante.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/demo">
            <Button size="lg" className="px-8">
              Demander une démo
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="px-8">
              Se connecter
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
