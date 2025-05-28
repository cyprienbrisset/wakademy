-- Table des favoris utilisateurs
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Table de l'historique de visionnage
CREATE TABLE IF NOT EXISTS public.user_watch_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Activer RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watch_history ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les favoris
CREATE POLICY "Les utilisateurs peuvent voir leurs propres favoris"
  ON public.user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent gérer leurs propres favoris"
  ON public.user_favorites FOR ALL
  USING (auth.uid() = user_id);

-- Politiques RLS pour l'historique de visionnage
CREATE POLICY "Les utilisateurs peuvent voir leur propre historique"
  ON public.user_watch_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent gérer leur propre historique"
  ON public.user_watch_history FOR ALL
  USING (auth.uid() = user_id);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER on_user_watch_history_updated
  BEFORE UPDATE ON public.user_watch_history
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS user_favorites_user_idx ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS user_favorites_content_idx ON public.user_favorites(content_id);
CREATE INDEX IF NOT EXISTS user_watch_history_user_idx ON public.user_watch_history(user_id);
CREATE INDEX IF NOT EXISTS user_watch_history_content_idx ON public.user_watch_history(content_id);
CREATE INDEX IF NOT EXISTS user_watch_history_last_watched_idx ON public.user_watch_history(last_watched_at); 