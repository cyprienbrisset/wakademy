-- Table des organisations
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des membres des organisations
CREATE TABLE IF NOT EXISTS public.organization_members (
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (organization_id, user_id)
);

-- Activer la RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Politique RLS : un utilisateur voit les organisations dont il est membre
CREATE POLICY "Les membres peuvent voir leurs organisations" ON public.organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = id AND m.user_id = auth.uid()
    )
  );

-- Politique RLS : un utilisateur voit ses appartenances
CREATE POLICY "Les utilisateurs peuvent voir leurs appartenances" ON public.organization_members
  FOR SELECT USING (user_id = auth.uid());

-- Trigger de mise à jour de updated_at
CREATE TRIGGER on_organizations_updated
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
