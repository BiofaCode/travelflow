// "2027-03-10" -> "10/03/2027"
function formatDate(iso) {
  const [annee, mois, jour] = iso.split("-");
  return `${jour}/${mois}/${annee}`;
}

export default function TripCard({ trip }) {
  const nbSteps = trip.steps ? trip.steps.length : 0;

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg text-gray-800">{trip.titre}</h3>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
          {nbSteps} étape{nbSteps > 1 ? "s" : ""}
        </span>
      </div>

      <p className="text-gray-500 text-sm mt-1">
        {formatDate(trip.date_debut)} → {formatDate(trip.date_fin)}
      </p>

      <p className="text-blue-600 font-semibold mt-2">{trip.budget_total} CHF</p>
    </div>
  );
}