import { Film, Headphones, FileText, Users, Shield, BarChart } from "lucide-react"

const features = [
  {
    icon: <Film className="h-10 w-10" />,
    title: "Vidéos",
    description: "Partagez des formations, webinaires et présentations dans un format immersif.",
  },
  {
    icon: <Headphones className="h-10 w-10" />,
    title: "Podcasts",
    description: "Convertissez automatiquement vos vidéos en podcasts pour une écoute flexible.",
  },
  {
    icon: <FileText className="h-10 w-10" />,
    title: "Documents",
    description: "Centralisez vos ressources documentaires avec résumés automatiques par IA.",
  },
  {
    icon: <Users className="h-10 w-10" />,
    title: "Gestion des accès",
    description: "Contrôlez finement qui peut accéder à quel contenu selon les rôles et groupes.",
  },
  {
    icon: <Shield className="h-10 w-10" />,
    title: "Sécurité",
    description: "Protégez vos contenus sensibles avec une authentification robuste.",
  },
  {
    icon: <BarChart className="h-10 w-10" />,
    title: "Analytics",
    description: "Suivez l'engagement et optimisez votre stratégie de contenu interne.",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 md:px-6">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Fonctionnalités principales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-6 rounded-lg bg-card border border-border hover:shadow-md transition-shadow">
              <div className="text-primary mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
