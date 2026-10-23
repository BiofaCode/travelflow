import { Minus, Plus } from "lucide-react";

const MIN = 1;
const MAX = 20;

// petit compteur - / + pour le nombre de voyageurs
export default function VoyageursInput({ id, value, onChange }) {
  const nombre = Number(value) || MIN;

  const boutonClasse =
    "grid place-items-center w-8 h-8 shrink-0 rounded-full border border-slate-700 text-slate-200 transition hover:border-rose-500 hover:text-rose-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-700 disabled:hover:text-slate-200";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(MIN, nombre - 1))}
        disabled={nombre <= MIN}
        aria-label="Retirer un voyageur"
        className={boutonClasse}
      >
        <Minus size={16} aria-hidden="true" />
      </button>

      {/* output : lu par les lecteurs d'écran quand le nombre change */}
      <output id={id} aria-live="polite" className="min-w-[6.5rem] text-center text-sm font-semibold text-slate-100 whitespace-nowrap">
        {nombre} voyageur{nombre > 1 ? "s" : ""}
      </output>

      <button
        type="button"
        onClick={() => onChange(Math.min(MAX, nombre + 1))}
        disabled={nombre >= MAX}
        aria-label="Ajouter un voyageur"
        className={boutonClasse}
      >
        <Plus size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
