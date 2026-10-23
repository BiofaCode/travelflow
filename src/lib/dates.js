// tout est en UTC pour éviter les décalages d'un jour selon le fuseau horaire
// (une date "2027-03-10" sans heure est interprétée à minuit UTC)

// "2027-03-10" -> "10/03/2027"
export function formatDate(iso) {
  const [annee, mois, jour] = iso.split("-");
  return `${jour}/${mois}/${annee}`;
}

// "2027-03-10" -> "mer. 10 mars"
export function formatJourCourt(iso) {
  return new Date(iso).toLocaleDateString("fr-CH", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

// tous les jours entre debut et fin inclus, au format "AAAA-MM-JJ"
export function listerJours(debut, fin) {
  const jours = [];
  const courant = new Date(debut);
  const dernier = new Date(fin);

  // garde-fou : dates inversées ou voyage absurdement long
  while (courant <= dernier && jours.length < 90) {
    jours.push(courant.toISOString().slice(0, 10));
    courant.setUTCDate(courant.getUTCDate() + 1);
  }
  return jours;
}

export function nombreDeJours(debut, fin) {
  return listerJours(debut, fin).length;
}

// "AAAA-MM-JJ" d'aujourd'hui
export function aujourdhui() {
  return new Date().toISOString().slice(0, 10);
}
