import { useState } from "react";
import StepItem from "../components/StepItem";

function formatDate(iso) {
  const [annee, mois, jour] = iso.split("-");
  return `${jour}/${mois}/${annee}`;
}

export default function TripDetail({ trip }) {
  // 1. On récupère la liste des dates uniques où il y a des étapes
  const joursDisponibles = [...new Set(trip.steps.map((s) => s.jour))];

  // 2. useState : "jourActif" retient le jour sélectionné (par défaut le 1er de la liste)
  const [jourActif, setJourActif] = useState(joursDisponibles[0] || "");

  // 3. On filtre les étapes pour ne garder que celles du jour sélectionné
  const etapesDuJour = trip.steps.filter((s) => s.jour === jourActif);

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* --- EN-TÊTE DU VOYAGE --- */}
      <header className="mb-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">{trip.titre}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {formatDate(trip.dateDebut)} → {formatDate(trip.dateFin)}
        </p>
        <p className="text-blue-600 font-semibold text-lg mt-2">
          Budget total : {trip.budgetTotal} CHF
        </p>
      </header>

      {/* --- BARRE D'ONGLETS --- */}
      <nav className="flex gap-2 border-b border-gray-200 pb-2 mb-6 overflow-x-auto">
        {joursDisponibles.map((jour, index) => {
          const estActif = jour === jourActif;
          return (
            <button
              key={jour}
              onClick={() => setJourActif(jour)} // Au clic, React change jourActif et réaffiche la page
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

      {/* --- LISTE DES ÉTAPES DU JOUR --- */}
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