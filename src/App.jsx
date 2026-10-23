// Importations des pages et des routes
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import TripDetail from "./pages/TripDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NewTrip from "./pages/NewTrip";
import EditTrip from "./pages/EditTrip";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <main className="p-6 max-w-5xl mx-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trips/:id" element={<TripDetail />} />
          <Route path="/trips/new" element={<NewTrip />} />
          <Route path="/trips/:id/edit" element={<EditTrip />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* route "*" = tout le reste, sert de 404 */}
          <Route path="*" element={<p className="text-slate-400">Page introuvable.</p>} />
        </Routes>
      </main>
    </div>
  );
}
