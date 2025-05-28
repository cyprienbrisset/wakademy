-- Créer la table content_chapters si elle n'existe pas
CREATE TABLE IF NOT EXISTS content_chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time INTEGER NOT NULL, -- Temps de début en secondes
  end_time INTEGER, -- Temps de fin en secondes (optionnel)
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS content_chapters_content_id_idx ON content_chapters(content_id);
CREATE INDEX IF NOT EXISTS content_chapters_start_time_idx ON content_chapters(start_time);

-- Créer la table content_ai_summaries si elle n'existe pas
CREATE TABLE IF NOT EXISTS content_ai_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  key_points TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_id)
);

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS content_ai_summaries_content_id_idx ON content_ai_summaries(content_id);

-- Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_content_chapters_updated_at') THEN
    CREATE TRIGGER update_content_chapters_updated_at 
    BEFORE UPDATE ON content_chapters 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_content_ai_summaries_updated_at') THEN
    CREATE TRIGGER update_content_ai_summaries_updated_at 
    BEFORE UPDATE ON content_ai_summaries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
