import { useEffect, useId, useState } from "react";
import {
  BedDouble,
  Church,
  Globe,
  Landmark,
  LoaderCircle,
  Map as IconeRegion,
  MapPin,
  Ticket,
  Trees,
  Utensils,
} from "lucide-react";
import { suggererDestinations } from "../lib/photon";

const ICONES = {
  ville: MapPin,
  pays: Globe,
  region: IconeRegion,
  musee: Landmark,
  monument: Landmark,
  religieux: Church,
  nature: Trees,
  loisirs: Ticket,
  resto: Utensils,
  hotel: BedDouble,
};

// champ texte avec suggestions sous le champ. Par défaut : des destinations
// (villes, pays). Avec "rechercher" on peut lui donner une autre recherche
// (ex : les lieux autour de la destination pour le titre d'une étape)
// suggestionsVides : liste montrée dès qu'on clique dans le champ, avant de taper
export default function DestinationInput({
  value,
  onChange,
  onSelect,
  rechercher = suggererDestinations,
  suggestionsVides = [],
  titreVides = "",
  className = "",
  inputClassName = "input",
  ...reste // id, placeholder, required, autoFocus, name... passés à l'input
}) {
  const listeId = useId();
  // résultat de la dernière recherche, avec le texte cherché (pour savoir s'il est à jour)
  const [resultat, setResultat] = useState({ texte: "", lieux: [], erreur: false });
  const [ouvert, setOuvert] = useState(false);
  const [actif, setActif] = useState(-1);
  // label choisi dans la liste : pas besoin de relancer une recherche dessus
  const [choisi, setChoisi] = useState(null);

  const texte = (value ?? "").trim();
  const doitChercher = ouvert && texte.length >= 2 && value !== choisi;
  const aJour = resultat.texte === texte;
  const loading = doitChercher && !aJour;
  const montrerVides = ouvert && texte.length < 2 && suggestionsVides.length > 0;

  useEffect(() => {
    if (!doitChercher || aJour) return;

    // on attend 300 ms sans frappe avant d'appeler l'API
    const controller = new AbortController();
    const timer = setTimeout(() => {
      rechercher(texte, controller.signal)
        .then((lieux) => setResultat({ texte, lieux, erreur: false }))
        .catch((err) => {
          if (err.name !== "AbortError") setResultat({ texte, lieux: [], erreur: true });
        });
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [doitChercher, aJour, texte, rechercher]);

  let lieux = [];
  if (montrerVides) lieux = suggestionsVides.slice(0, 6);
  else if (doitChercher && aJour) lieux = resultat.lieux;
  const listeVisible = montrerVides || (doitChercher && aJour);
  const indexActif = actif < lieux.length ? actif : -1;

  function choisir(lieu) {
    onChange(lieu.label);
    onSelect?.(lieu);
    setChoisi(lieu.label);
    setOuvert(false);
    setActif(-1);
  }

  function handleKeyDown(e) {
    if (!listeVisible) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActif(lieux.length ? (indexActif + 1) % lieux.length : -1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActif(lieux.length ? (indexActif <= 0 ? lieux.length - 1 : indexActif - 1) : -1);
    } else if (e.key === "Enter" && indexActif >= 0) {
      // sinon Entrée soumet le formulaire normalement
      e.preventDefault();
      choisir(lieux[indexActif]);
    } else if (e.key === "Escape") {
      setOuvert(false);
    }
  }

  return (
    <div className={`relative ${className}`}>
      <input
        {...reste}
        type="text"
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={listeVisible}
        aria-controls={listeId}
        aria-activedescendant={indexActif >= 0 ? `${listeId}-${indexActif}` : undefined}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOuvert(true);
          setActif(-1);
        }}
        onKeyDown={handleKeyDown}
        // on ouvre au clic seulement s'il y a des suggestions à montrer sans taper
        // (sinon un champ déjà rempli relancerait une recherche pour rien)
        onFocus={() => suggestionsVides.length > 0 && setOuvert(true)}
        onBlur={() => setOuvert(false)}
        className={`${inputClassName} ${loading ? "pr-10" : ""}`}
      />

      {loading && (
        <LoaderCircle
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400 pointer-events-none"
        />
      )}

      {listeVisible && (
        <ul
          id={listeId}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 z-[1200] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/95 p-1.5 shadow-xl shadow-black/30 backdrop-blur-sm"
        >
          {montrerVides && titreVides && (
            <li className="px-3 pt-1.5 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {titreVides}
            </li>
          )}
          {lieux.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-500 italic">
              {resultat.erreur ? "Recherche indisponible" : "Aucun résultat"}
            </li>
          ) : (
            lieux.map((lieu, i) => {
              const Icone = ICONES[lieu.type] ?? MapPin;
              const estActif = i === indexActif;
              return (
                <li
                  key={lieu.id}
                  id={`${listeId}-${i}`}
                  role="option"
                  aria-selected={estActif}
                  // mousedown + preventDefault : l'input ne perd pas le focus avant le clic
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choisir(lieu)}
                  onMouseEnter={() => setActif(i)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer transition ${
                    estActif ? "bg-slate-800" : ""
                  }`}
                >
                  <Icone size={16} className={estActif ? "text-rose-400" : "text-slate-500"} />
                  <span className="min-w-0 truncate text-sm">
                    <span className="font-semibold text-slate-100">{lieu.nom}</span>
                    {lieu.detail && <span className="text-slate-500"> · {lieu.detail}</span>}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
