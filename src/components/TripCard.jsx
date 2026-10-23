import { Link } from "react-router-dom";
import { MapPin, CalendarDays, ListChecks, Plane } from "lucide-react";
import BudgetBar from "./BudgetBar";
import { formatDate, nombreDeJours, aujourdhui } from "../lib/dates";
import { formatCHF } from "../lib/format";

// une couleur par voyage, choisie avec l'id pour qu'elle reste toujours la même
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
    return { texte: "Terminé", classe: "bg-slate-950/60 text-slate-300" };
  }
  if (trip.date_debut <= today) {
    return { texte: "En cours", classe: "bg-emerald-500 text-white" };
  }
  const jours = Math.round((new Date(trip.date_debut) - new Date(today)) / 86400000);
  return {
    texte: jours === 1 ? "Demain" : `Dans ${jours} jours`,
    classe: "bg-slate-950/50 text-white",
  };
}

// motif décoratif : des pointillés + un trajet d'avion en pointillé
function Motif() {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id="points-carte" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="white" fillOpacity="0.18" />
        </pattern>
      </defs>
      <rect width="300" height="140" fill="url(#points-carte)" />
      <circle cx="255" cy="20" r="46" fill="white" fillOpacity="0.1" />
      <circle cx="290" cy="120" r="30" fill="white" fillOpacity="0.08" />
      <path
        d="M20 120 C 90 40, 170 120, 250 45"
        fill="none"
        stroke="white"
        strokeOpacity="0.45"
        strokeWidth="2"
        strokeDasharray="4 6"
        strokeLinecap="round"
      />
      <circle cx="20" cy="120" r="4" fill="white" fillOpacity="0.7" />
    </svg>
  );
}

export default function TripCard({ trip }) {
  const steps = trip.steps || [];
  const depense = steps.reduce((total, s) => total + (Number(s.cout) || 0), 0);
  const nbJours = nombreDeJours(trip.date_debut, trip.date_fin);
  const degrade = DEGRADES[Number(trip.id) % DEGRADES.length] || DEGRADES[0];
  const badge = badgeStatut(trip);

  return (
    <Link
      to={`/trips/${trip.id}`}
      className="group card block overflow-hidden transition duration-300 hover:-translate-y-1.5 hover:border-rose-500/40 hover:shadow-2xl hover:shadow-rose-500/15"
    >
      <div className={`relative h-36 bg-gradient-to-br ${degrade} overflow-hidden`}>
        <Motif />
        <Plane
          size={22}
          className="absolute right-[14%] top-[26%] text-white/80 rotate-12 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
        />
        <span className="absolute left-4 -bottom-3 text-7xl font-black text-white/35 select-none leading-none">
          {trip.titre?.charAt(0).toUpperCase()}
        </span>
        <span className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur ${badge.classe}`}>
          {badge.texte}
        </span>
        {/* fondu vers le bas pour bien lier la bannière à la carte */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-900/50 to-transparent" />
      </div>

      <div className="p-5">
        <h3 className="font-extrabold text-lg text-slate-50 truncate">{trip.titre}</h3>

        {trip.destination && (
          <p className="flex items-center gap-1.5 text-slate-400 text-sm mt-0.5">
            <MapPin size={14} className="shrink-0 text-rose-400" />
            <span className="truncate">{trip.destination}</span>
          </p>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-slate-300 mt-3">
          <span className="pill">
            <CalendarDays size={13} className="text-violet-300" />
            {formatDate(trip.date_debut)} → {formatDate(trip.date_fin)}
            <span className="text-slate-500">· {nbJours} j</span>
          </span>
          <span className="pill">
            <ListChecks size={13} className="text-rose-300" />
            {steps.length} étape{steps.length > 1 ? "s" : ""}
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
