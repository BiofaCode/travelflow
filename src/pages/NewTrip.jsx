import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import TripForm from "../components/TripForm";

export default function NewTrip() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();

  // pré-remplissage depuis l'URL : /trips/new?destination=Rome&debut=2027-03-10&fin=2027-03-14
  const valeursUrl = {
    destination: searchParams.get("destination") || "",
    date_debut: searchParams.get("debut") || "",
    date_fin: searchParams.get("fin") || "",
  };

  async function handleSubmit(form) {
    setError("");

    // .select().single() pour récupérer l'id du voyage créé
    const { data, error } = await supabase
      .from("trips")
      .insert({
        ...form,
        budget_total: Number(form.budget_total), // les inputs renvoient toujours des strings
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    navigate(`/trips/${data.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-rose-400 hover:text-rose-300 transition"
      >
        <ArrowLeft size={16} /> Retour à mes voyages
      </Link>

      <div className="card p-5 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-100 mb-1">Nouveau voyage</h1>
        <p className="text-sm text-slate-400 mb-6">Les étapes s'ajoutent ensuite depuis la page du voyage.</p>
        <TripForm valeursInitiales={valeursUrl} onSubmit={handleSubmit} texteBouton="Créer le voyage" erreur={error} />
      </div>
    </div>
  );
}
