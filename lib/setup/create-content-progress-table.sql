-- Table pour stocker la progression des utilisateurs dans les contenus
CREATE TABLE IF NOT EXISTS content_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  current_position FLOAT DEFAULT 0, -- Position en secondes
  duration FLOAT DEFAULT 0, -- Durée totale en secondes
  percentage FLOAT DEFAULT 0, -- Pourcentage de progression (0-100)
  is_completed BOOLEAN DEFAULT FALSE, -- Si le contenu a été terminé
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS content_progress_user_id_idx ON content_progress(user_id);
CREATE INDEX IF NOT EXISTS content_progress_content_id_idx ON content_progress(content_id);
CREATE INDEX IF NOT EXISTS content_progress_last_watched_idx ON content_progress(last_watched_at);

-- Trigger pour mettre à jour le timestamp updated_at
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_content_progress_updated_at') THEN
    CREATE TRIGGER update_content_progress_updated_at
    BEFORE UPDATE ON content_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Politiques de sécurité RLS (Row Level Security)
ALTER TABLE content_progress ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir uniquement leur propre progression
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_progress' AND policyname = 'content_progress_select_policy') THEN
    CREATE POLICY content_progress_select_policy ON content_progress
    FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- Politique pour permettre aux utilisateurs de modifier uniquement leur propre progression
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_progress' AND policyname = 'content_progress_update_policy') THEN
    CREATE POLICY content_progress_update_policy ON content_progress
    FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Politique pour permettre aux utilisateurs d'insérer uniquement leur propre progression
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_progress' AND policyname = 'content_progress_insert_policy') THEN
    CREATE POLICY content_progress_insert_policy ON content_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Politique pour permettre aux utilisateurs de supprimer uniquement leur propre progression
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_progress' AND policyname = 'content_progress_delete_policy') THEN
    CREATE POLICY content_progress_delete_policy ON content_progress
    FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Politique pour permettre aux administrateurs d'accéder à toutes les données
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_progress' AND policyname = 'content_progress_admin_policy') THEN
    CREATE POLICY content_progress_admin_policy ON content_progress
    USING (
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role = 'admin'
      )
    );
  END IF;
END $$;
