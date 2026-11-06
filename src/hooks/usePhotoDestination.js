import { useEffect, useState } from "react";
import { photoDestination } from "../lib/wikipedia";

// photo Wikipédia d'une destination (voir photoDestination dans lib/wikipedia.js)
// utilisé par la couverture d'un voyage, les cartes du dashboard et l'accueil
// renvoie { url, fini } :
// - url : l'adresse de la photo, ou null (pas trouvée / pas encore)
// - fini : la recherche est terminée pour CETTE destination
export function usePhotoDestination(destination) {
  // on garde pour quelle destination est la photo, pour ne pas montrer
  // celle d'avant pendant qu'on cherche la nouvelle
  const [photo, setPhoto] = useState({ destination: "", url: null });

  useEffect(() => {
    if (!destination) return;
    let annule = false;
    photoDestination(destination)
      .then((url) => {
        if (!annule) setPhoto({ destination, url });
      })
      .catch(() => {
        if (!annule) setPhoto({ destination, url: null });
      });
    return () => {
      annule = true;
    };
  }, [destination]);

  const fini = Boolean(destination) && photo.destination === destination;
  return { url: fini ? photo.url : null, fini };
}
