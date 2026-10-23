import { useState } from "react";
import DestinationInput from "./DestinationInput";
import VoyageursInput from "./VoyageursInput";

const VIDE = { titre: "", destination: "", date_debut: "", date_fin: "", budget_total: "", voyageurs: 1 };

// formulaire commun à NewTrip et EditTrip
// valeursInitiales peut être partiel (ex : juste la destination venant de l'URL)
export default function TripForm({ valeursInitiales, onSubmit, texteBouton = "Enregistrer", erreur }) {
  const [form, setForm] = useState({ ...VIDE, ...valeursInitiales });
  const [enCours, setEnCours] = useState(false);
  const [erreurLocale, setErreurLocale] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErreurLocale("");

    // les dates "AAAA-MM-JJ" se comparent bien en tant que strings
    if (form.date_fin < form.date_debut) {
      setErreurLocale("La date de fin doit être après la date de début.");
      return;
    }
    if (Number(form.budget_total) < 0) {
      setErreurLocale("Le budget ne peut pas être négatif.");
      return;
    }

    setEnCours(true);
    await onSubmit(form);
    setEnCours(false);
  }

  const messageErreur = erreurLocale || erreur;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {messageErreur && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {messageErreur}
        </p>
      )}

      <div>
        <label htmlFor="trip-titre" className="label">Titre</label>
        <input
          id="trip-titre"
          type="text"
          name="titre"
          placeholder="Ex : Week-end à Rome"
          value={form.titre}
          onChange={handleChange}
          required
          className="input"
        />
      </div>

      <div>
        <label htmlFor="trip-destination" className="label">Destination</label>
        <DestinationInput
          id="trip-destination"
          value={form.destination}
          onChange={(texte) => setForm({ ...form, destination: texte })}
          onSelect={(lieu) => setForm({ ...form, destination: lieu.label })}
          placeholder="Ville, pays"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="trip-debut" className="label">Date de début</label>
          <input
            id="trip-debut"
            type="date"
            name="date_debut"
            value={form.date_debut}
            onChange={handleChange}
            required
            className="input"
          />
        </div>
        <div>
          <label htmlFor="trip-fin" className="label">Date de fin</label>
          <input
            id="trip-fin"
            type="date"
            name="date_fin"
            min={form.date_debut || undefined}
            value={form.date_fin}
            onChange={handleChange}
            required
            className="input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="trip-voyageurs" className="label">Voyageurs</label>
        <VoyageursInput
          id="trip-voyageurs"
          value={form.voyageurs}
          onChange={(nombre) => setForm({ ...form, voyageurs: nombre })}
        />
      </div>

      <div>
        <label htmlFor="trip-budget" className="label">Budget (CHF)</label>
        <input
          id="trip-budget"
          type="number"
          name="budget_total"
          min="0"
          step="0.05"
          placeholder="0"
          value={form.budget_total}
          onChange={handleChange}
          className="input"
        />
      </div>

      <button type="submit" disabled={enCours} className="btn-primary w-full">
        {enCours ? "Enregistrement..." : texteBouton}
      </button>
    </form>
  );
}
