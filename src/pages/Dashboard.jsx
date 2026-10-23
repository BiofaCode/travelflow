import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import TripCard from "../components/TripCard";

export default function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrips() {
      // pas besoin de filtrer sur user_id ici : la RLS le fait déjà côté Supabase,
      // on ne récupère jamais que nos propres voyages
      const { data, error } = await supabase.from("trips").select("*");

      if (error) {
        console.error(error);
      } else {
        setTrips(data);
      }
      setLoading(false);
    }

    fetchTrips();
  }, []);

  if (loading) return <p className="text-slate-500">Chargement...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-100">Mes Voyages</h2>
        <Link
          to="/trips/new"
          className="bg-rose-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-rose-600 transition"
        >
          + Nouveau voyage
        </Link>
      </div>

      {trips.length === 0 ? (
        <p className="text-slate-500 italic">
          Aucun voyage pour l'instant.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Link key={trip.id} to={`/trips/${trip.id}`}>
              <TripCard trip={trip} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
