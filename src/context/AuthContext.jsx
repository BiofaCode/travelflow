import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // au chargement de l'app : est-ce qu'une session existe déjà (ex: page rechargée) ?
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // écoute en continu : login, logout, inscription... déclenchent cette fonction
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // cleanup : arrête l'écoute quand le composant disparaît (évite les fuites)
    return () => listener.subscription.unsubscribe();
  }, []); // tableau vide = exécuté une seule fois, au montage

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
