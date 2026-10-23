import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import TripSearchBar from "../TripSearchBar";

// barre de l'accueil : on prépare juste le voyage et on envoie
// les infos à /trips/new dans l'URL
export default function SearchBar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  function handleSubmit({ destination, debut, fin, voyageurs }) {
    // pas connecté -> d'abord créer un compte
    if (!user) {
      navigate("/signup");
      return;
    }

    const params = new URLSearchParams({ destination, debut, fin, voyageurs: String(voyageurs) });
    navigate(`/trips/new?${params.toString()}`);
  }

  return <TripSearchBar onSubmit={handleSubmit} texteBouton="Créer" />;
}
