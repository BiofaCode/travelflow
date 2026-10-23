import { useState } from "react";
import { Church, ExternalLink, Landmark, LayoutGrid, MapPin, Palette, Plus, Search, Ticket, Trees, X } from "lucide-react";
import Spinner from "./Spinner";

// les filtres affichés en pilules (la catégorie vient de lib/wikipedia.js)
const CATEGORIES = [
  { id: "tous", nom: "Tous", icone: LayoutGrid },
  { id: "musee", nom: "Musées", icone: Palette },
  { id: "monument", nom: "Monuments", icone: Landmark },
  { id: "religieux", nom: "Religieux", icone: Church },
  { id: "nature", nom: "Nature", icone: Trees },
  { id: "loisirs", nom: "Loisirs", icone: Ticket },
];

// nom au singulier pour le badge sur chaque carte
const BADGES = {
  musee: { nom: "Musée", icone: Palette },
  monument: { nom: "Monument", icone: Landmark },
  religieux: { nom: "Religieux", icone: Church },
  nature: { nom: "Nature", icone: Trees },
  loisirs: { nom: "Loisirs", icone: Ticket },
};

export default function ExplorePanel({ lieux, loading, error, onAjouter, onSurvol, motCle = "", onRecherche }) {
  const [texte, setTexte] = useState(motCle);
  const [filtre, setFiltre] = useState("tous");

  // nombre de lieux par catégorie, pour les compteurs des pilules
  const compteur = { tous: lieux.length };
  for (const lieu of lieux) {
    const cat = lieu.categorie ?? "autre";
    compteur[cat] = (compteur[cat] ?? 0) + 1;
  }
  // si la catégorie choisie est vide (nouvelle recherche...), on revient sur "Tous"
  const filtreActif = compteur[filtre] ? filtre : "tous";
  const lieuxAffiches = filtreActif === "tous" ? lieux : lieux.filter((l) => l.categorie === filtreActif);

  function handleSubmit(e) {
    e.preventDefault();
    onRecherche(texte.trim());
  }

  function effacer() {
    setTexte("");
    onRecherche("");
  }

  let contenu;
  if (loading) {
    contenu = <Spinner texte="Recherche des lieux..." />;
  } else if (error) {
    contenu = <p className="text-sm text-red-400 py-6">{error}</p>;
  } else if (lieux.length === 0) {
    contenu = (
      <p className="text-sm text-slate-500 italic py-6">
        {motCle ? `Aucun résultat pour « ${motCle} » autour de la destination.` : "Aucun lieu trouvé autour de la destination."}
      </p>
    );
  } else {
    contenu = (
      <>
        {/* filtres par catégorie (on cache celles qui n'ont aucun lieu) */}
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.filter((c) => compteur[c.id]).map((c) => {
            const Icone = c.icone;
            const estActif = filtreActif === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setFiltre(c.id)}
                aria-pressed={estActif}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  estActif
                    ? "border-rose-500 bg-rose-500 text-white shadow-md shadow-rose-500/25"
                    : "border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-600 hover:text-slate-100"
                }`}
              >
                <Icone size={14} />
                {c.nom}
                <span className={estActif ? "text-white/80" : "text-slate-500"}>{compteur[c.id]}</span>
              </button>
            );
          })}
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lieuxAffiches.map((lieu) => {
            const badge = BADGES[lieu.categorie];
            const IconeBadge = badge?.icone;
            return (
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  {badge && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-950/70 px-2.5 py-1 text-[11px] font-semibold text-slate-100 backdrop-blur-sm">
                      <IconeBadge size={12} className="text-rose-400" />
                      {badge.nom}
                    </span>
                  )}
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
            );
          })}
        </ul>
      </>
    );
  }

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h2 className="text-lg font-extrabold text-slate-50">
          {motCle ? (
            <>
              Résultats pour <span className="text-gradient">« {motCle} »</span>
            </>
          ) : (
            <>
              Lieux <span className="text-gradient">populaires</span> autour
            </>
          )}
        </h2>
        <span className="pill shrink-0">Wikipédia</span>
      </div>

      {/* barre de recherche, seulement si le parent sait gérer la recherche */}
      {onRecherche && (
        <form onSubmit={handleSubmit} role="search" className="relative mb-4">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="search"
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            placeholder="Chercher une activité : musée, plage, voiture…"
            aria-label="Chercher une activité"
            className="input rounded-full pl-10 pr-28 [&::-webkit-search-cancel-button]:hidden"
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {(texte || motCle) && (
              <button
                type="button"
                onClick={effacer}
                aria-label="Effacer la recherche"
                className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
              >
                <X size={14} />
              </button>
            )}
            <button type="submit" className="btn-primary px-4 py-1.5 text-xs">
              Chercher
            </button>
          </div>
        </form>
      )}

      {contenu}
    </section>
  );
}
