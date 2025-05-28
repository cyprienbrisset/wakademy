-- Corriger les politiques RLS pour éviter la récursion infinie
-- Supprimer l'ancienne politique problématique
DROP POLICY IF EXISTS "Les administrateurs peuvent modifier tous les profils" ON public.profiles;

-- Créer une nouvelle politique sans récursion pour les administrateurs
-- Utiliser une fonction pour vérifier le rôle admin de manière sécurisée
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Politique simplifiée pour les administrateurs utilisant la fonction
CREATE POLICY "Les administrateurs peuvent tout faire"
  ON public.profiles FOR ALL
  USING (public.is_admin(auth.uid()));

-- Politique pour permettre l'insertion de nouveaux profils
CREATE POLICY "Permettre l'insertion de profils"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- Politique pour permettre la lecture des profils (déjà existante mais on la recrée pour être sûr)
DROP POLICY IF EXISTS "Les profils sont visibles par tous" ON public.profiles;
CREATE POLICY "Les profils sont visibles par tous"
  ON public.profiles FOR SELECT
  USING (true);

-- Politique pour permettre aux utilisateurs de modifier leur propre profil (déjà existante mais on la recrée)
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leur propre profil" ON public.profiles;
CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id); 