# TravelFlow

Planificateur de voyage réalisé en React dans le cadre du cours de dev web
(3e année).

L'appli permet de créer des voyages, d'y ajouter des étapes jour par jour, de
les placer sur une carte et de suivre le budget.

## Stack

- React + Vite
- Tailwind CSS
- react-router-dom (navigation)
- react-leaflet + OpenStreetMap (carte)
- Back-end : Supabase (auth + base PostgreSQL)

## Lancer le projet

```
npm install
npm run dev
```

Puis ouvrir l'adresse affichée (par défaut http://localhost:5173).

Autres commandes :

```
npm run build     # build de production
npm run lint       # vérif du code
```

## Structure

```
src/
  components/   composants réutilisables (Navbar, TripCard, TripMap, BudgetBar...)
  pages/         les écrans (Dashboard, TripDetail, Login, Signup, NewTrip, EditTrip)
  context/       AuthContext (qui est connecté)
  hooks/         useAuth
  lib/           client Supabase, fix icônes Leaflet
docs/            notes prises pendant le dev
```

## Configuration

Créer un fichier `.env.local` à la racine (non commit) avec :
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```
(valeurs dans Project Settings → Data API sur le dashboard Supabase)

## Avancement

- [x] Setup projet + Tailwind
- [x] Affichage de la liste des voyages
- [x] Page détail d'un voyage (étapes par jour)
- [x] Navigation entre pages (react-router)
- [x] Back-end / base de données (Supabase, tables trips + steps, RLS)
- [x] Authentification (inscription, connexion, déconnexion)
- [x] Espace personnel (Dashboard + TripDetail lisent les vraies données Supabase)
- [x] CRUD voyages complet (créer, modifier, supprimer)
- [x] Ajouter/supprimer une étape depuis l'interface
- [x] Carte interactive (coordonnées saisies à la main, clic pour placer un point pas encore fait)
- [x] Budget (barre de progression, calcul réactif à partir des étapes)

**MVP du cahier des charges terminé.** Reste : responsive/finitions, tests,
README/documentation finale, préparation de la soutenance.
