import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabaseClient";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow">
      <Link to="/" className="font-bold text-xl text-blue-600">TravelFlow</Link>
      <div className="flex gap-4 items-center">
        <Link to="/" className="text-gray-600 hover:text-blue-600">Mes voyages</Link>

        {user ? (
          <>
            <span className="text-sm text-gray-500">{user.email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-gray-600 hover:text-blue-600"
            >
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-600 hover:text-blue-600">Connexion</Link>
            <Link to="/signup" className="text-gray-600 hover:text-blue-600">Inscription</Link>
          </>
        )}
      </div>
    </nav>
  );
}
