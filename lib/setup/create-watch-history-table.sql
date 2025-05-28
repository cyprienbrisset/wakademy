-- Création de la table d'historique de visionnage
CREATE TABLE IF NOT EXISTS public.user_watch_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  content_id UUID NOT NULL,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_content FOREIGN KEY (content_id) REFERENCES public.contents(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_user_watch_history_user_id ON public.user_watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_watch_history_content_id ON public.user_watch_history(content_id);
CREATE INDEX IF NOT EXISTS idx_user_watch_history_last_watched ON public.user_watch_history(last_watched_at DESC);

-- Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le timestamp updated_at
DROP TRIGGER IF EXISTS update_user_watch_history_updated_at ON public.user_watch_history;
CREATE TRIGGER update_user_watch_history_updated_at
BEFORE UPDATE ON public.user_watch_history
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Ajouter des permissions RLS (Row Level Security)
ALTER TABLE public.user_watch_history ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir uniquement leur propre historique
CREATE POLICY user_watch_history_select_policy ON public.user_watch_history
FOR SELECT USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de modifier uniquement leur propre historique
CREATE POLICY user_watch_history_insert_policy ON public.user_watch_history
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_watch_history_update_policy ON public.user_watch_history
FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de supprimer uniquement leur propre historique
CREATE POLICY user_watch_history_delete_policy ON public.user_watch_history
FOR DELETE USING (auth.uid() = user_id);
