import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="print:hidden border-t border-slate-800 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo taille="sm" />
          <p className="text-sm text-slate-500 mt-2 max-w-xs">
            Prépare tes voyages étape par étape, sans te prendre la tête.
          </p>
        </div>

        <nav aria-label="Liens du pied de page" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link to="/" className="text-slate-400 hover:text-slate-50 transition">
            Accueil
          </Link>
          <Link to="/" className="text-slate-400 hover:text-slate-50 transition">
            Mes voyages
          </Link>
          <Link to="/login" className="text-slate-400 hover:text-slate-50 transition">
            Connexion
          </Link>
        </nav>

        <p className="text-xs text-slate-600">Projet scolaire – 2026</p>
      </div>
    </footer>
  );
}
