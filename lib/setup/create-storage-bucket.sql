-- Créer le bucket de stockage pour les contenus
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content',
  'content',
  true,
  52428800, -- 50MB limit
  ARRAY['video/*', 'audio/*', 'application/pdf', 'image/*', 'text/*']
)
ON CONFLICT (id) DO NOTHING;

-- Créer une politique pour permettre l'upload aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload content" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'content' AND 
  auth.role() = 'authenticated'
);

-- Créer une politique pour permettre la lecture publique
CREATE POLICY "Public can view content" ON storage.objects
FOR SELECT USING (bucket_id = 'content');

-- Créer une politique pour permettre aux propriétaires de supprimer leurs fichiers
CREATE POLICY "Users can delete their own content" ON storage.objects
FOR DELETE USING (
  bucket_id = 'content' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
