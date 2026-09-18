import { createClient } from "@supabase/supabase-js";

// les valeurs viennent de .env.local (jamais commit, cf .gitignore)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// une seule connexion créée ici, réutilisée partout via import
export const supabase = createClient(supabaseUrl, supabaseKey);
