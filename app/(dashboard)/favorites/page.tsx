export default function FavoritesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Favoris</h1>
      <p className="text-muted-foreground">Vos contenus préférés.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* Contenu à implémenter */}
        <div className="border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">Aucun favori pour le moment.</p>
        </div>
      </div>
    </div>
  )
}
