import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Hourglass, MapPin } from "lucide-react";
import ImageFondu from "./ImageFondu";
import { usePhotoDestination } from "../hooks/usePhotoDestination";
import { compteARebours, formatDate } from "../lib/dates";

// grand bandeau en haut du dashboard : le prochain voyage (ou celui en cours)
// avec la photo de la destination, pour l'ouvrir en un clic
export default function ProchainVoyage({ trip }) {
  const { url } = usePhotoDestination(trip.destination);

  return (
    <Link
      to={`/trips/${trip.id}`}
      className="group relative block h-60 overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-fuchsia-500 to-violet-600 shadow-xl shadow-black/20 sm:h-72"
    >
      {url && <ImageFondu key={url} src={url} className="transition-transform duration-700 group-hover:scale-105" />}
      {/* voile sombre à gauche et en bas : le texte reste lisible */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent sm:bg-gradient-to-r sm:from-black/75 sm:via-black/30" />

      <div className="relative flex h-full flex-col justify-end p-5 sm:max-w-xl sm:p-8">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          <Hourglass size={13} />
          {compteARebours(trip.date_debut, trip.date_fin)}
        </span>
        <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-4xl">{trip.titre}</h2>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
          {trip.destination && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} />
              {trip.destination}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={14} />
            {formatDate(trip.date_debut)} → {formatDate(trip.date_fin)}
          </span>
        </p>
        <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-black transition group-hover:gap-2.5">
          Ouvrir le voyage <ArrowRight size={16} />
        </span>
      </div>

      {url && (
        <p className="absolute right-3 top-3 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white/80 backdrop-blur-sm">
          Photo : Wikipédia
        </p>
      )}
    </Link>
  );
}
