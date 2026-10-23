import { lazy, Suspense } from "react";
import { Routes, Route, Link, useParams } from "react-router-dom";
import { MapPinOff } from "lucide-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import RequireAuth from "./components/RequireAuth";
import Spinner from "./components/Spinner";
import { useAuth } from "./hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NewTrip from "./pages/NewTrip";
import EditTrip from "./pages/EditTrip";

// TripDetail embarque Leaflet (lourd) : on ne le charge que quand on ouvre un voyage
const TripDetail = lazy(() => import("./pages/TripDetail"));

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
  return (
    <div className="min-h-screen flex flex-col text-slate-100 overflow-x-hidden">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
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
