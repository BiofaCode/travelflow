import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, PencilLine } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import TripForm from "../components/TripForm";
import CouvertureVoyage from "../components/CouvertureVoyage";
import Spinner from "../components/Spinner";

export default function EditTrip() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [valeurs, setValeurs] = useState(null); // null tant que pas encore chargé
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrip() {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setValeurs({
          titre: data.titre,
          destination: data.destination || "", // null pour les voyages créés avant ce champ
          date_debut: data.date_debut,
          date_fin: data.date_fin,
          budget_total: data.budget_total,
          voyageurs: data.voyageurs || 1, // 1 par défaut si la colonne est vide
        });
      }
      setLoading(false);
    }

    fetchTrip();
  }, [id]);

  async function handleSubmit(form) {
    setError("");

    // update au lieu d'insert : modifie la ligne existante plutôt que d'en créer une
    const { error } = await supabase
      .from("trips")
      .update({ ...form, budget_total: Number(form.budget_total), voyageurs: Number(form.voyageurs) || 1 })
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    navigate(`/trips/${id}`);
  }

  if (loading) return <Spinner />;

  return (
    <div className="max-w-2xl mx-auto">
      <Link to={`/trips/${id}`} className="btn-secondary mb-5 px-4 py-2">
        <ArrowLeft size={16} /> Retour au voyage
      </Link>

      {/* même en-tête que la page du voyage : la photo, et la carte qui passe dessus.
          La photo est celle de la destination enregistrée (pas celle qu'on tape,
          sinon on chercherait une photo à chaque lettre) */}
      <div className="card overflow-hidden">
        <CouvertureVoyage destination={valeurs?.destination} />

        <div className="relative px-5 pb-5 sm:px-8 sm:pb-8">
          {/* seule l'icône passe sur la photo : le titre en dessous reste lisible
              même quand la photo est claire */}
          <span className="-mt-7 grid place-items-center w-14 h-14 rounded-2xl border-4 border-slate-900 bg-gradient-to-br from-rose-500 to-violet-500 text-white shadow-lg shadow-rose-500/30">
            <PencilLine size={22} />
          </span>
          <div className="mt-3 mb-6">
            <h1 className="section-title">
              Modifier le <span className="text-gradient">voyage</span>
            </h1>
            <p className="text-sm text-slate-400">Change les infos principales, tes étapes restent intactes.</p>
          </div>
          {valeurs ? (
            <TripForm
              valeursInitiales={valeurs}
              onSubmit={handleSubmit}
              texteBouton="Enregistrer"
              erreur={error}
            />
          ) : (
            <p className="text-red-400 text-sm">{error || "Ce voyage n'existe pas."}</p>
          )}
        </div>
      </div>
    </div>
  );
}
