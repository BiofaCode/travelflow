import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, CalendarDays, ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

// barre de recherche en pilule : on prépare juste le voyage et on envoie
// les infos à /trips/new dans l'URL
export default function SearchBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [debut, setDebut] = useState("");
  const [fin, setFin] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    // pas connecté -> d'abord créer un compte
    if (!user) {
      navigate("/signup");
      return;
    }

    const params = new URLSearchParams();
    if (destination.trim()) params.set("destination", destination.trim());
    if (debut) params.set("debut", debut);
    if (fin) params.set("fin", fin);
    navigate(`/trips/new?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0 bg-slate-900 border border-slate-800 rounded-3xl md:rounded-full p-3 md:p-2 shadow-xl shadow-black/30"
    >
      {/* destination */}
      <label className="flex items-center gap-3 flex-1 min-w-0 px-3 md:px-5 py-2 rounded-2xl md:rounded-full hover:bg-slate-800/50 transition cursor-text">
        <MapPin size={20} className="text-rose-500 shrink-0" aria-hidden="true" />
        <span className="flex flex-col min-w-0 w-full">
          <span className="text-xs font-bold text-slate-200">Destination</span>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Où vas-tu ?"
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
        </span>
      </label>

      <span className="hidden md:block w-px h-10 bg-slate-800" aria-hidden="true" />

      {/* dates */}
      <div className="flex items-center gap-3 px-3 md:px-5 py-2 min-w-0">
        <CalendarDays size={20} className="text-rose-500 shrink-0" aria-hidden="true" />
        <div className="grid grid-cols-2 gap-3 min-w-0 w-full">
          <label className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-200">Départ</span>
            <input
              type="date"
              value={debut}
              onChange={(e) => setDebut(e.target.value)}
              className="w-full min-w-0 bg-transparent text-sm text-slate-100 focus:outline-none"
            />
          </label>
          <label className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-200">Retour</span>
            <input
              type="date"
              value={fin}
              min={debut || undefined}
              onChange={(e) => setFin(e.target.value)}
              className="w-full min-w-0 bg-transparent text-sm text-slate-100 focus:outline-none"
            />
          </label>
        </div>
      </div>

      <button
        type="submit"
        className="btn-primary rounded-full px-6 py-3 md:py-3.5 shrink-0"
      >
        Créer
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </form>
  );
}
