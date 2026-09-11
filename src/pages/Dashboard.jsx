import { trips } from "../data/trips";
import TripCard from "../components/TripCard";

export default function Dashboard({ onSelectTrip }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Mes Voyages</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map((trip) => (
          <div
            key={trip.id}
            onClick={() => onSelectTrip && onSelectTrip(trip.id)}
            className="cursor-pointer"
          >
            <TripCard trip={trip} />
          </div>
        ))}
      </div>
    </div>
  );
}