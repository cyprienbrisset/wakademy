-- Table des commentaires
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des évaluations/notes
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_id, user_id)
);

-- Activer RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les commentaires
CREATE POLICY "Les commentaires approuvés sont visibles par tous"
  ON public.comments FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Les utilisateurs peuvent voir leurs propres commentaires"
  ON public.comments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent créer des commentaires"
  ON public.comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres commentaires"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Les administrateurs peuvent gérer tous les commentaires"
  ON public.comments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques RLS pour les évaluations
CREATE POLICY "Les évaluations sont visibles par tous"
  ON public.ratings FOR SELECT
  USING (true);

CREATE POLICY "Les utilisateurs peuvent créer des évaluations"
  ON public.ratings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres évaluations"
  ON public.ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Les administrateurs peuvent gérer toutes les évaluations"
  ON public.ratings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER on_comments_updated
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_ratings_updated
  BEFORE UPDATE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS comments_content_idx ON public.comments(content_id);
CREATE INDEX IF NOT EXISTS comments_user_idx ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS comments_parent_idx ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON public.comments(created_at);
CREATE INDEX IF NOT EXISTS ratings_content_idx ON public.ratings(content_id);
CREATE INDEX IF NOT EXISTS ratings_user_idx ON public.ratings(user_id);
CREATE INDEX IF NOT EXISTS ratings_rating_idx ON public.ratings(rating); 