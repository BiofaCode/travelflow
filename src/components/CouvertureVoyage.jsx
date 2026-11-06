import ImageFondu from "./ImageFondu";
import { usePhotoDestination } from "../hooks/usePhotoDestination";

// grande photo en haut de la page d'un voyage (comme Wanderlog)
// photo de la ville sur Wikipédia ; sinon imageSecours (un lieu populaire du coin) ;
// sinon juste le dégradé du thème
export default function CouvertureVoyage({ destination, imageSecours }) {
  const { url, fini } = usePhotoDestination(destination);

  // tant que la recherche n'est pas finie on ne met pas l'image de secours :
  // sinon on la verrait 1 seconde avant d'être remplacée
  const src = fini ? url || imageSecours : null;

  return (
    <div className="relative h-44 sm:h-60 overflow-hidden bg-gradient-to-br from-rose-500/50 via-violet-500/40 to-slate-900">
      {src && <ImageFondu key={src} src={src} />}
      {/* voile sombre en bas : la carte du titre qui chevauche reste lisible */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
      {src && (
        <p className="absolute right-3 top-3 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white/80 backdrop-blur-sm">
          Photo : Wikipédia
        </p>
      )}
    </div>
  );
}
