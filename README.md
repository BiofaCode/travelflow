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
- Back-end : à définir (Node/Express + SQLite ou Supabase)

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
  components/   composants réutilisables (Navbar, TripCard...)
  pages/         les écrans (Dashboard, TripDetail)
  data/          données de test en attendant le back-end
docs/            notes prises pendant le dev
```

## Avancement

- [x] Setup projet + Tailwind
- [x] Affichage de la liste des voyages
- [x] Page détail d'un voyage (étapes par jour)
- [x] Navigation entre pages (react-router)
- [ ] Carte interactive
- [ ] Budget
- [ ] Authentification
- [ ] Back-end / base de données
