import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Plane, CalendarDays, Wallet, Luggage, Search, SearchX } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { aujourdhui, nombreDeJours } from "../lib/dates";
import { formatCHF } from "../lib/format";
import TripCard from "../components/TripCard";
import Spinner from "../components/Spinner";

// même idée que TripDetail : Leaflet n'est chargé que si la carte s'affiche
const DashboardMap = lazy(() => import("../components/DashboardMap"));

function Stat({ icone, label, valeur }) {
  const Icone = icone;
  return (
    <div className="card p-4 flex items-center gap-3">
      <span className="grid place-items-center w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
        <Icone size={20} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="font-bold text-slate-100 truncate">{valeur}</p>
      </div>
    </div>
  );
}

// tri des voyages selon le select ("date" = l'ordre de base, déjà trié par Supabase)
function trierVoyages(liste, tri) {
  const copie = [...liste]; // sort() modifie le tableau, on travaille sur une copie
  if (tri === "budget") return copie.sort((a, b) => (Number(b.budget_total) || 0) - (Number(a.budget_total) || 0));
  if (tri === "nom") return copie.sort((a, b) => a.titre.localeCompare(b.titre, "fr"));
  return copie;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [recherche, setRecherche] = useState("");
  const [tri, setTri] = useState("date");

  useEffect(() => {
    async function fetchTrips() {
      // la RLS filtre déjà sur user_id côté Supabase.
      // steps(...) = jointure, sinon trip.steps n'existe pas (d'où le 0 étape avant)
      const { data, error } = await supabase
        .from("trips")
        .select("*, steps(cout, latitude, longitude)")
        .order("date_debut");

      if (error) {
        console.error(error);
        setErreur("Impossible de charger tes voyages.");
      } else {
        setTrips(data);
      }
      setLoading(false);
    }

    fetchTrips();
  }, []);

  if (loading) return <Spinner texte="Chargement des voyages..." />;

  const today = aujourdhui();

  // recherche sur le titre ou la destination, sans tenir compte des majuscules
  const texte = recherche.trim().toLowerCase();
  const tripsFiltres = trips.filter(
    (t) => t.titre.toLowerCase().includes(texte) || (t.destination || "").toLowerCase().includes(texte)
  );

  const aVenir = trierVoyages(tripsFiltres.filter((t) => t.date_fin >= today), tri);
  // par date : les passés du plus récent au plus ancien
  const passesFiltres = tripsFiltres.filter((t) => t.date_fin < today);
  const passes = tri === "date" ? passesFiltres.reverse() : trierVoyages(passesFiltres, tri);

  const totalJours = trips.reduce((total, t) => total + nombreDeJours(t.date_debut, t.date_fin), 0);
  const totalBudget = trips.reduce((total, t) => total + (Number(t.budget_total) || 0), 0);
  const aDesPoints = trips.some((t) => (t.steps || []).some((s) => s.latitude && s.longitude));

  const prenom = user?.email?.split("@")[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Mes voyages</h1>
          <p className="text-slate-400 mt-1">
            Salut {prenom} ! Prêt pour la prochaine aventure ?
          </p>
        </div>
        <Link to="/trips/new" className="btn-primary self-start sm:self-auto">
          <Plus size={18} /> Nouveau voyage
        </Link>
      </div>

      {erreur && (
        <p className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3">
          {erreur}
        </p>
      )}

      {!erreur && trips.length === 0 && (
        <div className="card border-dashed p-10 text-center">
          <Luggage className="mx-auto text-rose-500" size={44} />
          <h2 className="text-lg font-bold text-slate-100 mt-4">Aucun voyage pour l'instant</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
            Crée ton premier voyage pour planifier tes étapes, ton budget et voir tout ça sur une carte.
          </p>
          <Link to="/trips/new" className="btn-primary mt-6">
            <Plus size={18} /> Créer mon premier voyage
          </Link>
        </div>
      )}

      {trips.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Stat icone={Plane} label="Voyages" valeur={trips.length} />
            <Stat icone={CalendarDays} label="Jours prévus" valeur={totalJours} />
            <Stat icone={Wallet} label="Budget total" valeur={formatCHF(totalBudget)} />
          </div>

          {aDesPoints && (
            <Suspense fallback={<div className="card h-[260px] sm:h-[320px]" />}>
              <DashboardMap trips={trips} />
            </Suspense>
          )}

          {/* recherche + tri */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher un voyage ou une destination..."
                aria-label="Rechercher un voyage"
                className="input pl-10"
              />
            </div>
            <select
              value={tri}
              onChange={(e) => setTri(e.target.value)}
              aria-label="Trier les voyages"
              className="input sm:w-48"
            >
              <option value="date">Trier par date</option>
              <option value="budget">Trier par budget</option>
              <option value="nom">Trier par nom</option>
            </select>
          </div>

          {tripsFiltres.length === 0 && (
            <div className="card p-8 text-center">
              <SearchX className="mx-auto text-slate-500" size={36} />
              <p className="mt-3 text-slate-300">Aucun voyage ne correspond à « {recherche.trim()} ».</p>
              <button
                type="button"
                onClick={() => setRecherche("")}
                className="mt-3 text-sm font-semibold text-rose-400 hover:text-rose-300"
              >
                Effacer la recherche
              </button>
            </div>
          )}

          {tripsFiltres.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-slate-100 mb-4">À venir et en cours</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {aVenir.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}

                <Link
                  to="/trips/new"
                  className="min-h-[200px] rounded-2xl border-2 border-dashed border-slate-800 text-slate-500 flex flex-col items-center justify-center gap-2 transition hover:border-rose-500/50 hover:text-rose-400"
                >
                  <Plus size={28} />
                  <span className="font-semibold text-sm">Créer un voyage</span>
                </Link>
              </div>
            </section>
          )}

          {passes.length > 0 && (
            <section className="opacity-60 hover:opacity-100 transition">
              <h2 className="text-lg font-bold text-slate-100 mb-4">Passés</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {passes.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
