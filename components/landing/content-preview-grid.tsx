import Image from "next/image"

const previewItems = [
  {
    id: 1,
    title: "Formation Leadership",
    type: "video",
    thumbnail: "/formation-leadership.png",
    duration: "45 min",
  },
  {
    id: 2,
    title: "Podcast Innovation",
    type: "podcast",
    thumbnail: "/placeholder.svg?height=200&width=350&query=podcast innovation",
    duration: "32 min",
  },
  {
    id: 3,
    title: "Guide Onboarding",
    type: "document",
    thumbnail: "/placeholder.svg?height=200&width=350&query=guide onboarding",
    duration: "15 pages",
  },
  {
    id: 4,
    title: "Webinaire Stratégie",
    type: "video",
    thumbnail: "/placeholder.svg?height=200&width=350&query=webinaire stratégie",
    duration: "60 min",
  },
  {
    id: 5,
    title: "Série Développement",
    type: "video",
    thumbnail: "/placeholder.svg?height=200&width=350&query=série développement",
    duration: "5 épisodes",
  },
  {
    id: 6,
    title: "Rapport Annuel",
    type: "document",
    thumbnail: "/placeholder.svg?height=200&width=350&query=rapport annuel",
    duration: "42 pages",
  },
]

export function ContentPreviewGrid() {
  return (
    <section className="py-20 px-4 md:px-6 bg-muted/30">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Découvrez nos contenus</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {previewItems.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02]"
            >
              <div className="aspect-video relative">
                <Image src={item.thumbnail || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <h3 className="font-semibold">{item.title}</h3>
                  <div className="flex items-center text-sm mt-1">
                    <span className="capitalize">{item.type}</span>
                    <span className="mx-2">•</span>
                    <span>{item.duration}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
