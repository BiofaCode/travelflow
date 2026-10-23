import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabaseClient";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
      <Link to="/" className="font-bold text-xl text-rose-500">TravelFlow</Link>
      <div className="flex gap-4 items-center">
        <Link to="/" className="text-slate-400 hover:text-rose-400">Mes voyages</Link>

        {user ? (
          <>
            <span className="text-sm text-slate-500">{user.email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-slate-400 hover:text-rose-400"
            >
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-slate-400 hover:text-rose-400">Connexion</Link>
            <Link to="/signup" className="text-slate-400 hover:text-rose-400">Inscription</Link>
          </>
        )}
      </div>
    </nav>
  );
}
