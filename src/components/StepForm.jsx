import { useCallback, useMemo } from "react";
import { MapPin, Plus, Save, X } from "lucide-react";
import { formatJourCourt } from "../lib/dates";
import { couleurJour } from "../lib/couleurs";
import { suggererLieuxProches } from "../lib/photon";
import DestinationInput from "./DestinationInput";

// le state du formulaire est dans TripDetail (la carte et Explorer doivent pouvoir le remplir)
// modeEdition : même formulaire pour modifier une étape existante (on peut aussi changer son jour)
// centre : point de la destination (pour chercher les lieux autour)
// lieuxPopulaires : les lieux Wikipédia, proposés dès qu'on clique dans le titre
export default function StepForm({
  step,
  onChange,
  onSubmit,
  jours,
  erreur,
  enCours,
  modeEdition = false,
  onAnnuler,
  centre = null,
  lieuxPopulaires = [],
}) {
  // useCallback : sinon une nouvelle fonction à chaque render relancerait la recherche
  const chercherLieux = useCallback(
    (texte, signal) => suggererLieuxProches(texte, centre, signal),
    [centre]
  );

  // même forme que les résultats de Photon pour la liste déroulante
  const populaires = useMemo(
    () =>
      lieuxPopulaires.map((l) => ({
        id: l.id,
        nom: l.titre,
        detail: l.description,
        type: l.categorie,
        lat: l.lat,
        lon: l.lon,
        label: l.titre,
      })),
    [lieuxPopulaires]
  );

  // lieu choisi dans la liste : titre + position sur la carte d'un coup
  function choisirLieu(lieu) {
    onChange({ ...step, titre: lieu.nom, latitude: lieu.lat, longitude: lieu.lon });
  }

  function handleChange(e) {
    onChange({ ...step, [e.target.name]: e.target.value });
  }

  function retirerPosition() {
    onChange({ ...step, latitude: "", longitude: "" });
  }

  const aDesCoordonnees = step.latitude !== "" && step.longitude !== "";
  const indexJour = jours.indexOf(step.jour);

  return (
    <form
      onSubmit={onSubmit}
      className={`card p-4 sm:p-5 space-y-4 ${modeEdition ? "border-rose-500/50" : ""}`}
    >
      {/* en-tête : le titre + le jour choisi, avec la couleur de ce jour sur la carte */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-100">
          {modeEdition ? "Modifier l'étape" : "Ajouter une étape"}
        </h3>
        {indexJour >= 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: couleurJour(indexJour) }} />
            Jour {indexJour + 1} · {formatJourCourt(step.jour)}
          </span>
        )}
      </div>

      {erreur && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {erreur}
        </p>
      )}

      <div>
        <label htmlFor="step-titre" className="label">Titre</label>
        {centre ? (
          <>
            <DestinationInput
              id="step-titre"
              name="titre"
              placeholder="Ex : Colisée, musée, pizzeria..."
              value={step.titre}
              onChange={(texte) => onChange({ ...step, titre: texte })}
              onSelect={choisirLieu}
              rechercher={chercherLieux}
              suggestionsVides={populaires}
              titreVides="Lieux populaires"
              required
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Choisis un lieu dans la liste pour le placer directement sur la carte.
            </p>
          </>
        ) : (
          <input
            id="step-titre"
            type="text"
            name="titre"
            placeholder="Ex : Visite du Colisée"
            value={step.titre}
            onChange={handleChange}
            required
            className="input"
          />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="step-jour" className="label">Jour</label>
          <select
            id="step-jour"
            name="jour"
            value={step.jour}
            onChange={handleChange}
            required
            className="input"
          >
            {jours.map((jour, index) => (
              <option key={jour} value={jour}>
                Jour {index + 1} · {formatJourCourt(jour)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="step-heure" className="label">Heure</label>
          <input
            id="step-heure"
            type="time"
            name="heure"
            value={step.heure}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="step-cout" className="label">Coût</label>
          {/* "CHF" collé dans le champ, comme le budget du voyage */}
          <div className="relative">
            <input
              id="step-cout"
              type="number"
              name="cout"
              min="0"
              step="0.05"
              placeholder="0"
              value={step.cout}
              onChange={handleChange}
              className="input pr-14"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
              CHF
            </span>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="step-notes" className="label">Notes</label>
        <textarea
          id="step-notes"
          name="notes"
          rows={3}
          placeholder="Optionnel"
          value={step.notes}
          onChange={handleChange}
          className="input resize-y"
        />
      </div>

      {/* plus de saisie lat/lon à la main : on passe par la carte ou Explorer */}
      {aDesCoordonnees ? (
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
          <MapPin size={16} className="text-rose-400 shrink-0" />
          <span>
            Position : {Number(step.latitude).toFixed(4)}, {Number(step.longitude).toFixed(4)}
          </span>
          <button
            type="button"
            onClick={retirerPosition}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
          >
            <X size={12} /> Retirer
          </button>
        </div>
      ) : (
        <p className="flex items-start gap-2 text-sm text-slate-500">
          <MapPin size={16} className="shrink-0 mt-0.5" />
          Clique sur la carte ou ajoute un lieu depuis Explorer pour le placer sur la carte (optionnel)
        </p>
      )}

      {modeEdition ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="submit" disabled={enCours} className="btn-primary w-full sm:w-auto">
            <Save size={16} />
            {enCours ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button type="button" onClick={onAnnuler} className="btn-secondary w-full sm:w-auto">
            <X size={16} /> Annuler
          </button>
        </div>
      ) : (
        <button type="submit" disabled={enCours} className="btn-primary w-full sm:w-auto">
          <Plus size={16} />
          {enCours ? "Ajout..." : "Ajouter l'étape"}
        </button>
      )}
    </form>
  );
}
