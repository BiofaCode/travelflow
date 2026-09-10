import { trips } from "../data/trips";
import TripCard from "../components/TripCard";

export default function Dashboard() {
  return (
    <div className="mt-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Mes voyages</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {trips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  );
}
