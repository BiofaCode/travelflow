import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import StepItem from "../components/StepItem";
import TripMap from "../components/TripMap";
import BudgetBar from "../components/BudgetBar";
import { geocodeDestination } from "../lib/nominatim";

function formatDate(iso) {
  const [annee, mois, jour] = iso.split("-");
  return `${jour}/${mois}/${annee}`;
}

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jourActif, setJourActif] = useState("");

  const [newStep, setNewStep] = useState({
    titre: "",
    jour: "",
    heure: "",
    cout: "",
    notes: "",
    latitude: "",
    longitude: "",
  });

  const [stepError, setStepError] = useState("");
  const [centreDestination, setCentreDestination] = useState(null);

  useEffect(() => {
    async function fetchTrip() {
      const { data, error } = await supabase
        .from("trips")
        .select("*, steps(*)")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
      } else {
        setTrip(data);
        const joursDisponibles = [...new Set(data.steps.map((s) => s.jour))];
        setJourActif(joursDisponibles[0] || "");
      }
      setLoading(false);
    }

    fetchTrip();
  }, [id]);

  // géocode la destination dès qu'elle est connue (ou qu'elle change) : donne
  // un point central pour la carte même avant d'avoir des étapes géolocalisées
  useEffect(() => {
    if (!trip?.destination) return; // rien à géocoder

    geocodeDestination(trip.destination).then((resultat) => {
      if (resultat) setCentreDestination([resultat.lat, resultat.lon]);
    });
  }, [trip?.destination]);

  // utilisée après un ajout/suppression de step, pour rafraîchir la liste
  // (séparée du fetch initial ci-dessus : eslint n'aime pas qu'un useEffect
  // appelle une fonction "partagée" qui fait du setState)
  async function refreshTrip() {
    const { data, error } = await supabase
      .from("trips")
      .select("*, steps(*)")
      .eq("id", id)
      .single();

    if (!error) setTrip(data);
  }

  async function handleDelete() {
    const confirme = window.confirm("Supprimer ce voyage définitivement ?");
    if (!confirme) return;

    // les steps liées partent automatiquement (on delete cascade défini en SQL)
    const { error } = await supabase.from("trips").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/");
  }

  function handleStepChange(e) {
    setNewStep({ ...newStep, [e.target.name]: e.target.value });
  }

  async function handleAddStep(e) {
    e.preventDefault();
    setStepError("");

    const { error } = await supabase.from("steps").insert({
      ...newStep,
      cout: Number(newStep.cout), // "" -> 0 automatiquement avec Number()
      // vide -> null plutôt que 0 : (0,0) est un vrai point sur Terre (dans l'Atlantique)
      latitude: newStep.latitude ? Number(newStep.latitude) : null,
      longitude: newStep.longitude ? Number(newStep.longitude) : null,
      trip_id: id,
    });

    if (error) {
      setStepError(error.message);
      return;
    }

    await refreshTrip();
    setJourActif(newStep.jour); // pour voir tout de suite l'étape qu'on vient d'ajouter
    setNewStep({ titre: "", jour: "", heure: "", cout: "", notes: "", latitude: "", longitude: "" });
  }

  async function handleDeleteStep(stepId) {
    const confirme = window.confirm("Supprimer cette étape ?");
    if (!confirme) return;

    const { error } = await supabase.from("steps").delete().eq("id", stepId);

    if (error) {
      alert(error.message);
      return;
    }

    await refreshTrip();
  }

  if (loading) return <p className="text-slate-500 text-center mt-12">Chargement...</p>;

  if (!trip) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <p className="text-slate-500">Ce voyage n'existe pas.</p>
        <Link to="/" className="text-rose-400 hover:underline">
          ← Retour à la liste des voyages
        </Link>
      </div>
    );
  }

  const joursDisponibles = [...new Set(trip.steps.map((s) => s.jour))];
  const etapesDuJour = trip.steps.filter((s) => s.jour === jourActif);
  const totalDepense = trip.steps.reduce((somme, step) => somme + step.cout, 0);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link
        to="/"
        className="mb-4 inline-flex items-center text-sm font-semibold text-rose-400 hover:text-rose-300 transition"
      >
        ← Retour à la liste des voyages
      </Link>

      <header className="mb-6 mt-4 bg-slate-900 p-6 rounded-xl border border-slate-800">
        <h1 className="text-2xl font-bold text-slate-100">{trip.titre}</h1>
        {trip.destination && (
          <p className="text-slate-500 text-sm">{trip.destination}</p>
        )}
        <p className="text-slate-400 text-sm mt-1">
          {formatDate(trip.date_debut)} → {formatDate(trip.date_fin)}
        </p>
        <p className="text-rose-500 font-semibold text-lg mt-2">
          Budget total : {trip.budget_total} CHF
        </p>
        <BudgetBar depense={totalDepense} budget={trip.budget_total} />
        <Link
          to={`/trips/${id}/edit`}
          className="text-rose-400 text-sm font-semibold mt-3 mr-4 hover:underline"
        >
          Modifier
        </Link>
        <button
          onClick={handleDelete}
          className="text-red-400 text-sm font-semibold mt-3 hover:underline"
        >
          Supprimer ce voyage
        </button>
      </header>

      <div className="mb-6">
        <TripMap steps={trip.steps} centreDestination={centreDestination} />
      </div>

      <nav className="flex gap-2 border-b border-slate-800 pb-2 mb-6 overflow-x-auto">
        {joursDisponibles.map((jour, index) => {
          const estActif = jour === jourActif;
          return (
            <button
              key={jour}
              onClick={() => setJourActif(jour)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                estActif
                  ? "bg-rose-500 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              Jour {index + 1} ({formatDate(jour)})
            </button>
          );
        })}
      </nav>

      <section className="space-y-3">
        {etapesDuJour.length > 0 ? (
          etapesDuJour.map((step) => (
            <StepItem key={step.id} step={step} onDelete={handleDeleteStep} />
          ))
        ) : (
          <p className="text-slate-500 italic text-sm">
            Aucune étape prévue pour cette journée.
          </p>
        )}
      </section>

      <div className="mt-6 bg-slate-900 p-4 rounded-lg border border-slate-800">
        <h3 className="font-semibold text-slate-100 mb-3">Ajouter une étape</h3>

        {stepError && <p className="text-red-400 text-sm mb-3">{stepError}</p>}

        <form onSubmit={handleAddStep} className="flex flex-col gap-2">
          <input
            type="text"
            name="titre"
            placeholder="Titre de l'étape"
            value={newStep.titre}
            onChange={handleStepChange}
            required
            className="bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-lg px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <input
              type="date"
              name="jour"
              min={trip.date_debut}
              max={trip.date_fin}
              value={newStep.jour}
              onChange={handleStepChange}
              required
              className="bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-lg px-3 py-2 text-sm flex-1"
            />
            <input
              type="time"
              name="heure"
              value={newStep.heure}
              onChange={handleStepChange}
              className="bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-lg px-3 py-2 text-sm flex-1"
            />
          </div>
          <input
            type="number"
            name="cout"
            placeholder="Coût (CHF)"
            value={newStep.cout}
            onChange={handleStepChange}
            className="bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-lg px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <input
              type="number"
              step="any"
              name="latitude"
              placeholder="Latitude (optionnel)"
              value={newStep.latitude}
              onChange={handleStepChange}
              className="bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-lg px-3 py-2 text-sm flex-1"
            />
            <input
              type="number"
              step="any"
              name="longitude"
              placeholder="Longitude (optionnel)"
              value={newStep.longitude}
              onChange={handleStepChange}
              className="bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-lg px-3 py-2 text-sm flex-1"
            />
          </div>
          <textarea
            name="notes"
            placeholder="Notes (optionnel)"
            value={newStep.notes}
            onChange={handleStepChange}
            className="bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="bg-rose-500 text-white text-sm font-semibold rounded-lg py-2 hover:bg-rose-600 transition"
          >
            Ajouter l'étape
          </button>
        </form>
      </div>
    </div>
  );
}
