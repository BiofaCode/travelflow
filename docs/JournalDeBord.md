# Journal de bord - TravelFlow

Ce que j'ai fait à chaque séance, en court, et ce que j'ai appris. Les
explications complètes sont dans le wiki.

## 04.09 - Départ

- Projet créé avec Vite + React.

## 10-11.09 - Tailwind, liste de voyages, router

- Tailwind v4 installé (plugin Vite + `@import "tailwindcss"`, pas besoin de
  `tailwind.config.js`).
- Dashboard avec des voyages en dur dans `data/trips.js` et un `.map` vers
  `TripCard`. Appris : la `key` obligatoire dans un `.map`, les props.
- `react-router-dom` : une URL par page, `useParams()` pour lire `:id`,
  `<Link>` au lieu de `<a>`.
- Piège : un `return` avant un `useState`. Les Hooks doivent toujours être
  appelés dans le même ordre, donc tout en haut du composant.

Wiki : Architecture

## 18.09 - Supabase et connexion

- Tables `trips` et `steps` avec RLS : chacun ne voit que ses lignes. Pour
  `steps`, la policy passe par un `exists` sur `trips`.
- Context React pour savoir qui est connecté partout (`AuthProvider`,
  `useAuth`). Premier `useEffect`.
- Pages Login et Signup, Navbar qui change selon la connexion.
- Dashboard et page d'un voyage branchés sur la vraie base
  (`select("*, steps(*)")` pour avoir les étapes en une requête).
- Pièges :
  - `permission denied for table trips` : ce n'était pas la RLS mais les
    GRANT qui manquaient (le rôle n'avait pas le droit sur la table du tout).
  - un composant doit commencer par une majuscule (`Login`, pas `login`) ;
  - la fonction d'un `useEffect` ne peut pas être `async` directement ;
  - les colonnes sont en snake_case (`date_debut`), pas comme dans mon mock.

Wiki : Base de données,
Authentification

## 25.09 - Supprimer un voyage

- `window.confirm` puis `.delete().eq("id", id)`. Les étapes partent avec
  grâce au `on delete cascade`.

## 22-23.10 - Modifier, étapes, carte, budget

- Modifier un voyage (`update` au lieu de `insert`), ajouter et supprimer
  des étapes.
- Carte Leaflet. Pièges : sans le CSS de Leaflet la carte est cassée, et
  sans hauteur le `MapContainer` fait 0 px.
- Barre de budget calculée avec `.reduce()` sur les étapes, pas de requête
  en plus.
- Piège eslint (react-hooks v7) : pas de `setState` directement dans un
  effet, seulement dans le `.then()`.
- Destination géocodée avec Nominatim, la carte se centre dessus.
- Lieux à visiter : Overpass plantait trop souvent (406, 502, timeouts), je
  suis passé à la recherche de Wikipédia (`nearcoord`).
- Grosse refonte : thème sombre, onglets Planning / Explorer / Budget, clic
  sur la carte pour placer une étape, accueil public, `RequireAuth`.
- Appris : vérifier qu'un service "gratuit" l'est vraiment (CARTO demandait
  une clé).

Wiki : Fonctionnalités,
APIs externes

## Fin octobre - Création rapide, mode clair, optimisation

- Autocomplétion de la destination avec Photon (attente de 300 ms +
  `AbortController`).
- Création en une barre : destination, dates, voyageurs.
- Mode clair : j'inverse l'échelle `slate` dans `index.css` au lieu de
  mettre des `dark:` partout.
- Suggestions de lieux dans le titre d'une étape. Piège : la fonction
  passée en prop doit être dans un `useCallback`, sinon l'effet tourne en
  boucle.
- Optimisation : build découpé, pages en `lazy()`, cache des APIs
  (`lib/cache.js`). Le fichier principal passe de 512 kB à ~50 kB.
- Logo fait à la main en SVG.

Wiki : Design et thème

## Fin octobre - Refonte façon Wanderlog (4 étapes)

1. Page d'un voyage : carte pleine hauteur à droite, photo de la ville,
   épingles numérotées, temps de trajet entre les étapes.
2. Carte : OpenFreeMap + MapLibre (gratuit, sans clé), une couleur par jour,
   fiches en popup, bouton Recentrer. Piège : le "worker" de MapLibre que
   Vite ne trouvait pas.
3. Dashboard et accueil : vraies photos sur les cartes de voyage, bandeau
   du prochain voyage, photos sur l'accueil.
4. Formulaires : tuiles photo sur Nouveau voyage, sections dans Modifier,
   photo sur connexion / inscription.

Voyage de démo : `supabase/demo-rome.sql`, à lancer dans le SQL Editor de
Supabase avec son e-mail.

Captures avant/après dans `docs/captures/`. Le détail de chaque étape et
des pièges est dans le journal de la refonte :
Design et thème et
Problèmes rencontrés.
