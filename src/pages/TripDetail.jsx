import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import StepItem from "../components/StepItem";

function formatDate(iso) {
  const [annee, mois, jour] = iso.split("-");
  return `${jour}/${mois}/${annee}`;
}

export default function TripDetail() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jourActif, setJourActif] = useState("");

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
          etapesDuJour.map((step) => <StepItem key={step.id} step={step} />)
        ) : (
          <p className="text-gray-400 italic text-sm">
            Aucune étape prévue pour cette journée.
          </p>
        )}
      </section>
    </div>
  );
}
