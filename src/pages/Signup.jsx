import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
  }

  return (
    <div className="max-w-sm mx-auto mt-12 bg-slate-900 p-6 rounded-xl border border-slate-800">
      <h1 className="text-xl font-bold text-slate-100 mb-4">Inscription</h1>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      {success ? (
        <p className="text-green-400 text-sm">
          Compte créé ! Vérifie ta boîte mail pour confirmer, puis va sur la page de connexion.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-lg px-3 py-2"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-lg px-3 py-2"
          />
          <button
            type="submit"
            className="bg-rose-500 text-white rounded-lg py-2 font-semibold hover:bg-rose-600 transition"
          >
            S'inscrire
          </button>
        </form>
      )}
    </div>
  );
}
