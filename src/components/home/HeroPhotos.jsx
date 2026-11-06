import { MapPin } from "lucide-react";
import ImageFondu from "../ImageFondu";
import { usePhotoDestination } from "../../hooks/usePhotoDestination";

// une photo de destination (Wikipédia) avec son nom en bas
// sans photo (pas de réseau...) : le dégradé reste, ça ne casse rien
function Photo({ destination, nom, className, degrade }) {
  const { url } = usePhotoDestination(destination);
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${degrade} shadow-xl shadow-black/30 ${className}`}>
      {url && <ImageFondu key={url} src={url} />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-black">
        <MapPin size={12} className="text-rose-500" />
        {nom}
      </span>
    </div>
  );
}

// à droite du titre de l'accueil : 3 photos de destinations + une fausse étape
// (avant : une carte dessinée en SVG, remplacée par de vraies photos comme Wanderlog)
export default function HeroPhotos() {
  return (
    <div className="relative mx-auto grid h-[320px] w-full max-w-lg grid-cols-5 grid-rows-2 gap-3 sm:h-[400px]" aria-hidden="true">
      <Photo destination="Tokyo, Japon" nom="Tokyo" className="col-span-3 row-span-2" degrade="from-rose-500 to-violet-600" />
      <Photo destination="Rome, Italie" nom="Rome" className="col-span-2" degrade="from-amber-400 to-rose-500" />
      <Photo destination="Lisbonne, Portugal" nom="Lisbonne" className="col-span-2" degrade="from-sky-500 to-violet-600" />

      {/* petite carte "étape" posée par-dessus (au milieu à gauche, pour ne pas
          cacher le nom "Tokyo" en bas), avec l'épingle de l'app */}
      <div className="absolute left-2 top-[58%] flex items-center sm:-left-10 gap-3 rounded-2xl border border-slate-800 bg-slate-900/95 p-3 pr-5 shadow-2xl backdrop-blur">
        <span className="carte-pin carte-pin-sm" style={{ background: "#8b5cf6" }}>
          <span>2</span>
        </span>
        <div>
          <p className="text-sm font-bold text-slate-100">Fontaine de Trevi</p>
          <p className="text-xs text-slate-400">Jour 2 · 15:00 · 8 min à pied</p>
        </div>
      </div>
    </div>
  );
}
