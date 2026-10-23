import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import AuthVisuel from "../components/AuthVisuel";

export default function Login() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault(); // sinon le formulaire recharge la page
    setError("");
    setEnvoi(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setEnvoi(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/");
  }

  // déjà connecté -> rien à faire ici
  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      {/* split sur grand écran : visuel à gauche, formulaire à droite */}
      <div className="card w-full max-w-md lg:max-w-5xl overflow-hidden grid lg:grid-cols-2">
        <AuthVisuel titre="Tes voyages t'attendent." texte="Retrouve tes itinéraires, tes étapes et ton budget au même endroit." />

        <div className="p-6 sm:p-10 lg:py-14">
          <div className="text-center lg:text-left mb-8">
            <span className="inline-grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-violet-500 text-white shadow-lg shadow-rose-500/30">
              <Compass size={26} />
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-50 mt-4">Bon retour !</h1>
            <p className="text-slate-400 text-sm mt-1">Connecte-toi pour retrouver tes voyages.</p>
          </div>

          {error && (
            <p className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-2xl px-4 py-3 mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="toi@exemple.ch"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
              />
            </div>
            <button type="submit" disabled={envoi} className="btn-primary w-full">
              {envoi ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Pas encore de compte ?{" "}
            <Link to="/signup" className="text-rose-400 font-semibold hover:underline">S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
