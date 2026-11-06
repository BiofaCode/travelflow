// une couleur par jour du voyage (comme Wanderlog) : la même sur la carte,
// dans la liste des étapes et dans la barre des jours
// après 8 jours on recommence au début
const COULEURS_JOURS = [
  "#f43f5e", // rose
  "#8b5cf6", // violet
  "#0ea5e9", // bleu
  "#10b981", // vert
  "#f59e0b", // orange
  "#ec4899", // fuchsia
  "#6366f1", // indigo
  "#14b8a6", // turquoise
];

export function couleurJour(index) {
  return COULEURS_JOURS[Math.max(index, 0) % COULEURS_JOURS.length];
}
