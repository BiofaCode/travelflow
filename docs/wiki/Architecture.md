# Architecture

## Stack

React (Vite) + Tailwind CSS pour le front, Supabase pour l'auth et la base
(PostgreSQL).

## Dossiers

```
src/
  components/   morceaux d'UI réutilisables (Navbar, TripCard, StepItem)
  pages/        un composant par écran (Dashboard, TripDetail, Login, Signup)
  context/      AuthContext, pour savoir qui est connecté partout dans l'app
  hooks/        useAuth
  lib/          client Supabase (supabaseClient.js)
  data/         données de test, encore utilisées par TripDetail pour l'instant
```

## Pourquoi cette séparation

- Un composant dans `pages/` correspond à une route (`App.jsx`), un composant
  dans `components/` est réutilisé à plusieurs endroits.
- `context/` + `hooks/` séparés en plusieurs fichiers à cause d'une règle
  eslint (`react-refresh/only-export-components`) : un fichier avec un
  composant ne doit exporter que des composants.

## Navigation

react-router-dom. Routes définies dans `App.jsx` :
- `/` → Dashboard (liste des voyages)
- `/trips/:id` → détail d'un voyage
- `/login`, `/signup` → auth
