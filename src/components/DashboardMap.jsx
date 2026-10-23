import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { MapContainer, CircleMarker, Popup, useMap } from "react-leaflet";
import FondCarte from "./FondCarte";
import "../lib/leafletIcons.js";

// recadre la carte pour voir tous les points d'un coup
function AjusterVue({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 1) {
      map.setView(points[0], 10);
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [30, 30] });
    }
  }, [map, points]);

  return null;
}

export default function DashboardMap({ trips }) {
  // on aplatit : une entrée par étape géolocalisée, avec son voyage
  const points = useMemo(() => {
    const liste = [];
    trips.forEach((trip) => {
      (trip.steps || []).forEach((step, i) => {
        if (step.latitude && step.longitude) {
          liste.push({ key: `${trip.id}-${i}`, trip, pos: [step.latitude, step.longitude] });
        }
      });
    });
    return liste;
  }, [trips]);

  const positions = useMemo(() => points.map((p) => p.pos), [points]);

  return (
    <div className="card overflow-hidden h-[260px] sm:h-[320px] ring-1 ring-rose-500/10">
      <MapContainer center={positions[0]} zoom={4} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <FondCarte />
        {points.map((p) => (
          <CircleMarker
            key={p.key}
            center={p.pos}
            radius={7}
            pathOptions={{ color: "#fda4af", fillColor: "#f43f5e", fillOpacity: 0.85, weight: 2 }}
          >
            <Popup>
              <strong>{p.trip.titre}</strong>
              <br />
              <Link to={`/trips/${p.trip.id}`} className="text-rose-400">
                Voir le voyage
              </Link>
            </Popup>
          </CircleMarker>
        ))}
        <AjusterVue points={positions} />
      </MapContainer>
    </div>
  );
}
