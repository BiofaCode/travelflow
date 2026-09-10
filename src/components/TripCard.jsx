// "2027-03-10" -> "10/03/2027"
function formatDate(iso) {
  const [annee, mois, jour] = iso.split("-");
  return `${jour}/${mois}/${annee}`;
}

export default function TripCard({ trip }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
      <h3 className="font-bold text-lg text-gray-800">{trip.titre}</h3>
      <p className="text-gray-500 text-sm">
        {formatDate(trip.dateDebut)} → {formatDate(trip.dateFin)}
      </p>
      <p className="text-blue-600 font-semibold mt-2">{trip.budgetTotal} CHF</p>
    </div>
  );
}
