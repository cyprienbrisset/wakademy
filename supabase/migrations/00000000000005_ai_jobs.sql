-- Table des jobs de traitement IA
CREATE TABLE IF NOT EXISTS public.content_ai_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
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

-- Activer RLS
ALTER TABLE public.content_ai_jobs ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les jobs IA
CREATE POLICY "Les utilisateurs peuvent voir leurs propres jobs"
  ON public.content_ai_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contents
      WHERE id = content_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Les administrateurs peuvent voir tous les jobs"
  ON public.content_ai_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Les utilisateurs peuvent créer des jobs pour leurs contenus"
  ON public.content_ai_jobs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contents
      WHERE id = content_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Les administrateurs peuvent gérer tous les jobs"
  ON public.content_ai_jobs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER on_content_ai_jobs_updated
  BEFORE UPDATE ON public.content_ai_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS content_ai_jobs_content_idx ON public.content_ai_jobs(content_id);
CREATE INDEX IF NOT EXISTS content_ai_jobs_status_idx ON public.content_ai_jobs(status);
CREATE INDEX IF NOT EXISTS content_ai_jobs_job_type_idx ON public.content_ai_jobs(job_type);
CREATE INDEX IF NOT EXISTS content_ai_jobs_created_at_idx ON public.content_ai_jobs(created_at); 