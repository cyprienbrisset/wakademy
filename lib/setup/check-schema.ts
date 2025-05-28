import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export async function checkAndUpdateSchema() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    console.log("Checking database schema...")

    // Vérifier si la table contents existe
    const { data: tables, error: tablesError } = await supabase.rpc("exec_sql", {
      sql_query:
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contents'",
    })

    if (tablesError) {
      console.error("Error checking tables:", tablesError)
      return false
    }

    if (!tables || tables.length === 0) {
      console.log("Contents table does not exist, creating tables...")
      // Exécuter le script de création de tables
      const sqlPath = path.join(process.cwd(), 'lib', 'setup', 'create-all-tables.sql');
      const sqlContent = fs.readFileSync(sqlPath, 'utf8');
      const { error } = await supabase.rpc("exec_sql", { sql: sqlContent })

      if (error) {
        console.error("Error creating tables:", error)
        return false
      }

      console.log("Tables created successfully")
      return true
    }

    // Vérifier si la colonne thumbnail existe dans la table contents
    const { data: columns, error: columnsError } = await supabase.rpc("exec_sql", {
      sql_query:
        "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contents' AND column_name = 'thumbnail'",
    })

    if (columnsError) {
      console.error("Error checking columns:", columnsError)
      return false
    }

    if (!columns || columns.length === 0) {
      console.log("Thumbnail column does not exist, adding it...")
      // Ajouter la colonne thumbnail
      const { error: alterError } = await supabase.rpc("exec_sql", {
        sql_query: "ALTER TABLE contents ADD COLUMN IF NOT EXISTS thumbnail TEXT",
      })

      if (alterError) {
        console.error("Error adding thumbnail column:", alterError)
        return false
      }

      console.log("Thumbnail column added successfully")
    } else {
      console.log("Thumbnail column already exists")
    }

    return true
  } catch (error) {
    console.error("Error checking schema:", error)
    return false
  }
}
