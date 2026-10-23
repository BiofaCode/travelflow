// 1234.5 -> "1 234.50 CHF" (séparateur de milliers suisse)
export function formatCHF(montant) {
  const nombre = Number(montant) || 0;
  return `${nombre.toLocaleString("fr-CH", { maximumFractionDigits: 2 })} CHF`;
}

// Postgres renvoie les heures en "09:30:00", on garde juste "09:30"
export function formatHeure(heure) {
  return heure ? heure.slice(0, 5) : "";
}
