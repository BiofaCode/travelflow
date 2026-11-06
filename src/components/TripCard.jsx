import { Link } from "react-router-dom";
import { MapPin, CalendarDays, ListChecks, Users } from "lucide-react";
import BudgetBar from "./BudgetBar";
import ImageFondu from "./ImageFondu";
import { usePhotoDestination } from "../hooks/usePhotoDestination";
import { formatDate, nombreDeJours, aujourdhui } from "../lib/dates";
import { formatCHF } from "../lib/format";

// si on n'a pas de photo : une couleur par voyage, choisie avec l'id
// pour qu'elle reste toujours la même
const DEGRADES = [
  "from-rose-500 via-pink-500 to-orange-400",
  "from-violet-600 via-fuchsia-500 to-rose-500",
  "from-sky-500 via-indigo-500 to-violet-600",
  "from-emerald-500 via-teal-500 to-cyan-500",
  "from-amber-400 via-orange-500 to-rose-500",
  "from-blue-600 via-indigo-500 to-fuchsia-500",
];

function badgeStatut(trip) {
  const today = aujourdhui();
  if (trip.date_fin < today) {
    return { texte: "Terminé", classe: "bg-black/50 text-white/90" };
  }
  if (trip.date_debut <= today) {
    return { texte: "En cours", classe: "bg-emerald-500 text-white" };
  }
  const jours = Math.round((new Date(trip.date_debut) - new Date(today)) / 86400000);
  return {
    texte: jours === 1 ? "Demain" : `Dans ${jours} jours`,
    classe: "bg-black/50 text-white",
  };
}

// une carte de voyage du dashboard, façon Wanderlog : la photo de la
// destination en haut avec le titre dessus, les infos en dessous
export default function TripCard({ trip }) {
  const steps = trip.steps || [];
  const depense = steps.reduce((total, s) => total + (Number(s.cout) || 0), 0);
  const nbJours = nombreDeJours(trip.date_debut, trip.date_fin);
  const nbVoyageurs = trip.voyageurs || 1;
  const degrade = DEGRADES[Number(trip.id) % DEGRADES.length] || DEGRADES[0];
  const badge = badgeStatut(trip);
  const termine = trip.date_fin < aujourdhui();
  const { url } = usePhotoDestination(trip.destination);

  return (
    <Link
      to={`/trips/${trip.id}`}
      className="group card block overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-rose-500/40 hover:shadow-2xl hover:shadow-rose-500/10"
    >
      <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${degrade}`}>
        {url && (
          <ImageFondu
            key={url}
            src={url}
            // petit zoom au survol ; les voyages finis en noir et blanc
            className={`transition-transform duration-500 group-hover:scale-105 ${termine ? "grayscale" : ""}`}
          />
        )}
        {/* voile en bas pour que le titre blanc reste lisible sur n'importe quelle photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

        <span className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur ${badge.classe}`}>
          {badge.texte}
        </span>

        <div className="absolute inset-x-4 bottom-3">
          <h3 className="truncate text-lg font-extrabold text-white">{trip.titre}</h3>
          {trip.destination && (
            <p className="flex items-center gap-1 text-sm text-white/80">
              <MapPin size={13} className="shrink-0" />
              <span className="truncate">{trip.destination}</span>
            </p>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* infos sur une ligne, sans pastilles (plus léger) */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={14} className="text-slate-500" />
            {formatDate(trip.date_debut)} → {formatDate(trip.date_fin)}
            <span className="text-slate-500">· {nbJours} j</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ListChecks size={14} className="text-slate-500" />
            {steps.length} étape{steps.length > 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center gap-1.5" title="Voyageurs">
            <Users size={14} className="text-slate-500" />
            {nbVoyageurs}
          </span>
        </div>

        {Number(trip.budget_total) > 0 ? (
          <BudgetBar depense={depense} budget={Number(trip.budget_total)} />
        ) : (
          <p className="text-sm text-slate-400 mt-3">
            Dépensé : <span className="text-rose-400 font-semibold">{formatCHF(depense)}</span>
          </p>
        )}
      </div>
    </Link>
  );
}
