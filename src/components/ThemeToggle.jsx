import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

// bouton soleil/lune pour passer du mode sombre au mode clair
// avecTexte : version du menu mobile, avec le libellé à côté de l'icône
export default function ThemeToggle({ avecTexte = false }) {
  const { theme, basculerTheme } = useTheme();
  const clair = theme === "light";
  const libelle = clair ? "Passer en mode sombre" : "Passer en mode clair";
  const Icone = clair ? Moon : Sun;

  if (avecTexte) {
    return (
      <button
        type="button"
        onClick={basculerTheme}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-slate-400 hover:text-slate-50 hover:bg-slate-800/50 transition text-left"
      >
        <Icone size={16} aria-hidden="true" />
        {clair ? "Mode sombre" : "Mode clair"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={basculerTheme}
      className="p-2 rounded-full text-slate-400 hover:text-slate-50 hover:bg-slate-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
      title={libelle}
      aria-label={libelle}
    >
      <Icone size={18} aria-hidden="true" />
    </button>
  );
}
