import { Suspense } from "react"
import { getContinueWatchingContent } from "@/lib/content/progress-service"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export const metadata = {
  title: "Continuer à regarder | Wakademy",
  description: "Reprenez vos contenus là où vous les avez laissés",
}

async function ContinueWatchingContent() {
  const continueWatchingItems = await getContinueWatchingContent(20)

  if (continueWatchingItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Clock className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Aucun contenu en cours</h2>
        <p className="text-muted-foreground max-w-md">
          Vous n'avez pas encore commencé à regarder de contenu ou vous avez terminé tous vos contenus.
        </p>
        <Button asChild className="mt-6">
          <Link href="/library">Découvrir du contenu</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {continueWatchingItems.map((item) => {
        const content = item.content
        const formattedDate = new Date(item.last_watched_at).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })

        // Déterminer l'icône et le texte en fonction du type de contenu
        const typeIcon = <Play className="h-4 w-4 mr-1" />
        let typeText = "Regarder"

        if (content.type === "podcast") {
          typeText = "Écouter"
        } else if (content.type === "document") {
          typeText = "Lire"
        }

        return (
          <Card key={item.id} className="overflow-hidden">
            <div className="relative aspect-video">
              <Image
                src={
                  content.thumbnail_path ||
                  `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(content.title)}`
                }
                alt={content.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <Progress value={item.percentage} className="h-1.5 bg-white/30" />
              </div>
            </div>

            <CardHeader className="pb-2">
              <CardTitle className="overflow-hidden text-ellipsis whitespace-nowrap">{content.title}</CardTitle>
              <CardDescription className="flex items-center text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Dernière lecture le {formattedDate}
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground overflow-hidden text-ellipsis" style={{
                height: '2.4em',
                lineHeight: '1.2em'
              }}>{content.description.length > 80 ? content.description.substring(0, 80) + '...' : content.description}</p>
            </CardContent>

            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/content/${content.id}`}>
                  {typeIcon}
                  {typeText}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

export default function ContinueWatchingPage() {
  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Continuer à regarder</h1>
        <p className="text-muted-foreground">Reprenez vos contenus là où vous les avez laissés</p>
      </div>

      <Suspense fallback={<div>Chargement des contenus en cours...</div>}>
        <ContinueWatchingContent />
      </Suspense>
    </div>
  )
}
