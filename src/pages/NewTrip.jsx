import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";

export default function NewTrip() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    titre: "",
    destination: "",
    date_debut: "",
    date_fin: "",
    budget_total: "",
  });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const { error } = await supabase.from("trips").insert({
      ...form,
      budget_total: Number(form.budget_total), // les inputs renvoient toujours des strings
      user_id: user.id,
    });

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/");
  }

  return (
    <div className="max-w-sm mx-auto mt-12 bg-slate-900 p-6 rounded-xl border border-slate-800">
      <h1 className="text-xl font-bold text-slate-100 mb-4">Nouveau voyage</h1>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          name="titre"
          placeholder="Titre du voyage"
          value={form.titre}
          onChange={handleChange}
          className="bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-lg px-3 py-2"
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
          placeholder="Budget (CHF)"
          value={form.budget_total}
          onChange={handleChange}
          className="bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-lg px-3 py-2"
        />
        <button
          type="submit"
          className="bg-rose-500 text-white rounded-lg py-2 font-semibold hover:bg-rose-600 transition"
        >
          Créer
        </button>
      </form>
    </div>
  );
}
