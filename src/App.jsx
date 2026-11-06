import { lazy, Suspense } from "react";
import { Routes, Route, Link, useMatch, useParams } from "react-router-dom";
import { MapPinOff } from "lucide-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import RequireAuth from "./components/RequireAuth";
import Spinner from "./components/Spinner";
import { useAuth } from "./hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";

// les autres pages sont chargées seulement quand on y va : la 1re page
// (accueil ou mes voyages) s'affiche plus vite
// TripDetail surtout, il embarque Leaflet (lourd)
const TripDetail = lazy(() => import("./pages/TripDetail"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const NewTrip = lazy(() => import("./pages/NewTrip"));
const EditTrip = lazy(() => import("./pages/EditTrip"));

// "/" : connecté -> mes voyages, sinon -> page d'accueil publique
function Accueil() {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  return user ? <Dashboard /> : <Home />;
}

// key = id : en passant d'un voyage à un autre (ex. après "Dupliquer"),
// React recrée la page au lieu de garder les states de l'ancien voyage
function PageVoyage() {
  const { id } = useParams();
  return <TripDetail key={id} />;
}

function PageIntrouvable() {
  return (
    <div className="card max-w-md mx-auto mt-12 p-8 text-center">
      <MapPinOff className="mx-auto text-rose-500" size={40} />
      <h1 className="text-xl font-bold text-slate-100 mt-4">Page introuvable</h1>
      <p className="text-slate-400 text-sm mt-2">
        On dirait que tu t'es perdu en route...
      </p>
      <Link to="/" className="btn-primary mt-6">
        Retour à l'accueil
      </Link>
    </div>
  );
}

export default function App() {
  // la page d'un voyage prend toute la largeur (carte collée au bord droit,
  // comme Wanderlog) : pas de max-w ni de padding pour elle
  // (useMatch("/trips/:id") attrape aussi "/trips/new", d'où le 2e test)
  const matchVoyage = useMatch("/trips/:id");
  const matchNouveau = useMatch("/trips/new");
  const pageVoyage = matchVoyage && !matchNouveau;

  // overflow-x-clip et pas overflow-x-hidden : "hidden" casse les position: sticky
  // (navbar, carte, onglets), "clip" coupe juste ce qui dépasse
  return (
    <div className="min-h-screen flex flex-col text-slate-100 overflow-x-clip">
      <Navbar />

      <main className={pageVoyage ? "flex-1 w-full" : "flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6"}>
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/" element={<Accueil />} />
            <Route path="/trips/new" element={<RequireAuth><NewTrip /></RequireAuth>} />
            <Route path="/trips/:id" element={<RequireAuth><PageVoyage /></RequireAuth>} />
            <Route path="/trips/:id/edit" element={<RequireAuth><EditTrip /></RequireAuth>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<PageIntrouvable />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
