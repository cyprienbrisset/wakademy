-- Table des connexions utilisateurs
CREATE TABLE IF NOT EXISTS public.user_logins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE public.user_logins ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les connexions
CREATE POLICY "Les utilisateurs peuvent voir leurs propres connexions"
  ON public.user_logins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Les administrateurs peuvent voir toutes les connexions"
  ON public.user_logins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS user_logins_user_idx ON public.user_logins(user_id);
CREATE INDEX IF NOT EXISTS user_logins_created_at_idx ON public.user_logins(created_at);

-- Fonction pour enregistrer une connexion
CREATE OR REPLACE FUNCTION public.record_user_login(
  p_user_id UUID,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_login_id UUID;
BEGIN
  INSERT INTO public.user_logins (
    user_id,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO v_login_id;
  
  RETURN v_login_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 