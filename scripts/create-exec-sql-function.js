const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Charger les variables d'environnement depuis .env
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env')
  
  if (!fs.existsSync(envPath)) {
    throw new Error('Fichier .env non trouvé')
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const envVars = {}
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=')
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
      }
    }
  })
  
  return envVars
}

async function createExecSqlFunction() {
  try {
    console.log('🚀 Création de la fonction exec_sql sur Supabase...')
    
    // Charger les variables d'environnement
    const env = loadEnvFile()
    
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variables d\'environnement manquantes: NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requises')
    }
    
    // Créer le client Supabase avec la clé service
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // SQL pour créer la fonction exec_sql
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION public.exec_sql(sql_query TEXT)
      RETURNS TEXT AS $$
      BEGIN
        EXECUTE sql_query;
        RETURN 'SUCCESS';
      EXCEPTION
        WHEN OTHERS THEN
          RETURN 'ERROR: ' || SQLERRM;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      
      -- Accorder les privilèges nécessaires
      GRANT EXECUTE ON FUNCTION public.exec_sql TO authenticated;
      GRANT EXECUTE ON FUNCTION public.exec_sql TO service_role;
      GRANT EXECUTE ON FUNCTION public.exec_sql TO anon;
    `
    
    // Utiliser l'API REST de Supabase pour exécuter le SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        sql_query: createFunctionSQL
      })
    })
    
    if (!response.ok) {
      // Si la fonction n'existe pas encore, essayer de l'exécuter directement via l'API SQL
      console.log('⚠️ Fonction exec_sql non trouvée, tentative de création via l\'API SQL...')
      
      const sqlResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({
          query: createFunctionSQL
        })
      })
      
      if (!sqlResponse.ok) {
        console.error('❌ Impossible de créer la fonction via l\'API REST')
        console.log('\n📋 Veuillez exécuter manuellement ce SQL dans votre dashboard Supabase :')
        console.log('=' .repeat(80))
        console.log(createFunctionSQL)
        console.log('=' .repeat(80))
        return false
      }
    }
    
    // Tester la fonction
    console.log('🧪 Test de la fonction exec_sql...')
    const testResponse = await supabase.rpc('exec_sql', {
      sql_query: 'SELECT 1 as test;'
    })
    
    if (testResponse.error) {
      throw new Error(`Erreur lors du test: ${testResponse.error.message}`)
    }
    
    console.log('✅ Fonction exec_sql créée et testée avec succès!')
    return true
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la fonction exec_sql:', error.message)
    console.log('\n📋 Veuillez exécuter manuellement ce SQL dans votre dashboard Supabase :')
    console.log('=' .repeat(80))
    console.log(`
CREATE OR REPLACE FUNCTION public.exec_sql(sql_query TEXT)
RETURNS TEXT AS $$
BEGIN
  EXECUTE sql_query;
  RETURN 'SUCCESS';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'ERROR: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accorder les privilèges nécessaires
GRANT EXECUTE ON FUNCTION public.exec_sql TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql TO service_role;
GRANT EXECUTE ON FUNCTION public.exec_sql TO anon;
    `)
    console.log('=' .repeat(80))
    return false
  }
}

// Exécuter le script
if (require.main === module) {
  createExecSqlFunction()
    .then(success => {
      if (success) {
        console.log('\n🎉 La fonction exec_sql est maintenant disponible!')
        console.log('Vous pouvez maintenant utiliser la réparation des tables.')
      } else {
        console.log('\n⚠️ Veuillez créer la fonction manuellement puis réessayer.')
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('❌ Erreur fatale:', error)
      process.exit(1)
    })
}

module.exports = { createExecSqlFunction } 