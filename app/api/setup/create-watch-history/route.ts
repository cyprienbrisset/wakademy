import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    console.log("=== Création de la table user_watch_history ===")

    // Utiliser la clé de service pour avoir les permissions d'administration
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log("Vérification de l'existence de la table...")
    
    // D'abord, vérifier si la table existe déjà
    const { error: checkError } = await supabase
      .from('user_watch_history')
      .select('*')
      .limit(1)

    if (!checkError) {
      console.log("✅ Table user_watch_history existe déjà")
      return NextResponse.json({
        success: true,
        message: "Table user_watch_history existe déjà",
        tableExists: true
      })
    }

    if (checkError.code !== 'PGRST116') {
      // Une autre erreur que "table n'existe pas"
      throw new Error(`Erreur inattendue: ${checkError.message}`)
    }

    console.log("Table n'existe pas, création en cours...")

    // Créer la table en utilisant une fonction SQL personnalisée
    // D'abord, créer une fonction qui va créer la table
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION create_user_watch_history_table()
      RETURNS TEXT AS $$
      BEGIN
        -- Créer la table user_watch_history si elle n'existe pas
        CREATE TABLE IF NOT EXISTS public.user_watch_history (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL,
          content_id UUID NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
          progress INTEGER DEFAULT 0,
          completed BOOLEAN DEFAULT FALSE,
          last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          duration INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, content_id)
        );

        -- Créer les index pour améliorer les performances
        CREATE INDEX IF NOT EXISTS idx_user_watch_history_user_id ON public.user_watch_history(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_watch_history_content_id ON public.user_watch_history(content_id);
        CREATE INDEX IF NOT EXISTS idx_user_watch_history_last_watched ON public.user_watch_history(last_watched_at DESC);

        -- Activer RLS (Row Level Security)
        ALTER TABLE public.user_watch_history ENABLE ROW LEVEL SECURITY;

        RETURN 'Table user_watch_history créée avec succès';
      END;
      $$ LANGUAGE plpgsql;
    `

    // Exécuter la fonction de création
    const { error: functionError } = await supabase.rpc('exec', { 
      sql: createFunctionSQL 
    })

    if (functionError) {
      console.log("Tentative de création directe...")
      
      // Si la fonction RPC n'existe pas, essayer une approche plus simple
      // Utiliser l'API REST pour insérer dans une table système (ne fonctionnera probablement pas)
      // Mais on peut essayer de créer la table via les migrations Supabase
      
      console.log("Création de la table via une approche alternative...")
      
      // Essayer de créer la table en utilisant une requête simple
      try {
        // Utiliser l'API Supabase pour créer la table
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!
          },
          body: JSON.stringify({
            sql: `
              CREATE TABLE IF NOT EXISTS public.user_watch_history (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL,
                content_id UUID NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
                progress INTEGER DEFAULT 0,
                completed BOOLEAN DEFAULT FALSE,
                last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                duration INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(user_id, content_id)
              );
              
              ALTER TABLE public.user_watch_history ENABLE ROW LEVEL SECURITY;
              
              CREATE POLICY "user_watch_history_policy" ON public.user_watch_history
              FOR ALL USING (true);
            `
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        console.log("✅ Table créée via API REST")
      } catch (apiError) {
        console.error("Erreur API REST:", apiError)
        
        // Dernière tentative : créer manuellement via les migrations
        console.log("Création manuelle recommandée...")
        
        return NextResponse.json({
          success: false,
          message: "Impossible de créer automatiquement la table. Veuillez exécuter la migration manuellement.",
          tableExists: false,
          manualSQL: `
            CREATE TABLE IF NOT EXISTS public.user_watch_history (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id UUID NOT NULL,
              content_id UUID NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
              progress INTEGER DEFAULT 0,
              completed BOOLEAN DEFAULT FALSE,
              last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              duration INTEGER DEFAULT 0,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              UNIQUE(user_id, content_id)
            );
            
            ALTER TABLE public.user_watch_history ENABLE ROW LEVEL SECURITY;
            CREATE POLICY "user_watch_history_policy" ON public.user_watch_history FOR ALL USING (true);
          `
        }, { status: 500 })
      }
    } else {
      // Exécuter la fonction créée
      const { error: execError } = await supabase.rpc('create_user_watch_history_table')
      
      if (execError) {
        throw new Error(`Erreur lors de l'exécution: ${execError.message}`)
      }
    }

    // Vérifier que la table a été créée
    console.log("Vérification de la création de la table...")
    const { error: finalCheckError } = await supabase
      .from('user_watch_history')
      .select('*')
      .limit(1)

    if (finalCheckError && finalCheckError.code === 'PGRST116') {
      throw new Error("Table non créée après tentative")
    }

    console.log("✅ Table user_watch_history créée avec succès")

    return NextResponse.json({
      success: true,
      message: "Table user_watch_history créée avec succès",
      tableExists: true
    })

  } catch (error) {
    console.error("Erreur lors de la création de la table:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
      tableExists: false
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    console.log("=== Vérification de la table user_watch_history ===")

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Vérifier si la table existe
    const { data, error } = await supabase
      .from('user_watch_history')
      .select('*')
      .limit(1)

    const tableExists = !error || error.code !== 'PGRST116'

    return NextResponse.json({
      tableExists,
      error: error ? error.message : null,
      message: tableExists 
        ? "Table user_watch_history existe" 
        : "Table user_watch_history n'existe pas"
    })

  } catch (error) {
    console.error("Erreur lors de la vérification:", error)
    return NextResponse.json({
      tableExists: false,
      error: error instanceof Error ? error.message : "Erreur inconnue"
    }, { status: 500 })
  }
} 