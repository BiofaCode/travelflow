import { useState } from "react";
import { CalendarDays, MapPin, Wallet } from "lucide-react";
import DestinationInput from "./DestinationInput";
import VoyageursInput from "./VoyageursInput";
import { nombreDeJours } from "../lib/dates";

const VIDE = { titre: "", destination: "", date_debut: "", date_fin: "", budget_total: "", voyageurs: 1 };

// petit titre de section avec une icône, pour découper le formulaire
function Section({ icone, titre, children }) {
  const Icone = icone;
  return (
    // une section toute simple (un <fieldset> dessinait la ligne au travers du titre)
    <section className="space-y-4 border-t border-slate-800 pt-5 first:border-t-0 first:pt-0">
      <h2 className="flex items-center gap-2 text-sm font-bold text-slate-100">
        <Icone size={16} className="text-rose-400" />
        {titre}
      </h2>
      {children}
    </section>
  );
}

// formulaire pour modifier un voyage (EditTrip)
// valeursInitiales peut être partiel (ex : juste la destination)
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
  // durée affichée sous les dates, seulement si elles sont dans le bon ordre
  const datesOk = form.date_debut && form.date_fin && form.date_fin >= form.date_debut;
  const nbJours = datesOk ? nombreDeJours(form.date_debut, form.date_fin) : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {messageErreur && (
        <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {messageErreur}
        </p>
      )}

      <Section icone={MapPin} titre="Le voyage">
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
      </Section>

      <Section icone={CalendarDays} titre="Les dates">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="trip-debut" className="label">Départ</label>
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
            <label htmlFor="trip-fin" className="label">Retour</label>
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
        {nbJours > 0 && (
          <p className="text-sm text-slate-400">
            {nbJours} jour{nbJours > 1 ? "s" : ""} de voyage
          </p>
        )}
      </Section>

      <Section icone={Wallet} titre="Voyageurs et budget">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="trip-voyageurs" className="label">Voyageurs</label>
            <VoyageursInput
              id="trip-voyageurs"
              value={form.voyageurs}
              onChange={(nombre) => setForm({ ...form, voyageurs: nombre })}
            />
          </div>

          <div>
            <label htmlFor="trip-budget" className="label">Budget total</label>
            {/* "CHF" collé dans le champ, à droite */}
            <div className="relative">
              <input
                id="trip-budget"
                type="number"
                name="budget_total"
                min="0"
                step="0.05"
                placeholder="0"
                value={form.budget_total}
                onChange={handleChange}
                className="input pr-14"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                CHF
              </span>
            </div>
          </div>
        </div>
      </Section>

      <button type="submit" disabled={enCours} className="btn-primary w-full">
        {enCours ? "Enregistrement..." : texteBouton}
      </button>
    </form>
  );
}
