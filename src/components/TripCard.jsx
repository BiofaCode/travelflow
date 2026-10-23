// "2027-03-10" -> "10/03/2027"
function formatDate(iso) {
  const [annee, mois, jour] = iso.split("-");
  return `${jour}/${mois}/${annee}`;
}

export default function TripCard({ trip }) {
  // trip.steps peut être undefined selon d'où vient la donnée, donc check avant
  const nbSteps = trip.steps ? trip.steps.length : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg text-slate-100">{trip.titre}</h3>
        {/* Petit badge pour indiquer le nombre d'étapes */}
        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-full">
          {nbSteps} étape{nbSteps > 1 ? "s" : ""}
        </span>
      </div>

      {/* destination optionnelle (voyages créés avant l'ajout de ce champ n'en ont pas) */}
      {trip.destination && (
        <p className="text-slate-500 text-sm">{trip.destination}</p>
      )}

      <p className="text-slate-400 text-sm mt-1">
        {formatDate(trip.date_debut)} → {formatDate(trip.date_fin)}
      </p>

      <p className="text-rose-500 font-semibold mt-2">{trip.budget_total} CHF</p>
    </div>
  );
}
