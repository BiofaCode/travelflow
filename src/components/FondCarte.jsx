import { TileLayer } from "react-leaflet";
import { useTheme } from "../hooks/useTheme";

// fonds de carte Esri : gratuits, sans clé (CARTO demande maintenant une clé,
// testé : il renvoie une image "API KEY REQUIRED")
const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services";
const ATTRIBUTION = "Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors";

// en sombre : fond gris foncé + une 2e couche avec juste les noms (rues, villes)
// en clair : la carte des rues classique, plus colorée
export default function FondCarte() {
  const { theme } = useTheme();

  if (theme === "light") {
    return (
      <TileLayer
        key="clair"
        attribution={ATTRIBUTION}
        url={`${ESRI}/World_Street_Map/MapServer/tile/{z}/{y}/{x}`}
        maxNativeZoom={18}
        maxZoom={19}
      />
    );
  }

  return (
    <>
      <TileLayer
        key="sombre"
        attribution={ATTRIBUTION}
        url={`${ESRI}/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`}
        maxNativeZoom={16}
        maxZoom={19}
      />
      <TileLayer
        key="sombre-noms"
        url={`${ESRI}/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`}
        maxNativeZoom={16}
        maxZoom={19}
      />
    </>
  );
}
