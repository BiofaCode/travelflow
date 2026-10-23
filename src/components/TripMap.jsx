import { useEffect, useRef } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  CircleMarker,
  Polyline,
  Popup,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { Map as MapIcon, MousePointerClick, Plus } from "lucide-react";
import FondCarte from "./FondCarte";
import "../lib/leafletIcons.js";
import { formatHeure } from "../lib/format";

const ROSE = "#f43f5e";
const VIOLET = "#8b5cf6";

// une icône par numéro, gardée en cache pour ne pas la recréer à chaque render
const iconesNumero = {};
function iconeNumero(n) {
  if (!iconesNumero[n]) {
    iconesNumero[n] = L.divIcon({
      className: "",
      // épingle en goutte (voir .carte-pin dans index.css), la pointe en bas = le point exact
      html: `<div class="carte-pin"><span>${n}</span></div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 41], // la pointe dépasse un peu en bas à cause de la rotation
      popupAnchor: [0, -32],
    });
  }
  return iconesNumero[n];
}

const iconePointChoisi = L.divIcon({
  className: "",
  html: '<div class="w-5 h-5 rounded-full border-[3px] border-white bg-rose-500/50 shadow-lg animate-pulse"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// heure null -> à la fin de la journée
function trierParHeure(a, b) {
  if (!a.heure) return 1;
  if (!b.heure) return -1;
  return a.heure.localeCompare(b.heure);
}

function AjusterVue({ points, centre, cle }) {
  const map = useMap();
  // les points changent de référence à chaque render, on les garde dans une ref
  // pour ne recadrer que quand "cle" change
  const pointsRef = useRef(points);
  const centreRef = useRef(centre);

  useEffect(() => {
    pointsRef.current = points;
    centreRef.current = centre;
  });

  useEffect(() => {
    const pts = pointsRef.current;
    if (pts.length > 1) {
      map.fitBounds(pts, { padding: [40, 40], maxZoom: 15 });
    } else if (pts.length === 1) {
      map.setView(pts[0], 14);
    } else if (centreRef.current) {
      map.setView(centreRef.current, 12);
    }
  }, [map, cle]);

  return null;
}

function ClicCarte({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lon: e.latlng.lng });
    },
  });
  return null;
}

export default function TripMap({
  steps,
  jourActif,
  centreDestination,
  suggestions = [],
  suggestionSurvolee,
  onAjouterSuggestion,
  onMapClick,
  pointChoisi,
  className = "h-[300px]",
}) {
  const etapes = steps.filter((s) => s.latitude != null && s.longitude != null);
  const etapesDuJour = etapes.filter((s) => s.jour === jourActif).sort(trierParHeure);
  const autresEtapes = etapes.filter((s) => s.jour !== jourActif);

  const pointsDuJour = etapesDuJour.map((s) => [s.latitude, s.longitude]);
  const tousLesPoints = etapes.map((s) => [s.latitude, s.longitude]);
  const pointsVue = pointsDuJour.length > 0 ? pointsDuJour : tousLesPoints;

  if (pointsVue.length === 0 && !centreDestination) {
    return (
      <div className={`card flex flex-col items-center justify-center gap-2 text-slate-500 text-sm text-center px-6 ${className}`}>
        <MapIcon size={28} />
        <p>Ajoute une destination au voyage pour afficher la carte.</p>
      </div>
    );
  }

  const centreInitial = pointsVue[0] ?? centreDestination;
  const cleVue = `${jourActif}|${pointsVue.length}|${centreDestination?.join(",") ?? ""}`;

  return (
    <div className={`relative isolate rounded-3xl overflow-hidden border border-slate-800 shadow-xl shadow-black/20 ${className}`}>
      <MapContainer center={centreInitial} zoom={12} scrollWheelZoom zoomControl={false} style={{ height: "100%", width: "100%" }}>
        <FondCarte />
        <ZoomControl position="bottomright" />

        <AjusterVue points={pointsVue} centre={centreDestination} cle={cleVue} />
        {onMapClick && <ClicCarte onMapClick={onMapClick} />}

        {autresEtapes.map((step) => (
          <CircleMarker
            key={step.id}
            center={[step.latitude, step.longitude]}
            radius={5}
            bubblingMouseEvents={false}
            pathOptions={{ color: "#64748b", weight: 1, fillColor: "#94a3b8", fillOpacity: 0.6 }}
          >
            <Popup>
              <strong>{step.titre}</strong>
              <br />
              <span className="text-slate-400 text-xs">
                {step.jour} {formatHeure(step.heure)}
              </span>
            </Popup>
          </CircleMarker>
        ))}

        {suggestions.map((lieu) => {
          const survole = lieu.id === suggestionSurvolee;
          return (
            <CircleMarker
              key={lieu.id}
              center={[lieu.lat, lieu.lon]}
              radius={survole ? 11 : 7}
              bubblingMouseEvents={false}
              pathOptions={{
                color: "#ffffff",
                weight: 2,
                fillColor: VIOLET,
                fillOpacity: survole ? 1 : 0.75,
              }}
            >
              <Popup>
                {lieu.image && (
                  <img src={lieu.image} alt="" className="mb-2 h-24 w-48 rounded-lg object-cover" />
                )}
                <strong className="block max-w-48">{lieu.titre}</strong>
                {onAjouterSuggestion && (
                  <button
                    type="button"
                    onClick={() => onAjouterSuggestion(lieu)}
                    className="mt-2 flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300"
                  >
                    <Plus size={14} />
                    Ajouter au planning
                  </button>
                )}
              </Popup>
            </CircleMarker>
          );
        })}

        {/* le trajet du jour : un trait large et transparent dessous (halo) + le vrai trait */}
        {pointsDuJour.length > 1 && (
          <>
            <Polyline positions={pointsDuJour} pathOptions={{ color: ROSE, weight: 10, opacity: 0.2 }} />
            <Polyline positions={pointsDuJour} pathOptions={{ color: ROSE, weight: 3, opacity: 0.95, dashArray: "1 7", lineCap: "round" }} />
          </>
        )}

        {etapesDuJour.map((step, i) => (
          <Marker key={step.id} position={[step.latitude, step.longitude]} icon={iconeNumero(i + 1)}>
            <Popup>
              <strong>{step.titre}</strong>
              {step.heure && (
                <>
                  <br />
                  <span className="text-slate-400 text-xs">{formatHeure(step.heure)}</span>
                </>
              )}
            </Popup>
          </Marker>
        ))}

        {pointChoisi && <Marker position={pointChoisi} icon={iconePointChoisi} />}
      </MapContainer>

      {onMapClick && (
        <p className="absolute top-3 left-3 z-[500] pointer-events-none inline-flex items-center gap-1.5 rounded-full bg-slate-950/80 border border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 shadow-lg backdrop-blur-sm">
          <MousePointerClick size={14} className="text-rose-400" />
          Clique sur la carte pour placer une étape
        </p>
      )}
    </div>
  );
}
