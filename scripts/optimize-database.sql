-- Script d'optimisation de la base de données Wakademy
-- Ajoute des index sur les colonnes fréquemment utilisées pour améliorer les performances

-- Index pour la table contents (table principale)
-- ================================================

-- Index sur les colonnes de tri fréquemment utilisées
CREATE INDEX IF NOT EXISTS idx_contents_views ON contents(views DESC);
CREATE INDEX IF NOT EXISTS idx_contents_created_at ON contents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contents_type ON contents(type);
CREATE INDEX IF NOT EXISTS idx_contents_category ON contents(category);
CREATE INDEX IF NOT EXISTS idx_contents_author ON contents(author);

-- Index composé pour les requêtes complexes
CREATE INDEX IF NOT EXISTS idx_contents_type_views ON contents(type, views DESC);
CREATE INDEX IF NOT EXISTS idx_contents_type_created_at ON contents(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contents_category_views ON contents(category, views DESC);

-- Index pour la recherche textuelle
CREATE INDEX IF NOT EXISTS idx_contents_title_search ON contents USING gin(to_tsvector('french', title));
CREATE INDEX IF NOT EXISTS idx_contents_description_search ON contents USING gin(to_tsvector('french', description));

-- Index pour les tables utilisateur (si elles existent)
-- ====================================================

-- Index pour user_watch_history
CREATE INDEX IF NOT EXISTS idx_user_watch_history_user_id ON user_watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_watch_history_content_id ON user_watch_history(content_id);
CREATE INDEX IF NOT EXISTS idx_user_watch_history_last_watched ON user_watch_history(last_watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_watch_history_user_content ON user_watch_history(user_id, content_id);
CREATE INDEX IF NOT EXISTS idx_user_watch_history_user_last_watched ON user_watch_history(user_id, last_watched_at DESC);

-- Index pour user_favorites
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_content_id ON user_favorites(content_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON user_favorites(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_created ON user_favorites(user_id, created_at DESC);

-- Index pour user_watch_later
CREATE INDEX IF NOT EXISTS idx_user_watch_later_user_id ON user_watch_later(user_id);
CREATE INDEX IF NOT EXISTS idx_user_watch_later_content_id ON user_watch_later(content_id);
CREATE INDEX IF NOT EXISTS idx_user_watch_later_created_at ON user_watch_later(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_watch_later_user_created ON user_watch_later(user_id, created_at DESC);

-- Statistiques et analyse des performances
-- ========================================

-- Analyser les tables pour optimiser le planificateur de requêtes
ANALYZE contents;
ANALYZE user_watch_history;
ANALYZE user_favorites;
ANALYZE user_watch_later;

-- Afficher les informations sur les index créés
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('contents', 'user_watch_history', 'user_favorites', 'user_watch_later')
ORDER BY tablename, indexname; 