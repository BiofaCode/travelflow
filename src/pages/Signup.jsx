import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Compass, MailCheck } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import AuthVisuel from "../components/AuthVisuel";

export default function Signup() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmation) {
      setError("Les deux mots de passe ne sont pas identiques.");
      return;
    }

    setEnvoi(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setEnvoi(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
  }

  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      {/* split sur grand écran : visuel à gauche, formulaire à droite */}
      <div className="card w-full max-w-md lg:max-w-5xl overflow-hidden grid lg:grid-cols-2">
        <AuthVisuel titre="Planifie ton prochain grand départ." texte="Crée tes voyages, organise chaque jour et garde un œil sur ton budget." destination="Lisbonne" />

        <div className="p-6 sm:p-10 lg:py-14">
          <div className="text-center lg:text-left mb-8">
            <span className="inline-grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-violet-500 text-white shadow-lg shadow-rose-500/30">
              <Compass size={26} />
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-50 mt-4">Créer un compte</h1>
            <p className="text-slate-400 text-sm mt-1">Et commence à planifier ton prochain voyage.</p>
          </div>

          {error && (
            <p className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-2xl px-4 py-3 mb-4">
              {error}
            </p>
          )}

          {success ? (
            <div className="text-center">
              <MailCheck className="mx-auto text-emerald-400" size={36} />
              <p className="text-slate-300 text-sm mt-3">
                Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse, puis connecte-toi.
              </p>
              <Link to="/login" className="btn-primary w-full mt-6">Aller à la connexion</Link>
            </div>
          ) : (
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
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="6 caractères minimum"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label" htmlFor="confirmation">Confirmer le mot de passe</label>
                <input
                  id="confirmation"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  className="input"
                />
              </div>
              <button type="submit" disabled={envoi} className="btn-primary w-full">
                {envoi ? "Création..." : "S'inscrire"}
              </button>
            </form>
          )}

          {!success && (
            <p className="text-center text-sm text-slate-400 mt-6">
              Déjà un compte ?{" "}
              <Link to="/login" className="text-rose-400 font-semibold hover:underline">Se connecter</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
