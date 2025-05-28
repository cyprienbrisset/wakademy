-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  department TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  avatar_url TEXT,
  bio TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des catégories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des tags
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#6B7280',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des contenus
CREATE TABLE IF NOT EXISTS contents (
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
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
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
CREATE TABLE IF NOT EXISTS content_tags (
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, tag_id)
);

-- Table des jobs de traitement IA
CREATE TABLE IF NOT EXISTS content_ai_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN ('summary', 'transcription', 'categorization', 'audio_extraction', 'thumbnail_generation', 'tagging')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  result_path TEXT,
  result_data JSONB,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Table des favoris utilisateurs
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Table de l'historique de visionnage
CREATE TABLE IF NOT EXISTS user_watch_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Table des playlists utilisateurs
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  thumbnail_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de liaison playlists-contenus
CREATE TABLE IF NOT EXISTS playlist_contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, content_id)
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Table des paramètres de l'application
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des commentaires
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des évaluations/notes
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_id, user_id)
);

-- Table des résultats de quiz
CREATE TABLE IF NOT EXISTS user_quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  passed BOOLEAN DEFAULT FALSE,
  answers JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des connexions utilisateurs
CREATE TABLE IF NOT EXISTS user_logins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des badges
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  criteria JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des badges utilisateurs
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS contents_search_idx ON contents USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS contents_type_idx ON contents(type);
CREATE INDEX IF NOT EXISTS contents_status_idx ON contents(status);
CREATE INDEX IF NOT EXISTS contents_category_idx ON contents(category_id);
CREATE INDEX IF NOT EXISTS contents_created_by_idx ON contents(created_by);
CREATE INDEX IF NOT EXISTS contents_published_at_idx ON contents(published_at);
CREATE INDEX IF NOT EXISTS user_watch_history_user_idx ON user_watch_history(user_id);
CREATE INDEX IF NOT EXISTS user_watch_history_content_idx ON user_watch_history(content_id);
CREATE INDEX IF NOT EXISTS user_watch_history_last_watched_idx ON user_watch_history(last_watched_at);

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
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_contents_updated_at') THEN
    CREATE TRIGGER update_contents_updated_at BEFORE UPDATE ON contents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_categories_updated_at') THEN
    CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_watch_history_updated_at') THEN
    CREATE TRIGGER update_user_watch_history_updated_at BEFORE UPDATE ON user_watch_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Fonction pour mettre à jour le search_vector
CREATE OR REPLACE FUNCTION update_content_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('french', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.description, '') || ' ' || COALESCE(NEW.author, ''));
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour la recherche full-text
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_content_search_vector_trigger') THEN
    CREATE TRIGGER update_content_search_vector_trigger
    BEFORE INSERT OR UPDATE ON contents
    FOR EACH ROW EXECUTE FUNCTION update_content_search_vector();
  END IF;
END $$;

-- Données initiales
-- Catégories par défaut
INSERT INTO categories (name, slug, description, color, icon) VALUES
('Business', 'business', 'Contenus liés au monde des affaires', '#3B82F6', 'briefcase'),
('Formation', 'formation', 'Contenus de formation et apprentissage', '#10B981', 'graduation-cap'),
('Marketing', 'marketing', 'Stratégies et techniques marketing', '#F59E0B', 'megaphone'),
('Finance', 'finance', 'Gestion financière et investissements', '#EF4444', 'dollar-sign'),
('Leadership', 'leadership', 'Développement du leadership', '#8B5CF6', 'users'),
('Technologie', 'technologie', 'Innovations et outils technologiques', '#06B6D4', 'cpu')
ON CONFLICT (slug) DO NOTHING;

-- Tags par défaut
INSERT INTO tags (name, slug, color) VALUES
('Débutant', 'debutant', '#10B981'),
('Intermédiaire', 'intermediaire', '#F59E0B'),
('Avancé', 'avance', '#EF4444'),
('Stratégie', 'strategie', '#3B82F6'),
('Pratique', 'pratique', '#8B5CF6'),
('Théorie', 'theorie', '#6B7280')
ON CONFLICT (slug) DO NOTHING;

-- Paramètres par défaut de l'application
INSERT INTO app_settings (key, value, description, category, is_public) VALUES
('app_name', '"Wakademy"', 'Nom de l''application', 'general', true),
('app_description', '"Plateforme d''apprentissage et de partage de contenu"', 'Description de l''application', 'general', true),
('default_language', '"fr"', 'Langue par défaut', 'general', true),
('max_file_size', '104857600', 'Taille maximale des fichiers en bytes (100MB)', 'upload', false),
('allowed_file_types', '["mp4", "mp3", "pdf", "docx", "wav", "mov"]', 'Types de fichiers autorisés', 'upload', false),
('ai_processing_enabled', 'true', 'Traitement IA activé', 'ai', false),
('auto_categorization', 'true', 'Catégorisation automatique', 'ai', false),
('auto_transcription', 'false', 'Transcription automatique', 'ai', false)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Badges par défaut
INSERT INTO badges (title, description, icon, criteria) VALUES
('Explorateur', 'A consulté au moins 5 contenus différents', 'compass', '{"min_content_viewed": 5}'),
('Expert', 'A terminé au moins 10 contenus', 'award', '{"min_content_completed": 10}'),
('Contributeur', 'A laissé au moins 5 commentaires', 'message-square', '{"min_comments": 5}'),
('Évaluateur', 'A noté au moins 10 contenus', 'star', '{"min_ratings": 10}')
ON CONFLICT DO NOTHING;
