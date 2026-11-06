import ImageFondu from "./ImageFondu";
import { LogoIcone } from "./Logo";
import { usePhotoDestination } from "../hooks/usePhotoDestination";

// panneau à gauche des pages connexion / inscription (caché sur mobile)
// une grande photo de destination (Wikipédia) avec le texte par-dessus
// avant : un dégradé avec un globe dessiné en SVG
// sans photo (pas de réseau...) : il reste le dégradé, le texte est toujours lisible
export default function AuthVisuel({ titre, texte, destination }) {
  const { url } = usePhotoDestination(destination);

  return (
    <div className="relative hidden min-h-[520px] overflow-hidden bg-gradient-to-br from-rose-500 via-fuchsia-600 to-violet-700 lg:block">
      {url && <ImageFondu key={url} src={url} />}
      {/* voile : un peu de rose/violet en haut (les couleurs de l'appli), sombre en bas pour le texte */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/30 via-transparent to-violet-700/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="relative flex h-full flex-col justify-between p-10">
        <p className="flex items-center gap-2 font-bold text-white">
          <LogoIcone className="h-8 w-8" />
          TravelFlow
        </p>

        <div>
          <h2 className="text-3xl font-extrabold leading-tight text-white">{titre}</h2>
          <p className="mt-3 text-white/85">{texte}</p>
          {url && <p className="mt-6 text-xs text-white/60">Photo : Wikipédia ({destination.split(",")[0]})</p>}
        </div>
      </div>
    </div>
  );
}
