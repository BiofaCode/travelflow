import { useId, useState } from "react";
import { MapPin, CalendarDays, UserPlus, ArrowRight } from "lucide-react";
import DestinationInput from "./DestinationInput";
import VoyageursInput from "./VoyageursInput";

// grande barre en pilule (accueil + page Nouveau voyage)
// valeursInitiales peut être partiel, ex : { destination: "Rome" }
// pour changer les valeurs depuis l'extérieur, le parent change la "key"
export default function TripSearchBar({ valeursInitiales, onSubmit, texteBouton = "Créer", enCours = false }) {
  const id = useId();
  const [destination, setDestination] = useState(valeursInitiales?.destination || "");
  const [debut, setDebut] = useState(valeursInitiales?.debut || "");
  const [fin, setFin] = useState(valeursInitiales?.fin || "");
  const [voyageurs, setVoyageurs] = useState(Number(valeursInitiales?.voyageurs) || 1);
  const [erreur, setErreur] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!destination.trim()) {
      setErreur("Indique une destination.");
      return;
    }
    if (!debut || !fin) {
      setErreur("Choisis les dates de début et de fin.");
      return;
    }
    // les dates "AAAA-MM-JJ" se comparent bien en tant que strings
    if (fin < debut) {
      setErreur("La date de fin doit être après la date de début.");
      return;
    }

    setErreur("");
    onSubmit({ destination: destination.trim(), debut, fin, voyageurs });
  }

  // style commun des petits titres de zone
  const titreZone = "text-xs font-bold text-slate-200";
  const champDate =
    "w-full min-w-0 bg-transparent text-sm text-slate-100 focus:outline-none";

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-0 bg-slate-900 border border-slate-800 rounded-3xl lg:rounded-full p-3 lg:p-2 shadow-xl shadow-black/30"
      >
        {/* destination */}
        <div className="flex items-center gap-3 flex-1 min-w-0 px-3 lg:px-5 py-2 rounded-2xl lg:rounded-full hover:bg-slate-800/50 transition">
          <MapPin size={20} className="text-rose-500 shrink-0" aria-hidden="true" />
          <div className="flex flex-col min-w-0 w-full">
            <label htmlFor={`${id}-destination`} className={titreZone}>Destination</label>
            <DestinationInput
              id={`${id}-destination`}
              value={destination}
              onChange={(texte) => setDestination(texte)}
              onSelect={(lieu) => setDestination(lieu.label)}
              placeholder="Pays ou ville"
              required
              className="w-full"
              inputClassName="w-full bg-transparent border-0 p-0 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        </div>

        <span className="hidden lg:block w-px h-10 bg-slate-800" aria-hidden="true" />
        <span className="lg:hidden h-px mx-3 bg-slate-800" aria-hidden="true" />

        {/* dates */}
        <div className="flex items-center gap-3 px-3 lg:px-5 py-2 min-w-0">
          <CalendarDays size={20} className="text-rose-500 shrink-0" aria-hidden="true" />
          <fieldset className="flex flex-col min-w-0 w-full">
            <legend className={titreZone}>Dates</legend>
            <div className="flex items-center gap-2 min-w-0">
              <input
                type="date"
                aria-label="Date de début"
                value={debut}
                onChange={(e) => setDebut(e.target.value)}
                required
                className={champDate}
              />
              <span className="text-slate-500 shrink-0" aria-hidden="true">–</span>
              <input
                type="date"
                aria-label="Date de fin"
                value={fin}
                min={debut || undefined}
                onChange={(e) => setFin(e.target.value)}
                required
                className={champDate}
              />
            </div>
          </fieldset>
        </div>

        <span className="hidden lg:block w-px h-10 bg-slate-800" aria-hidden="true" />
        <span className="lg:hidden h-px mx-3 bg-slate-800" aria-hidden="true" />

        {/* voyageurs */}
        <div className="flex items-center gap-3 px-3 lg:px-5 py-2 min-w-0">
          <UserPlus size={20} className="text-rose-500 shrink-0" aria-hidden="true" />
          <div className="flex flex-col min-w-0">
            <label htmlFor={`${id}-voyageurs`} className={titreZone}>Voyageurs</label>
            <VoyageursInput id={`${id}-voyageurs`} value={voyageurs} onChange={setVoyageurs} />
          </div>
        </div>

        <button
          type="submit"
          disabled={enCours}
          className="btn-primary w-full lg:w-auto mt-2 lg:mt-0 lg:ml-2 rounded-full px-7 py-3.5 text-base shrink-0"
        >
          {enCours ? "Création..." : texteBouton}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </form>

      {erreur && (
        <p role="alert" className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {erreur}
        </p>
      )}
    </div>
  );
}
