import { Car, Clock, Footprints, MapPin, Pencil, Trash2 } from "lucide-react";
import { formatCHF, formatHeure } from "../lib/format";
import { formatDistance } from "../lib/distance";

// une étape du planning, façon Wanderlog : épingle numérotée (la même que sur la
// carte), carte avec le texte à gauche et la photo à droite, et en dessous le
// trajet jusqu'à l'étape suivante
// enEdition = cette étape est ouverte dans le formulaire
// image : photo du lieu si on la connaît (lieux Wikipédia), sinon rien
// trajet : { km, aPied, duree } vers l'étape suivante, ou null
// couleur : la couleur du jour (la même que l'épingle sur la carte)
export default function StepItem({ step, numero, onDelete, onEdit, enEdition = false, image = null, trajet = null, couleur = null }) {
  const geolocalisee = step.latitude != null && step.longitude != null;
  const heure = formatHeure(step.heure);

  return (
    <li className="group flex gap-3 sm:gap-4">
      {/* colonne de gauche : l'épingle + le pointillé qui descend vers la suivante */}
      <div className="flex w-8 shrink-0 flex-col items-center">
        <span
          className={`carte-pin carte-pin-sm mt-3 ${geolocalisee ? "" : "carte-pin-gris"}`}
          style={geolocalisee && couleur ? { background: couleur } : undefined}
        >
          <span>{numero}</span>
        </span>
        <span className="mt-2 w-0 flex-1 border-l-2 border-dashed border-slate-800 group-last:hidden" />
      </div>

      <div className="min-w-0 flex-1 pb-2">
        <article
          className={`card flex gap-3 overflow-hidden p-3 sm:p-4 transition hover:border-slate-700 ${
            enEdition ? "border-rose-500/60 ring-1 ring-rose-500/40" : ""
          }`}
        >
          <div className="flex min-w-0 flex-1 flex-col">
            <h4 className="font-semibold text-slate-100 break-words leading-snug">{step.titre}</h4>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
              {heure && (
                <span className="inline-flex items-center gap-1 font-semibold text-rose-400">
                  <Clock size={13} /> {heure}
                </span>
              )}
              {step.cout > 0 && <span className="font-semibold text-slate-300">{formatCHF(step.cout)}</span>}
              {!geolocalisee && (
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <MapPin size={13} /> pas sur la carte
                </span>
              )}
            </div>

            {/* notes pas obligatoire, on affiche que si y'en a */}
            {step.notes && (
              <p className="mt-2 text-sm text-slate-400 break-words line-clamp-3">{step.notes}</p>
            )}

            {/* onEdit / onDelete viennent du parent (TripDetail), StepItem ne fait qu'appeler les fonctions */}
            <div className="mt-auto flex items-center gap-1 pt-2 -ml-1.5">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(step)}
                  aria-label={`Modifier l'étape ${step.titre}`}
                  className="inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-800 hover:text-rose-400"
                >
                  <Pencil size={14} /> Modifier
                </button>
              )}
              <button
                type="button"
                onClick={() => onDelete(step.id)}
                aria-label={`Supprimer l'étape ${step.titre}`}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {image && (
            <img
              src={image}
              alt=""
              loading="lazy"
              className="h-24 w-24 shrink-0 self-start rounded-xl object-cover sm:h-28 sm:w-36"
            />
          )}
        </article>

        {/* trajet jusqu'à l'étape suivante (à vol d'oiseau, estimation) */}
        {trajet && (
          <p
            className="flex items-center gap-1.5 py-2.5 pl-1 text-xs text-slate-500"
            title="Distance à vol d'oiseau, temps estimé"
          >
            {trajet.aPied ? <Footprints size={14} /> : <Car size={14} />}
            {trajet.duree} · {formatDistance(trajet.km)}
          </p>
        )}
      </div>
    </li>
  );
}
