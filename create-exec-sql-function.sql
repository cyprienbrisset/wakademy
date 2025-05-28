-- Créer une fonction pour exécuter du SQL dynamique
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
