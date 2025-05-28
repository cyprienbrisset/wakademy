import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

const testimonials = [
  {
    id: 1,
    name: "Marie Dupont",
    role: "Directrice RH, Entreprise A",
    avatar: "/placeholder.svg?height=40&width=40&query=avatar woman",
    content:
      "Wakademy a transformé notre façon de partager les connaissances en interne. L'interface intuitive et l'expérience immersive ont considérablement augmenté l'engagement de nos équipes.",
  },
  {
    id: 2,
    name: "Thomas Martin",
    role: "Responsable Formation, Entreprise B",
    avatar: "/placeholder.svg?height=40&width=40&query=avatar man",
    content:
      "La génération automatique de résumés et de podcasts nous fait gagner un temps précieux. Nos collaborateurs peuvent désormais consommer le contenu dans le format qui leur convient le mieux.",
  },
  {
    id: 3,
    name: "Sophie Leroy",
    role: "CEO, Startup C",
    avatar: "/placeholder.svg?height=40&width=40&query=avatar woman business",
    content:
      "L'analytics nous permet de comprendre précisément quels contenus intéressent nos équipes et d'adapter notre stratégie en conséquence. Un outil indispensable pour notre croissance.",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 px-4 md:px-6">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Ce qu'ils en disent</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-card">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar className="h-10 w-10 mr-4">
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic">"{testimonial.content}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
