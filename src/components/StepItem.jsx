import { MapPin, Pencil, Trash2 } from "lucide-react";
import { formatCHF, formatHeure } from "../lib/format";

// enEdition = cette étape est ouverte dans le formulaire
export default function StepItem({ step, numero, onDelete, onEdit, enEdition = false }) {
  const geolocalisee = step.latitude != null && step.longitude != null;

  return (
    <li className="group relative flex gap-4 pb-6 last:pb-0">
      {/* ligne verticale de la timeline (cachée sur le dernier élément) */}
      <span className="absolute left-4 top-9 bottom-0 w-px bg-slate-800 group-last:hidden" />

      <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500 text-sm font-bold text-white">
        {numero}
      </span>

      <div
        className={`card flex-1 min-w-0 p-4 flex justify-between items-start gap-3 ${
          enEdition ? "border-rose-500/60 ring-1 ring-rose-500/40" : ""
        }`}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-rose-400">{formatHeure(step.heure) || "—"}</span>
            {geolocalisee && (
              <MapPin size={14} className="text-slate-500" aria-label="Placée sur la carte" />
            )}
          </div>
          <h4 className="font-semibold text-slate-100 mt-1 break-words">{step.titre}</h4>
          {/* notes pas obligatoire, on affiche que si y'en a */}
          {step.notes && (
            <p className="text-sm text-slate-400 mt-1 break-words line-clamp-3">{step.notes}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          {step.cout > 0 && (
            <span className="font-semibold text-slate-300 whitespace-nowrap text-sm">
              {formatCHF(step.cout)}
            </span>
          )}
          {/* onEdit / onDelete viennent du parent (TripDetail), StepItem ne fait qu'appeler les fonctions */}
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(step)}
                aria-label={`Modifier l'étape ${step.titre}`}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-rose-400"
              >
                <Pencil size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={() => onDelete(step.id)}
              aria-label={`Supprimer l'étape ${step.titre}`}
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
