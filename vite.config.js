import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // l'avertissement se déclenche à 500 kB : MapLibre fait ~1,2 Mo (~320 kB gzip)
    // à lui seul et ne se découpe pas. Il n'est chargé que sur les pages avec
    // une carte, le reste de l'appli n'est pas touché, donc on monte la limite
    chunkSizeWarningLimit: 1300,
    rolldownOptions: {
      output: {
        // on coupe les grosses librairies dans leurs propres fichiers :
        // - le fichier principal passe de ~510 kB à beaucoup moins
        // - le navigateur garde ces fichiers en cache tant qu'on ne met pas à jour
        //   les librairies (seul notre code change d'une version à l'autre)
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'router', test: /node_modules[\\/](react-router|react-router-dom)[\\/]/ },
            { name: 'supabase', test: /node_modules[\\/]@supabase[\\/]/ },
            // MapLibre (le fond de carte vectoriel) : gros (~1 Mo), mais chargé
            // seulement sur les pages avec une carte, qui sont déjà en lazy
            { name: 'maplibre', test: /node_modules[\\/](maplibre-gl|@maplibre)[\\/]/ },
          ],
        },
      },
    },
  },
})
