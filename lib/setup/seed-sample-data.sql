-- Insérer un utilisateur admin si aucun n'existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE role = 'admin') THEN
    INSERT INTO users (email, first_name, last_name, role, department, status)
    VALUES ('admin@wakademy.com', 'Admin', 'Wakademy', 'admin', 'Administration', 'active');
  END IF;
END $$;

-- Insérer quelques utilisateurs de test
INSERT INTO users (email, first_name, last_name, role, department, status)
VALUES 
  ('user1@example.com', 'Sophie', 'Martin', 'user', 'Marketing', 'active'),
  ('user2@example.com', 'Thomas', 'Dubois', 'user', 'Ventes', 'active'),
  ('user3@example.com', 'Julie', 'Leroy', 'user', 'RH', 'active'),
  ('user4@example.com', 'Nicolas', 'Bernard', 'user', 'Technologie', 'active'),
  ('user5@example.com', 'Marie', 'Dupont', 'moderator', 'Formation', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insérer des contenus d'exemple
INSERT INTO contents (title, description, type, file_path, duration, thumbnail, author, category_id, status, views)
VALUES
  (
    'Leadership et management d''équipe à distance',
    'Apprenez les meilleures pratiques pour diriger une équipe en télétravail',
    'video',
    '/videos/leadership-remote.mp4',
    2700,
    '/leadership-management.png',
    'Sophie Martin',
    (SELECT id FROM categories WHERE slug = 'leadership' LIMIT 1),
    'published',
    342
  ),
  (
    'Techniques de négociation avancées',
    'Maîtrisez l''art de la négociation en entreprise',
    'video',
    '/videos/negotiation-techniques.mp4',
    2280,
    '/business-negotiation.png',
    'Thomas Dubois',
    (SELECT id FROM categories WHERE slug = 'business' LIMIT 1),
    'published',
    287
  ),
  (
    'Tendances marketing 2024',
    'Découvrez les dernières tendances du marketing digital',
    'podcast',
    '/podcasts/marketing-trends-2024.mp3',
    1920,
    '/digital-marketing-strategies.png',
    'Marie Dupont',
    (SELECT id FROM categories WHERE slug = 'marketing' LIMIT 1),
    'published',
    189
  ),
  (
    'Guide de cybersécurité',
    'Un guide complet sur les meilleures pratiques de cybersécurité pour protéger votre entreprise',
    'document',
    '/documents/cybersecurity-guide.pdf',
    0,
    '/cybersecurity-guide.png',
    'Nicolas Bernard',
    (SELECT id FROM categories WHERE slug = 'technologie' LIMIT 1),
    'published',
    234
  ),
  (
    'Analyse de données pour marketeurs',
    'Un podcast qui explique comment utiliser l''analyse de données pour prendre de meilleures décisions marketing',
    'podcast',
    '/podcasts/data-analysis-marketing.mp3',
    1800,
    '/data-analysis-marketing.png',
    'Sophie Martin',
    (SELECT id FROM categories WHERE slug = 'marketing' LIMIT 1),
    'published',
    156
  )
ON CONFLICT DO NOTHING;

-- Ajouter des tags aux contenus
DO $$
DECLARE
  content_id UUID;
  tag_id UUID;
BEGIN
  -- Pour chaque contenu publié
  FOR content_id IN SELECT id FROM contents WHERE status = 'published' LOOP
    -- Ajouter 1-3 tags aléatoires
    FOR tag_id IN SELECT id FROM tags ORDER BY random() LIMIT floor(random() * 3) + 1 LOOP
      INSERT INTO content_tags (content_id, tag_id)
      VALUES (content_id, tag_id)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Ajouter des historiques de visionnage
DO $$
DECLARE
  user_id UUID;
  content_id UUID;
  progress INT;
  completed BOOLEAN;
BEGIN
  -- Pour chaque utilisateur
  FOR user_id IN SELECT id FROM users WHERE role != 'admin' LOOP
    -- Pour chaque contenu publié (limité à 3 par utilisateur)
    FOR content_id IN SELECT id FROM contents WHERE status = 'published' ORDER BY random() LIMIT 3 LOOP
      -- Générer une progression aléatoire
      progress := floor(random() * 100);
      completed := progress > 90;
      
      INSERT INTO user_watch_history (user_id, content_id, progress, completed, last_watched_at, duration)
      VALUES (
        user_id,
        content_id,
        progress,
        completed,
        NOW() - (random() * interval '7 days'),
        (SELECT duration FROM contents WHERE id = content_id) * progress / 100
      )
      ON CONFLICT (user_id, content_id) DO UPDATE SET
        progress = EXCLUDED.progress,
        completed = EXCLUDED.completed,
        last_watched_at = EXCLUDED.last_watched_at,
        duration = EXCLUDED.duration;
    END LOOP;
  END LOOP;
END $$;

-- Ajouter des favoris
DO $$
DECLARE
  user_id UUID;
  content_id UUID;
BEGIN
  -- Pour chaque utilisateur
  FOR user_id IN SELECT id FROM users WHERE role != 'admin' LOOP
    -- Ajouter 1-2 contenus aux favoris
    FOR content_id IN SELECT id FROM contents WHERE status = 'published' ORDER BY random() LIMIT floor(random() * 2) + 1 LOOP
      INSERT INTO user_favorites (user_id, content_id)
      VALUES (user_id, content_id)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Ajouter des évaluations
DO $$
DECLARE
  user_id UUID;
  content_id UUID;
  rating_value INT;
BEGIN
  -- Pour chaque utilisateur
  FOR user_id IN SELECT id FROM users WHERE role != 'admin' LOOP
    -- Noter 1-3 contenus
    FOR content_id IN SELECT id FROM contents WHERE status = 'published' ORDER BY random() LIMIT floor(random() * 3) + 1 LOOP
      -- Générer une note aléatoire entre 3 et 5
      rating_value := floor(random() * 3) + 3;
      
      INSERT INTO ratings (user_id, content_id, rating)
      VALUES (user_id, content_id, rating_value)
      ON CONFLICT (content_id, user_id) DO UPDATE SET
        rating = EXCLUDED.rating;
    END LOOP;
  END LOOP;
END $$;

-- Ajouter des connexions utilisateurs
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Pour chaque utilisateur
  FOR user_id IN SELECT id FROM users LOOP
    -- Ajouter 1-5 connexions
    FOR i IN 1..floor(random() * 5) + 1 LOOP
      INSERT INTO user_logins (user_id, ip_address, user_agent)
      VALUES (
        user_id,
        '192.168.' || floor(random() * 255) || '.' || floor(random() * 255),
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );
    END LOOP;
  END LOOP;
END $$;

-- Attribuer des badges
DO $$
DECLARE
  user_id UUID;
  badge_id UUID;
BEGIN
  -- Pour chaque utilisateur
  FOR user_id IN SELECT id FROM users WHERE role != 'admin' LOOP
    -- Attribuer 0-2 badges aléatoires
    FOR badge_id IN SELECT id FROM badges ORDER BY random() LIMIT floor(random() * 3) LOOP
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (user_id, badge_id)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
