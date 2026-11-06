// distance entre deux étapes "à vol d'oiseau" (en ligne droite), sans API :
// formule de haversine, la Terre vue comme une boule de 6371 km de rayon
const RAYON_TERRE_KM = 6371;

function enRadians(degres) {
  return (degres * Math.PI) / 180;
}

export function distanceKm(a, b) {
  const dLat = enRadians(b.latitude - a.latitude);
  const dLon = enRadians(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(enRadians(a.latitude)) * Math.cos(enRadians(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * RAYON_TERRE_KM * Math.asin(Math.sqrt(h));
}

// "650 m" / "4,8 km"
export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 100) * 10} m`;
  return `${km.toLocaleString("fr-CH", { maximumFractionDigits: 1 })} km`;
}

// temps estimé : à pied (~4,5 km/h) jusqu'à 2 km, sinon en voiture/transports
// (~25 km/h en ville). C'est une estimation, pas un vrai itinéraire
export function trajetEstime(km) {
  const aPied = km <= 2;
  const minutes = Math.max(1, Math.round((km / (aPied ? 4.5 : 25)) * 60));
  const duree = minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}`;
  return { aPied, duree };
}
