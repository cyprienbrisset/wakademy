-- Table des résultats de quiz
CREATE TABLE IF NOT EXISTS public.user_quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  passed BOOLEAN DEFAULT FALSE,
  answers JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE public.user_quiz_results ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les résultats de quiz
CREATE POLICY "Les utilisateurs peuvent voir leurs propres résultats"
  ON public.user_quiz_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent créer leurs résultats"
  ON public.user_quiz_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les administrateurs peuvent voir tous les résultats"
  ON public.user_quiz_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Les administrateurs peuvent gérer tous les résultats"
  ON public.user_quiz_results FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS user_quiz_results_user_idx ON public.user_quiz_results(user_id);
CREATE INDEX IF NOT EXISTS user_quiz_results_content_idx ON public.user_quiz_results(content_id);
CREATE INDEX IF NOT EXISTS user_quiz_results_quiz_idx ON public.user_quiz_results(quiz_id);
CREATE INDEX IF NOT EXISTS user_quiz_results_passed_idx ON public.user_quiz_results(passed);
CREATE INDEX IF NOT EXISTS user_quiz_results_created_at_idx ON public.user_quiz_results(created_at);

-- Fonction pour calculer le score moyen d'un quiz
CREATE OR REPLACE FUNCTION public.get_quiz_average_score(p_quiz_id TEXT)
RETURNS TABLE (
  average_score NUMERIC,
  total_attempts BIGINT,
  pass_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    AVG(score::NUMERIC / NULLIF(max_score, 0) * 100) as average_score,
    COUNT(*) as total_attempts,
    (COUNT(*) FILTER (WHERE passed = true)::NUMERIC / NULLIF(COUNT(*), 0) * 100) as pass_rate
  FROM public.user_quiz_results
  WHERE quiz_id = p_quiz_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 