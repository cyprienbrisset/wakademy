-- Extension simple pour supporter les données MongoDB TopCream

-- Ajouter les colonnes nécessaires à la table contents existante
ALTER TABLE public.contents 
ADD COLUMN IF NOT EXISTS external_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS curator TEXT,
ADD COLUMN IF NOT EXISTS is_topcream_content BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Index pour les performances
CREATE INDEX IF NOT EXISTS contents_external_id_idx ON public.contents(external_id);
CREATE INDEX IF NOT EXISTS contents_is_topcream_content_idx ON public.contents(is_topcream_content); 