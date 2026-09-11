import { useState } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import TripDetail from "./pages/TripDetail";
import { trips } from "./data/trips";

export default function App() {
  // selectedTripId vaut null au début (donc on affiche le Dashboard)
  // S'il vaut 1, 2, etc., on affichera le détail de ce voyage
  const [selectedTripId, setSelectedTripId] = useState(null);

  // On retrouve l'objet voyage complet qui correspond à l'id sélectionné
  const voyageSelectionne = trips.find((t) => t.id === selectedTripId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="p-6 max-w-5xl mx-auto">
        {selectedTripId === null ? (
          // VUE 1 : Tous les voyages
          <Dashboard onSelectTrip={(id) => setSelectedTripId(id)} />
        ) : (
          // VUE 2 : Détail du voyage sélectionné
          <div>
            <button
              onClick={() => setSelectedTripId(null)}
              className="mb-4 inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
            >
              ← Retour à la liste des voyages
            </button>

            {voyageSelectionne && <TripDetail trip={voyageSelectionne} />}
          </div>
        )}
      </main>
    </div>
  );
}