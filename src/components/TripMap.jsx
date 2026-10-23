import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function TripMap({ steps, centreDestination }) {
  const etapesAvecCoordonnees = steps.filter((s) => s.latitude && s.longitude);

  // priorité à la 1ère étape géolocalisée ; sinon on retombe sur le centre
  // de la destination du voyage (géocodée via Nominatim), pour avoir quand
  // même une carte utile avant d'avoir ajouté la moindre étape
  const centre = etapesAvecCoordonnees.length > 0
    ? [etapesAvecCoordonnees[0].latitude, etapesAvecCoordonnees[0].longitude]
    : centreDestination;

  if (!centre) {
    return (
      <p className="text-slate-500 italic text-sm">
        Aucune étape avec des coordonnées pour l'instant.
      </p>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border border-slate-800">
      <MapContainer
        center={centre}
        zoom={etapesAvecCoordonnees.length > 0 ? 12 : 10}
        style={{ height: "300px", width: "100%" }}
      >
        {/* vraies tuiles OpenStreetMap (gratuites, sans clé) + filtre CSS pour l'effet sombre, voir index.css */}
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles-dark"
        />
        {etapesAvecCoordonnees.map((step) => (
          <Marker key={step.id} position={[step.latitude, step.longitude]}>
            <Popup>
              <strong>{step.titre}</strong>
              <br />
              {step.heure}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
