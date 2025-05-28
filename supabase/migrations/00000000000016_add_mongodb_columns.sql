-- Ajouter les colonnes nécessaires pour l'importation MongoDB
ALTER TABLE public.contents 
ADD COLUMN IF NOT EXISTS external_id TEXT,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS curator TEXT,
ADD COLUMN IF NOT EXISTS is_topcream_content BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Créer un index unique sur external_id pour éviter les doublons
CREATE UNIQUE INDEX IF NOT EXISTS contents_external_id_unique_idx ON public.contents(external_id) WHERE external_id IS NOT NULL;

-- Index pour les performances
CREATE INDEX IF NOT EXISTS contents_is_topcream_content_idx ON public.contents(is_topcream_content) WHERE is_topcream_content = TRUE; 