import { Link } from "react-router-dom";
import { trips } from "../data/trips";
import TripCard from "../components/TripCard";

export default function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Mes Voyages</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map((trip) => (
          <Link key={trip.id} to={`/trips/${trip.id}`}>
            <TripCard trip={trip} />
          </Link>
        ))}
      </div>
    </div>
  );
}
