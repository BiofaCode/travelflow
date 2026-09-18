import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/"); // connexion réussie -> retour au dashboard
  }

  //Formulaire de connexion
  return (
    <div className="max-w-sm mx-auto mt-12 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Connexion</h1>

      {/* affiché seulement si error contient un message (sinon "" est falsy, rien ne s'affiche) */}
      {error && (
        <p className="text-red-600 text-sm mb-3">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* value + onChange = input contrôlé, React garde la valeur dans le state */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-lg py-2 font-semibold hover:bg-blue-700 transition"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
}

