-- Table des catégories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des tags
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#6B7280',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les catégories
CREATE POLICY "Les catégories sont visibles par tous"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Seuls les administrateurs peuvent modifier les catégories"
  ON public.categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques RLS pour les tags
CREATE POLICY "Les tags sont visibles par tous"
  ON public.tags FOR SELECT
  USING (true);

CREATE POLICY "Seuls les administrateurs peuvent modifier les tags"
  ON public.tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger pour mettre à jour updated_at des catégories
CREATE TRIGGER on_categories_updated
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS categories_name_trgm_idx ON public.categories USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS categories_slug_idx ON public.categories(slug);
CREATE INDEX IF NOT EXISTS tags_name_trgm_idx ON public.tags USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS tags_slug_idx ON public.tags(slug); 