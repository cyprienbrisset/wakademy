-- Table des badges
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  criteria JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des badges utilisateurs
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Activer RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les badges
CREATE POLICY "Les badges sont visibles par tous"
  ON public.badges FOR SELECT
  USING (true);

CREATE POLICY "Seuls les administrateurs peuvent gérer les badges"
  ON public.badges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques RLS pour les badges utilisateurs
CREATE POLICY "Les utilisateurs peuvent voir leurs propres badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Les administrateurs peuvent gérer les badges utilisateurs"
  ON public.user_badges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS badges_title_trgm_idx ON public.badges USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS user_badges_user_idx ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS user_badges_badge_idx ON public.user_badges(badge_id);
CREATE INDEX IF NOT EXISTS user_badges_earned_at_idx ON public.user_badges(earned_at);

-- Fonction pour attribuer un badge
CREATE OR REPLACE FUNCTION public.award_badge(
  p_user_id UUID,
  p_badge_id UUID
) RETURNS UUID AS $$
DECLARE
  v_user_badge_id UUID;
BEGIN
  INSERT INTO public.user_badges (
    user_id,
    badge_id
  ) VALUES (
    p_user_id,
    p_badge_id
  ) ON CONFLICT (user_id, badge_id) DO NOTHING
  RETURNING id INTO v_user_badge_id;
  
  RETURN v_user_badge_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier les critères d'un badge
CREATE OR REPLACE FUNCTION public.check_badge_criteria(
  p_user_id UUID,
  p_badge_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_criteria JSONB;
  v_result BOOLEAN;
BEGIN
  SELECT criteria INTO v_criteria
  FROM public.badges
  WHERE id = p_badge_id;
  
  -- Logique de vérification des critères
  -- À adapter selon les besoins spécifiques
  v_result := true;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 