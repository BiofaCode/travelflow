import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, Plus, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabaseClient";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

// style des liens en pilule (actif = fond un peu plus clair)
// slate-50 plutôt que white : il s'inverse en mode clair (voir index.css)
function classeLien({ isActive }) {
  return `px-4 py-2 rounded-full text-sm font-semibold transition ${
    isActive
      ? "bg-slate-800/80 text-slate-50"
      : "text-slate-400 hover:text-slate-50 hover:bg-slate-800/50"
  }`;
}

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOuvert, setMenuOuvert] = useState(false);

  function fermerMenu() {
    setMenuOuvert(false);
  }

  async function handleLogout() {
    setMenuOuvert(false);
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <nav className="print:hidden sticky top-0 z-[1100] bg-slate-950/80 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link to="/" onClick={fermerMenu} className="shrink-0" aria-label="TravelFlow, accueil">
          <Logo />
        </Link>

        {/* liens au centre (desktop) */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={classeLien}>
            {user ? "Mes voyages" : "Accueil"}
          </NavLink>
          {user && (
            <NavLink to="/trips/new" className={classeLien}>
              Nouveau voyage
            </NavLink>
          )}
        </div>

        {/* actions à droite (desktop) */}
        <div className="hidden md:flex items-center gap-2 min-w-0">
          <ThemeToggle />
          {user ? (
            <>
              <span className="hidden lg:block text-sm text-slate-500 truncate max-w-[200px]">
                {user.email}
              </span>
              <Link to="/trips/new" className="btn-primary rounded-full px-5">
                <Plus size={18} />
                Créer
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                title="Déconnexion"
                aria-label="Déconnexion"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signup"
                className="text-sm font-semibold text-slate-400 hover:text-slate-50 px-3 py-2"
              >
                Inscription
              </Link>
              <Link to="/login" className="btn-primary rounded-full px-6">
                Connexion
              </Link>
            </>
          )}
        </div>

        {/* bouton burger (mobile) */}
        <button
          type="button"
          onClick={() => setMenuOuvert(!menuOuvert)}
          className="md:hidden p-2 rounded-full text-slate-300 hover:bg-slate-800 transition"
          aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOuvert}
          aria-controls="menu-mobile"
        >
          {menuOuvert ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* panneau déroulant mobile */}
      {menuOuvert && (
        <div id="menu-mobile" className="md:hidden border-t border-slate-800 bg-slate-950/95">
          <div className="px-4 py-4 flex flex-col gap-1">
            <ThemeToggle avecTexte />

            <NavLink to="/" end onClick={fermerMenu} className={classeLien}>
              {user ? "Mes voyages" : "Accueil"}
            </NavLink>

            {user ? (
              <>
                <NavLink to="/trips/new" onClick={fermerMenu} className={classeLien}>
                  Nouveau voyage
                </NavLink>
                <p className="px-4 pt-3 text-xs text-slate-500 truncate">{user.email}</p>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 transition text-left"
                >
                  <LogOut size={16} />
                  Déconnexion
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-3">
                <Link to="/login" onClick={fermerMenu} className="btn-primary rounded-full">
                  Connexion
                </Link>
                <Link to="/signup" onClick={fermerMenu} className="btn-secondary rounded-full">
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
