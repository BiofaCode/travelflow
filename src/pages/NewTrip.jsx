import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import TripSearchBar from "../components/TripSearchBar";

// quelques idées pour démarrer vite
const POPULAIRES = ["Rome", "Tokyo", "Lisbonne", "New York", "Barcelone", "Munich"];

export default function NewTrip() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");
  const [enCours, setEnCours] = useState(false);

  // pré-remplissage depuis l'URL : /trips/new?destination=Rome&debut=2027-03-10&fin=2027-03-14&voyageurs=2
  const [valeurs, setValeurs] = useState({
    destination: searchParams.get("destination") || "",
    debut: searchParams.get("debut") || "",
    fin: searchParams.get("fin") || "",
    voyageurs: Number(searchParams.get("voyageurs")) || 1,
  });
  // changer la key recrée la barre avec les nouvelles valeurs
  const [cle, setCle] = useState(0);

  function choisirDestination(ville) {
    setValeurs({ ...valeurs, destination: ville });
    setCle(cle + 1);
  }

  async function handleSubmit({ destination, debut, fin, voyageurs }) {
    setError("");
    setEnCours(true);

    // "Tokyo, Japon" -> "Tokyo"
    const ville = destination.split(",")[0].trim();

    // .select().single() pour récupérer l'id du voyage créé
    const { data, error } = await supabase
      .from("trips")
      .insert({
        titre: `Voyage à ${ville}`,
        destination,
        date_debut: debut,
        date_fin: fin,
        voyageurs,
        budget_total: 0,
        user_id: user.id,
      })
      .select()
      .single();

    setEnCours(false);

    if (error) {
      // cas fréquent : la colonne n'a pas encore été ajoutée dans Supabase
      if (error.message.includes("voyageurs")) {
        setError("Il manque la colonne voyageurs dans la base (voir la doc).");
      } else {
        setError(error.message);
      }
      return;
    }

    navigate(`/trips/${data.id}`);
  }

  return (
    <div className="max-w-5xl mx-auto pt-2 sm:pt-8 pb-10">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-rose-400 hover:text-rose-300 transition"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Retour à mes voyages
      </Link>

      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-50 leading-tight">
        Où <span className="text-gradient">pars-tu</span> ?
      </h1>
      <p className="mt-3 text-base sm:text-lg text-slate-400 max-w-xl">
        Choisis ta destination, tes dates et le nombre de voyageurs. Les étapes s'ajoutent
        ensuite depuis la page du voyage.
      </p>

      <div className="mt-8">
        <TripSearchBar
          key={cle}
          valeursInitiales={valeurs}
          onSubmit={handleSubmit}
          texteBouton="Créer"
          enCours={enCours}
        />
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <p className="mt-4 text-sm text-slate-500">
        Le titre et le budget se modifient ensuite dans « Modifier ».
      </p>

      <div className="mt-8">
        <h2 className="text-sm font-bold text-slate-300">Destinations populaires</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {POPULAIRES.map((ville) => (
            <button
              key={ville}
              type="button"
              onClick={() => choisirDestination(ville)}
              aria-pressed={valeurs.destination === ville}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                valeurs.destination === ville
                  ? "bg-rose-500 text-white border-rose-500"
                  : "border-slate-700 text-slate-300 hover:border-rose-500 hover:text-rose-400"
              }`}
            >
              {ville}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
