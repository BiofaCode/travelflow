import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function EditTrip() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null); // null tant que pas encore chargé
  const [error, setError] = useState("");

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
        setForm({
          titre: data.titre,
          destination: data.destination || "", // null pour les voyages créés avant ce champ
          date_debut: data.date_debut,
          date_fin: data.date_fin,
          budget_total: data.budget_total,
        });
      }
    }

    fetchTrip();
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // update au lieu d'insert : modifie la ligne existante plutôt que d'en créer une
    const { error } = await supabase
      .from("trips")
      .update({ ...form, budget_total: Number(form.budget_total) })
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    navigate(`/trips/${id}`);
  }

  if (!form) return <p className="text-slate-500 text-center mt-12">Chargement...</p>;

  return (
    <div className="max-w-sm mx-auto mt-12 bg-slate-900 p-6 rounded-xl border border-slate-800">
      <h1 className="text-xl font-bold text-slate-100 mb-4">Modifier le voyage</h1>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          name="titre"
          value={form.titre}
          onChange={handleChange}
          className="bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2"
        />
        <input
          type="text"
          name="destination"
          placeholder="Destination (ville, pays)"
          value={form.destination}
          onChange={handleChange}
          className="bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-lg px-3 py-2"
        />
        <input
          type="date"
          name="date_debut"
          value={form.date_debut}
          onChange={handleChange}
          className="bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2"
        />
        <input
          type="date"
          name="date_fin"
          value={form.date_fin}
          onChange={handleChange}
          className="bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2"
        />
        <input
          type="number"
          name="budget_total"
          value={form.budget_total}
          onChange={handleChange}
          className="bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2"
        />
        <button
          type="submit"
          className="bg-rose-500 text-white rounded-lg py-2 font-semibold hover:bg-rose-600 transition"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
}
