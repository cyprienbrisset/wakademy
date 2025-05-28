-- Table des contenus
CREATE TABLE IF NOT EXISTS public.contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('video', 'podcast', 'document')),
  file_path TEXT NOT NULL,
  file_size BIGINT,
  duration INTEGER,
  thumbnail TEXT,
  author TEXT,
  language TEXT DEFAULT 'fr',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'published', 'archived', 'error')),
  is_featured BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  search_vector tsvector
);

-- Table de liaison contenus-tags
CREATE TABLE IF NOT EXISTS public.content_tags (
  content_id UUID REFERENCES public.contents(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, tag_id)
);

-- Activer RLS
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les contenus
CREATE POLICY "Les contenus publiés sont visibles par tous"
  ON public.contents FOR SELECT
  USING (status = 'published');

CREATE POLICY "Les utilisateurs authentifiés peuvent voir les contenus en cours de traitement"
  ON public.contents FOR SELECT
  USING (
    auth.role() = 'authenticated' 
    AND status IN ('draft', 'processing')
    AND created_by = auth.uid()
  );

CREATE POLICY "Les administrateurs peuvent voir tous les contenus"
  ON public.contents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Les utilisateurs authentifiés peuvent créer des contenus"
  ON public.contents FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres contenus"
  ON public.contents FOR UPDATE
  USING (
    auth.uid() = created_by 
    AND status != 'published'
  );

CREATE POLICY "Les administrateurs peuvent modifier tous les contenus"
  ON public.contents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques RLS pour content_tags
CREATE POLICY "Les tags de contenu sont visibles par tous"
  ON public.content_tags FOR SELECT
  USING (true);

CREATE POLICY "Les administrateurs peuvent gérer les tags de contenu"
  ON public.content_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER on_contents_updated
  BEFORE UPDATE ON public.contents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger pour la recherche full-text
CREATE OR REPLACE FUNCTION public.update_content_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('french', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_content_search_vector_update
  BEFORE INSERT OR UPDATE ON public.contents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_content_search_vector();

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS contents_search_idx ON public.contents USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS contents_type_idx ON public.contents(type);
CREATE INDEX IF NOT EXISTS contents_status_idx ON public.contents(status);
CREATE INDEX IF NOT EXISTS contents_category_idx ON public.contents(category_id);
CREATE INDEX IF NOT EXISTS contents_created_by_idx ON public.contents(created_by);
CREATE INDEX IF NOT EXISTS contents_published_at_idx ON public.contents(published_at);
CREATE INDEX IF NOT EXISTS contents_title_trgm_idx ON public.contents USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS contents_description_trgm_idx ON public.contents USING GIN (description gin_trgm_ops); 