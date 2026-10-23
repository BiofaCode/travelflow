import { MapPin, Plus, ExternalLink } from "lucide-react";
import Spinner from "./Spinner";

export default function ExplorePanel({ lieux, loading, error, onAjouter, onSurvol }) {
  let contenu;
  if (loading) {
    contenu = <Spinner texte="Recherche des lieux..." />;
  } else if (error) {
    contenu = <p className="text-sm text-red-400 py-6">{error}</p>;
  } else if (lieux.length === 0) {
    contenu = (
      <p className="text-sm text-slate-500 italic py-6">Aucun lieu trouvé autour de la destination.</p>
    );
  } else {
    contenu = (
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {lieux.map((lieu) => (
          <li
            key={lieu.id}
            className="group card overflow-hidden flex flex-col transition duration-300 hover:-translate-y-1 hover:border-rose-500/50 hover:shadow-rose-500/10"
            onMouseEnter={() => onSurvol?.(lieu)}
            onMouseLeave={() => onSurvol?.(null)}
          >
            {/* image en 16/10 avec le titre posé sur un dégradé sombre */}
            <div className="relative aspect-[16/10] overflow-hidden">
              {lieu.image ? (
                <img
                  src={lieu.image}
                  alt={lieu.titre}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-rose-500/30 via-violet-500/20 to-slate-900">
                  <MapPin className="text-rose-300/80" size={32} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent" />
              <h3 className="absolute inset-x-0 bottom-0 p-3 font-bold text-white text-base leading-snug line-clamp-2">
                {lieu.titre}
              </h3>
            </div>

            <div className="p-3 flex flex-col gap-2 flex-1">
              {lieu.description && (
                <p className="text-xs text-slate-400 line-clamp-2">{lieu.description}</p>
              )}

              <div className="mt-auto pt-1 flex items-center justify-between gap-2">
                <a
                  href={lieu.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition"
                >
                  Wikipédia
                  <ExternalLink size={12} />
                </a>
                <button
                  type="button"
                  onClick={() => onAjouter(lieu)}
                  className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-rose-500/25 transition hover:bg-rose-600"
                >
                  <Plus size={14} />
                  Ajouter
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h2 className="text-lg font-extrabold text-slate-50">
          Lieux <span className="text-gradient">populaires</span> autour
        </h2>
        <span className="pill shrink-0">Wikipédia</span>
      </div>
      {contenu}
    </section>
  );
}
