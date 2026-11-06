import { useEffect, useRef, useState } from "react";
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
import { LocateFixed, Map as MapIcon, MousePointerClick, Plus } from "lucide-react";
import FondCarte from "./FondCarte";
import "../lib/leafletIcons.js";
import { formatCHF, formatHeure } from "../lib/format";
import { trierParHeure } from "../lib/dates";
import { couleurJour } from "../lib/couleurs";

const VIOLET = "#8b5cf6";
// quand un popup s'ouvre, la carte bouge pour qu'il soit entier : on garde 64 px
// en haut pour qu'il ne passe pas sous les boutons "Clique sur la carte" / "Recentrer"
const MARGE_POPUP = [16, 64];

// une icône par numéro + couleur, gardée en cache pour ne pas la recréer à chaque render
const iconesNumero = {};
function iconeNumero(n, couleur) {
  const cle = `${n}-${couleur}`;
  if (!iconesNumero[cle]) {
    iconesNumero[cle] = L.divIcon({
      className: "",
      // épingle en goutte (voir .carte-pin dans index.css), la pointe en bas = le point exact
      html: `<div class="carte-pin" style="background:${couleur}"><span>${n}</span></div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 41], // la pointe dépasse un peu en bas à cause de la rotation
      popupAnchor: [0, -36],
    });
  }
  return iconesNumero[cle];
}

const iconePointChoisi = L.divIcon({
  className: "",
  html: '<div class="w-5 h-5 rounded-full border-[3px] border-white bg-rose-500/50 shadow-lg animate-pulse"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// montre tous les points (ou le centre de la destination s'il n'y en a pas)
function cadrer(map, points, centre) {
  if (points.length > 1) {
    map.fitBounds(points, { padding: [40, 40], maxZoom: 15 });
  } else if (points.length === 1) {
    map.setView(points[0], 14);
  } else if (centre) {
    map.setView(centre, 12);
  }
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
    cadrer(map, pointsRef.current, centreRef.current);
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

// contenu d'un popup en "fiche" : photo en haut, puis jour/heure, titre, notes, prix
// (des div et pas des p : Leaflet met de grosses marges sur les p des popups)
function Fiche({ image, couleur, pastille, sousTitre, titre, notes, cout, children }) {
  return (
    <div>
      {image && <img src={image} alt="" className="h-28 w-full object-cover" />}
      <div className="p-3">
        <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: couleur }}>
          {pastille != null && (
            <span
              className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] text-white"
              style={{ background: couleur }}
            >
              {pastille}
            </span>
          )}
          {sousTitre}
        </div>
        <div className="mt-1 text-sm font-bold leading-snug text-slate-100">{titre}</div>
        {notes && <div className="mt-1 line-clamp-2 text-xs text-slate-400">{notes}</div>}
        {Number(cout) > 0 && <div className="mt-1.5 text-xs font-semibold text-slate-300">{formatCHF(cout)}</div>}
        {children}
      </div>
    </div>
  );
}

export default function TripMap({
  steps,
  jours = [],
  jourActif,
  centreDestination,
  photos = null,
  suggestions = [],
  suggestionSurvolee,
  onAjouterSuggestion,
  onMapClick,
  pointChoisi,
  className = "h-[300px]",
}) {
  // l'objet carte Leaflet, pour le bouton "Recentrer" qui est en dehors de MapContainer
  const [carte, setCarte] = useState(null);

  const etapes = steps.filter((s) => s.latitude != null && s.longitude != null);
  const etapesDuJour = etapes.filter((s) => s.jour === jourActif).sort(trierParHeure);
  const autresEtapes = etapes.filter((s) => s.jour !== jourActif);

  const pointsDuJour = etapesDuJour.map((s) => [s.latitude, s.longitude]);
  const tousLesPoints = etapes.map((s) => [s.latitude, s.longitude]);
  const pointsVue = pointsDuJour.length > 0 ? pointsDuJour : tousLesPoints;

  const couleurDuJour = couleurJour(jours.indexOf(jourActif));
  const photoDe = (step) => photos?.get((step.titre || "").toLowerCase()) ?? null;

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
      <MapContainer
        ref={setCarte}
        center={centreInitial}
        zoom={12}
        scrollWheelZoom
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <FondCarte />
        <ZoomControl position="bottomright" />

        <AjusterVue points={pointsVue} centre={centreDestination} cle={cleVue} />
        {onMapClick && <ClicCarte onMapClick={onMapClick} />}

        {/* les étapes des autres jours : petits ronds, chacun dans la couleur de son jour */}
        {autresEtapes.map((step) => {
          const index = jours.indexOf(step.jour);
          const couleur = couleurJour(index);
          return (
            <CircleMarker
              key={step.id}
              center={[step.latitude, step.longitude]}
              radius={6}
              bubblingMouseEvents={false}
              pathOptions={{ color: "#ffffff", weight: 2, fillColor: couleur, fillOpacity: 0.7 }}
            >
              <Popup className="popup-fiche" minWidth={220} maxWidth={220} autoPanPaddingTopLeft={MARGE_POPUP}>
                <Fiche
                  image={photoDe(step)}
                  couleur={couleur}
                  sousTitre={`Jour ${index + 1}${step.heure ? ` · ${formatHeure(step.heure)}` : ""}`}
                  titre={step.titre}
                  notes={step.notes}
                  cout={step.cout}
                />
              </Popup>
            </CircleMarker>
          );
        })}

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
              <Popup className="popup-fiche" minWidth={220} maxWidth={220} autoPanPaddingTopLeft={MARGE_POPUP}>
                <Fiche image={lieu.image} couleur={VIOLET} sousTitre="Suggestion" titre={lieu.titre}>
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
                </Fiche>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* le trajet du jour : un trait blanc plus large dessous (bordure, comme Google Maps)
            + le trait de la couleur du jour */}
        {pointsDuJour.length > 1 && (
          <>
            <Polyline positions={pointsDuJour} pathOptions={{ color: "#ffffff", weight: 7, opacity: 0.9 }} />
            <Polyline positions={pointsDuJour} pathOptions={{ color: couleurDuJour, weight: 4, opacity: 1 }} />
          </>
        )}

        {etapesDuJour.map((step, i) => (
          <Marker
            key={step.id}
            position={[step.latitude, step.longitude]}
            icon={iconeNumero(i + 1, couleurDuJour)}
          >
            <Popup className="popup-fiche" minWidth={220} maxWidth={220} autoPanPaddingTopLeft={MARGE_POPUP}>
              <Fiche
                image={photoDe(step)}
                couleur={couleurDuJour}
                pastille={i + 1}
                sousTitre={step.heure ? formatHeure(step.heure) : "Sans heure"}
                titre={step.titre}
                notes={step.notes}
                cout={step.cout}
              />
            </Popup>
          </Marker>
        ))}

        {pointChoisi && <Marker position={pointChoisi} icon={iconePointChoisi} />}
      </MapContainer>

      {onMapClick && (
        <p className="absolute top-3 left-3 z-[500] pointer-events-none inline-flex items-center gap-1.5 rounded-full bg-slate-950/80 border border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 shadow-lg backdrop-blur-sm">
          <MousePointerClick size={14} className="text-rose-400" />
          <span className="hidden sm:inline">Clique sur la carte pour placer une étape</span>
          <span className="sm:hidden">Clique pour placer une étape</span>
        </p>
      )}

      {/* revenir sur les étapes du jour après s'être baladé sur la carte */}
      <button
        type="button"
        onClick={() => carte && cadrer(carte, pointsVue, centreDestination)}
        className="absolute top-3 right-3 z-[500] inline-flex items-center gap-1.5 rounded-full bg-slate-950/80 border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 shadow-lg backdrop-blur-sm hover:bg-slate-900"
      >
        <LocateFixed size={14} className="text-rose-400" />
        Recentrer
      </button>
    </div>
  );
}
