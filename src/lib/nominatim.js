// géocodage gratuit via Nominatim (recherche d'OpenStreetMap), pas de clé API
// transforme un nom de lieu ("Tokyo, Japon") en coordonnées {lat, lon}
export async function geocodeDestination(destination) {
  if (!destination) return null;

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`;
  const response = await fetch(url);
  const resultats = await response.json();

  if (resultats.length === 0) return null; // aucun lieu trouvé pour ce nom

  // Nominatim renvoie lat/lon en strings, il faut les convertir
  return {
    lat: Number(resultats[0].lat),
    lon: Number(resultats[0].lon),
  };
}
