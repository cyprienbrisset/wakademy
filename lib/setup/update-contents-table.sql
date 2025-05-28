-- Ajouter la colonne storage_path à la table contents si elle n'existe pas déjà
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'contents'
        AND column_name = 'storage_path'
    ) THEN
        ALTER TABLE contents ADD COLUMN storage_path TEXT;
    END IF;
END $$;

-- Mettre à jour les enregistrements existants pour définir storage_path si nécessaire
UPDATE contents
SET storage_path = 'podcasts/' || id || '.mp3'
WHERE type = 'podcast' AND storage_path IS NULL;

UPDATE contents
SET storage_path = 'videos/' || id || '.mp4'
WHERE type = 'video' AND storage_path IS NULL;

UPDATE contents
SET storage_path = 'documents/' || id || '.pdf'
WHERE type = 'document' AND storage_path IS NULL;
