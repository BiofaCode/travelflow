import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import { setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "../hooks/useTheme";

// MapLibre prépare la carte dans un "worker" (un script à part qui tourne en
// arrière-plan). Il cherche ce fichier à côté de son propre code, mais Vite
// regroupe tout ailleurs, donc il ne le trouvait pas ("Worker failed to load").
// ?url = Vite copie le fichier tel quel et nous donne son adresse
setWorkerUrl(workerUrl);

// fond de carte "vectoriel" OpenFreeMap : gratuit, sans clé, sans limite
// (Google Maps, celui de Wanderlog, demande une clé + une carte de crédit)
// - avant : des images (tuiles Esri) un peu floues et ternes
// - maintenant : la carte est dessinée par le navigateur (MapLibre, en WebGL),
//   donc nette à tous les zooms, avec des couleurs proches de Google Maps
// on garde Leaflet pour tout le reste (épingles, popups, trajet), le plugin
// maplibre-gl-leaflet ajoute juste MapLibre comme une couche Leaflet
const STYLES = {
  light: "https://tiles.openfreemap.org/styles/liberty",
  dark: "https://tiles.openfreemap.org/styles/fiord",
};
const ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>';

export default function FondCarte() {
  const map = useMap();
  const { theme } = useTheme();

  // la couche n'est pas un composant react-leaflet : on l'ajoute à la main
  // et on l'enlève quand le thème change (ou quand la carte disparaît)
  useEffect(() => {
    const couche = maplibreGL({
      style: theme === "light" ? STYLES.light : STYLES.dark,
      attribution: ATTRIBUTION,
    });
    couche.addTo(map);
    return () => {
      map.removeLayer(couche);
    };
  }, [map, theme]);

  return null;
}
