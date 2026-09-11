# Notes React - TravelFlow

Mes notes au fur et à mesure.

## Tailwind

Installé avec :
```
npm install tailwindcss @tailwindcss/vite
```

Ajouté le plugin dans `vite.config.js` (dans le tableau `plugins`), et mis
`@import "tailwindcss";` tout en haut de `src/index.css`. Avec la v4 pas besoin
de fichier `tailwind.config.js`.

Supprimé `App.css` (c'était le style du template de base, plus utilisé).

Tailwind = des classes toutes faites à mettre dans le className : `p-4` padding,
`grid` / `flex`, `text-blue-600` couleur, `rounded-lg`, `shadow`, etc.

## Liste de voyages

But : ne plus écrire les cartes à la main dans `App.jsx`, mais partir d'un
tableau.

- `src/data/trips.js` : tableau avec des voyages en dur pour tester (id, titre,
  dates, budget). Plus tard ça sera remplacé par un fetch vers l'API. Les dates
  sont en format `2027-03-10` (plus simple à comparer), je les reformate en
  `10/03/2027` seulement pour l'affichage.
- `Dashboard.jsx` : la page. Elle importe le tableau et fait
  `trips.map(trip => <TripCard key={trip.id} trip={trip} />)`.
  Le `.map` transforme chaque voyage en une carte.
- `key` : obligatoire dans un `.map`, doit être unique (j'utilise l'id). Ça
  permet à React de suivre chaque élément de la liste.
- `TripCard.jsx` : reçoit un `trip` en prop et l'affiche. Les props = les données
  que le parent passe à l'enfant.
- `App.jsx` : juste `<Navbar />` + `<Dashboard />`.

Organisation des dossiers :
- `pages/` = un écran entier
- `components/` = bouts réutilisables
- `data/` = les données
