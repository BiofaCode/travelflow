import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Spinner from "./Spinner";

// enveloppe les pages réservées aux utilisateurs connectés :
// pas connecté -> redirection vers /login
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  // tant que Supabase n'a pas répondu, on ne sait pas encore si quelqu'un est
  // connecté -> sans ça on redirigerait vers /login à chaque rechargement de page
  if (loading) return <Spinner />;

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
