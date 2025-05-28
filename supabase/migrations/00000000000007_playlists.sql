-- Table des playlists utilisateurs
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  thumbnail_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de liaison playlists-contenus
CREATE TABLE IF NOT EXISTS public.playlist_contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, content_id)
);

-- Activer RLS
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_contents ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les playlists
CREATE POLICY "Les playlists publiques sont visibles par tous"
  ON public.playlists FOR SELECT
  USING (is_public = true);

CREATE POLICY "Les utilisateurs peuvent voir leurs propres playlists"
  ON public.playlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent gérer leurs propres playlists"
  ON public.playlists FOR ALL
  USING (auth.uid() = user_id);

-- Politiques RLS pour les contenus de playlist
CREATE POLICY "Les contenus des playlists publiques sont visibles par tous"
  ON public.playlist_contents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE id = playlist_id AND is_public = true
    )
  );

CREATE POLICY "Les utilisateurs peuvent voir les contenus de leurs playlists"
  ON public.playlist_contents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE id = playlist_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Les utilisateurs peuvent gérer les contenus de leurs playlists"
  ON public.playlist_contents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE id = playlist_id AND user_id = auth.uid()
    )
  );

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER on_playlists_updated
  BEFORE UPDATE ON public.playlists
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS playlists_user_idx ON public.playlists(user_id);
CREATE INDEX IF NOT EXISTS playlists_name_trgm_idx ON public.playlists USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS playlist_contents_playlist_idx ON public.playlist_contents(playlist_id);
CREATE INDEX IF NOT EXISTS playlist_contents_content_idx ON public.playlist_contents(content_id);
CREATE INDEX IF NOT EXISTS playlist_contents_sort_order_idx ON public.playlist_contents(sort_order); 