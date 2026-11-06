// petit cache pour les appels aux APIs gratuites (Nominatim, Photon, Wikipédia) :
// si on a déjà demandé la même chose, on renvoie directement l'ancien résultat
// -> plus rapide (pas d'attente réseau) et on ne spamme pas ces APIs
//
// persistant = true : gardé aussi dans le localStorage, donc encore là après
// un rechargement de la page (utile pour le géocodage : Rome ne bouge pas)

const memoire = new Map();
const PREFIXE = "cache:";

function lireStockage(cle) {
  try {
    const texte = localStorage.getItem(PREFIXE + cle);
    return texte === null ? undefined : JSON.parse(texte);
  } catch {
    return undefined; // navigation privée, JSON cassé... on refait la requête
  }
}

function ecrireStockage(cle, valeur) {
  try {
    localStorage.setItem(PREFIXE + cle, JSON.stringify(valeur));
  } catch {
    // stockage plein ou bloqué : pas grave, juste pas mémorisé
  }
}

export async function avecCache(cle, charger, persistant = false) {
  if (memoire.has(cle)) return memoire.get(cle);

  if (persistant) {
    const sauve = lireStockage(cle);
    if (sauve !== undefined) {
      memoire.set(cle, sauve);
      return sauve;
    }
  }

  // on ne garde que les réponses réussies : si charger() plante (réseau, requête
  // annulée...), l'erreur remonte et on réessaiera la prochaine fois
  const resultat = await charger();
  memoire.set(cle, resultat);
  if (persistant) ecrireStockage(cle, resultat);
  return resultat;
}
