-- Créer la table topics si elle n'existe pas
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  parent_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table content_topics si elle n'existe pas
CREATE TABLE IF NOT EXISTS content_topics (
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, topic_id)
);

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS content_topics_content_id_idx ON content_topics(content_id);
CREATE INDEX IF NOT EXISTS content_topics_topic_id_idx ON content_topics(topic_id);

-- Insérer quelques topics par défaut
INSERT INTO topics (name, slug, description, color)
VALUES 
  ('Leadership', 'leadership', 'Développement du leadership', '#8B5CF6'),
  ('Management', 'management', 'Techniques de management', '#3B82F6'),
  ('Communication', 'communication', 'Communication efficace', '#10B981'),
  ('Marketing', 'marketing', 'Stratégies marketing', '#F59E0B'),
  ('Finance', 'finance', 'Gestion financière', '#EF4444'),
  ('Technologie', 'technologie', 'Innovations technologiques', '#06B6D4'),
  ('Développement personnel', 'developpement-personnel', 'Croissance personnelle', '#8B5CF6'),
  ('Vente', 'vente', 'Techniques de vente', '#F59E0B')
ON CONFLICT (slug) DO NOTHING;
