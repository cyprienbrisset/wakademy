-- Créer une fonction pour configurer les politiques de stockage
CREATE OR REPLACE FUNCTION create_storage_policies()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Créer une politique pour permettre l'upload aux utilisateurs authentifiés
  BEGIN
    CREATE POLICY "Authenticated users can upload content" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'content' AND 
      auth.role() = 'authenticated'
    );
  EXCEPTION
    WHEN duplicate_object THEN
      NULL; -- La politique existe déjà, ne rien faire
  END;

  -- Créer une politique pour permettre la lecture publique
  BEGIN
    CREATE POLICY "Public can view content" ON storage.objects
    FOR SELECT USING (bucket_id = 'content');
  EXCEPTION
    WHEN duplicate_object THEN
      NULL; -- La politique existe déjà, ne rien faire
  END;

  -- Créer une politique pour permettre aux propriétaires de supprimer leurs fichiers
  BEGIN
    CREATE POLICY "Users can delete their own content" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'content' AND 
      auth.uid()::text = (storage.foldername(name))[1]
    );
  EXCEPTION
    WHEN duplicate_object THEN
      NULL; -- La politique existe déjà, ne rien faire
  END;

  RETURN true;
END;
$$;
