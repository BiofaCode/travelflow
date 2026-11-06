import { avecCache } from "./cache";

// géocodage gratuit via Nominatim (recherche d'OpenStreetMap), pas de clé API
// transforme un nom de lieu ("Tokyo, Japon") en coordonnées {lat, lon}
// résultat gardé dans le localStorage : Nominatim demande d'ailleurs de ne pas
// refaire la même requête en boucle
export async function geocodeDestination(destination) {
  if (!destination) return null;

  const nom = destination.trim().toLowerCase();
  return avecCache(`geo:${nom}`, () => chercherCoordonnees(destination), true);
}

async function chercherCoordonnees(destination) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Géocodage impossible");
  const resultats = await response.json();

  if (resultats.length === 0) return null; // aucun lieu trouvé pour ce nom

  // Nominatim renvoie lat/lon en strings, il faut les convertir
  return {
    lat: Number(resultats[0].lat),
    lon: Number(resultats[0].lon),
  };
}
