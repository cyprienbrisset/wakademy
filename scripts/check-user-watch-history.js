#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

async function checkUserWatchHistory() {
  console.log('🔍 Vérification de la table user_watch_history...');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('❌ Variables d\'environnement manquantes');
    return;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Test 1: Vérifier l'accès à la table
    console.log('📋 Test 1: Accès à la table...');
    const { data, error } = await supabase
      .from('user_watch_history')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Erreur d\'accès:', error.message);
      console.log('   Code:', error.code);
      
      if (error.code === 'PGRST116') {
        console.log('   → La table n\'existe pas');
      } else if (error.code === '42501') {
        console.log('   → Problème de permissions');
      }
      return false;
    } else {
      console.log('✅ Table accessible');
      console.log('   Nombre de lignes:', data?.length || 0);
    }

    // Test 2: Vérifier la structure de la table
    console.log('\n📋 Test 2: Structure de la table...');
    const { data: structure, error: structureError } = await supabase
      .rpc('exec', {
        sql: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'user_watch_history' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });

    if (structureError) {
      console.log('❌ Erreur structure:', structureError.message);
    } else {
      console.log('✅ Structure de la table:');
      structure?.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    }

    // Test 3: Vérifier les politiques RLS
    console.log('\n📋 Test 3: Politiques RLS...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec', {
        sql: `
          SELECT policyname, permissive, roles, cmd, qual
          FROM pg_policies 
          WHERE tablename = 'user_watch_history';
        `
      });

    if (policiesError) {
      console.log('❌ Erreur politiques:', policiesError.message);
    } else {
      console.log('✅ Politiques RLS:');
      policies?.forEach(policy => {
        console.log(`   - ${policy.policyname}: ${policy.cmd}`);
      });
    }

    return true;

  } catch (error) {
    console.log('❌ Exception:', error.message);
    return false;
  }
}

// Test avec un utilisateur authentifié
async function testWithUser() {
  console.log('\n🔍 Test avec utilisateur authentifié...');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // Simuler une authentification (pour les tests)
    const { data, error } = await supabase
      .from('user_watch_history')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Erreur avec clé anonyme:', error.message);
      console.log('   Code:', error.code);
    } else {
      console.log('✅ Accès avec clé anonyme réussi');
    }
  } catch (error) {
    console.log('❌ Exception avec clé anonyme:', error.message);
  }
}

async function main() {
  console.log('🚀 Diagnostic de la table user_watch_history');
  console.log('===========================================\n');
  
  const serviceKeyTest = await checkUserWatchHistory();
  await testWithUser();
  
  console.log('\n📊 Résumé:');
  console.log('==========');
  console.log(serviceKeyTest ? '✅ Table accessible avec service key' : '❌ Problème avec service key');
  
  console.log('\n💡 Solutions possibles:');
  console.log('======================');
  console.log('1. Vérifier que la migration 00000000000006_user_interactions.sql a été exécutée');
  console.log('2. Vérifier les politiques RLS');
  console.log('3. Recréer la table manuellement si nécessaire');
}

main().catch(console.error); 