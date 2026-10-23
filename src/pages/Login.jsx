import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault(); // sinon le formulaire recharge la page (comportement par défaut du navigateur)
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/"); // connexion réussie -> retour au dashboard
  }

  return (
    <div className="max-w-sm mx-auto mt-12 bg-slate-900 p-6 rounded-xl border border-slate-800">
      <h1 className="text-xl font-bold text-slate-100 mb-4">Connexion</h1>

      {/* affiché seulement si error contient un message (sinon "" est falsy, rien ne s'affiche) */}
      {error && (
        <p className="text-red-400 text-sm mb-3">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* value + onChange = input contrôlé, React garde la valeur dans le state */}
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
          Se connecter
        </button>
      </form>
    </div>
  );
}
