-- Table des paramètres de l'application
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les paramètres
CREATE POLICY "Les paramètres publics sont visibles par tous"
  ON public.app_settings FOR SELECT
  USING (is_public = true);

CREATE POLICY "Seuls les administrateurs peuvent gérer les paramètres"
  ON public.app_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER on_app_settings_updated
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS app_settings_key_idx ON public.app_settings(key);
CREATE INDEX IF NOT EXISTS app_settings_category_idx ON public.app_settings(category);

-- Fonction pour obtenir un paramètre
CREATE OR REPLACE FUNCTION public.get_setting(p_key TEXT)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT value
    FROM public.app_settings
    WHERE key = p_key
    AND (is_public = true OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    ))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 