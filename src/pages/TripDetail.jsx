import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import StepItem from "../components/StepItem";

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
  });
  const [stepError, setStepError] = useState("");

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
      trip_id: id,
    });

    if (error) {
      setStepError(error.message);
      return;
    }

    await refreshTrip();
    setJourActif(newStep.jour); // pour voir tout de suite l'étape qu'on vient d'ajouter
    setNewStep({ titre: "", jour: "", heure: "", cout: "", notes: "" });
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

  if (loading) return <p className="text-gray-400 text-center mt-12">Chargement...</p>;

  if (!trip) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <p className="text-gray-500">Ce voyage n'existe pas.</p>
        <Link to="/" className="text-blue-600 hover:underline">
          ← Retour à la liste des voyages
        </Link>
      </div>
    );
  }

  const joursDisponibles = [...new Set(trip.steps.map((s) => s.jour))];
  const etapesDuJour = trip.steps.filter((s) => s.jour === jourActif);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link
        to="/"
        className="mb-4 inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
      >
        ← Retour à la liste des voyages
      </Link>

      <header className="mb-6 mt-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">{trip.titre}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {formatDate(trip.date_debut)} → {formatDate(trip.date_fin)}
        </p>
        <p className="text-blue-600 font-semibold text-lg mt-2">
          Budget total : {trip.budget_total} CHF
        </p>
        <Link
          to={`/trips/${id}/edit`}
          className="text-blue-600 text-sm font-semibold mt-3 mr-4 hover:underline"
        >
          Modifier
        </Link>
        <button
          onClick={handleDelete}
          className="text-red-600 text-sm font-semibold mt-3 hover:underline"
        >
          Supprimer ce voyage
        </button>
      </header>

      <nav className="flex gap-2 border-b border-gray-200 pb-2 mb-6 overflow-x-auto">
        {joursDisponibles.map((jour, index) => {
          const estActif = jour === jourActif;
          return (
            <button
              key={jour}
              onClick={() => setJourActif(jour)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                estActif
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
          <p className="text-gray-400 italic text-sm">
            Aucune étape prévue pour cette journée.
          </p>
        )}
      </section>

      <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-3">Ajouter une étape</h3>

        {stepError && <p className="text-red-600 text-sm mb-3">{stepError}</p>}

        <form onSubmit={handleAddStep} className="flex flex-col gap-2">
          <input
            type="text"
            name="titre"
            placeholder="Titre de l'étape"
            value={newStep.titre}
            onChange={handleStepChange}
            required
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
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
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1"
            />
            <input
              type="time"
              name="heure"
              value={newStep.heure}
              onChange={handleStepChange}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1"
            />
          </div>
          <input
            type="number"
            name="cout"
            placeholder="Coût (CHF)"
            value={newStep.cout}
            onChange={handleStepChange}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <textarea
            name="notes"
            placeholder="Notes (optionnel)"
            value={newStep.notes}
            onChange={handleStepChange}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white text-sm font-semibold rounded-lg py-2 hover:bg-blue-700 transition"
          >
            Ajouter l'étape
          </button>
        </form>
      </div>
    </div>
  );
}
