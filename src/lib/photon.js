// suggestions de destinations pendant la frappe, via Photon (komoot)
// basé sur OpenStreetMap comme Nominatim, mais fait pour l'autocomplétion :
// gratuit, sans clé, CORS ok, et lang=fr donne les noms en français ("Italie", "Japon")

// les types OSM qu'on garde : des villes, des pays, des régions (pas les rues, gares...)
const VILLES = ["city", "town", "village", "municipality"];
const REGIONS = ["state", "province", "region", "island", "archipelago"];

export async function suggererDestinations(texte, signal) {
  // osm_tag=place : Photon ne renvoie déjà que des "lieux" (pas les magasins, bureaux...)
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(texte)}&limit=12&lang=fr&osm_tag=place`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("Recherche de destination impossible");
  const data = await response.json();

  const resultats = [];
  for (const f of data.features ?? []) {
    const p = f.properties;
    const valeur = p.osm_value;

    let type;
    if (valeur === "country") type = "pays";
    // p.type === "city" : Tokyo est une "province" pour OSM, mais Photon sait que c'est une ville
    else if (VILLES.includes(valeur) || p.type === "city") type = "ville";
    else if (REGIONS.includes(valeur)) type = "region";
    else continue; // quartier, lieu-dit... on ignore

    // "Tokyo, Japon" mais juste "Italie" pour un pays
    const label = p.country && p.country !== p.name ? `${p.name}, ${p.country}` : p.name;
    // Photon renvoie parfois deux fois la même ville (ex: Ithaca)
    if (resultats.some((r) => r.label === label)) continue;

    let detail;
    if (type === "pays") detail = "Pays";
    else if (p.state && p.state !== p.name) detail = `${p.state}, ${p.country}`;
    else detail = p.country ?? "";

    resultats.push({
      id: `${p.osm_type}${p.osm_id}`,
      nom: p.name,
      detail,
      type,
      // GeoJSON : coordonnées dans l'ordre [lon, lat]
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
      label,
    });
  }

  return resultats.slice(0, 6);
}

// lieux précis (musées, restos, monuments...) autour de la destination, pour le
// titre d'une étape. lat/lon = Photon met en avant ce qui est proche de ce point
const TYPES_LIEU = {
  museum: "musee", gallery: "musee",
  attraction: "monument", viewpoint: "monument", artwork: "monument",
  archaeological_site: "monument", monument: "monument", castle: "monument", memorial: "monument", ruins: "monument",
  place_of_worship: "religieux",
  park: "nature", garden: "nature", beach: "nature", peak: "nature", nature_reserve: "nature",
  restaurant: "resto", cafe: "resto", fast_food: "resto", bar: "resto", pub: "resto", ice_cream: "resto",
  hotel: "hotel", hostel: "hotel", guest_house: "hotel",
  zoo: "loisirs", theme_park: "loisirs", aquarium: "loisirs", stadium: "loisirs", theatre: "loisirs", cinema: "loisirs",
};

// ce qui n'est pas un "lieu à visiter" : routes, zones, frontières...
const CLES_IGNOREES = ["highway", "landuse", "boundary", "railway", "power", "office"];

export async function suggererLieuxProches(texte, centre, signal) {
  const [lat, lon] = centre;
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(texte)}&lat=${lat}&lon=${lon}&limit=15&lang=fr`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("Recherche de lieu impossible");
  const data = await response.json();

  const resultats = [];
  for (const f of data.features ?? []) {
    const p = f.properties;
    const [lonLieu, latLieu] = f.geometry.coordinates;
    if (!p.name || CLES_IGNOREES.includes(p.osm_key)) continue;
    // trop loin de la destination (~50 km) : sûrement un homonyme ailleurs
    if (Math.abs(latLieu - lat) > 0.5 || Math.abs(lonLieu - lon) > 0.7) continue;
    // Photon renvoie souvent le même lieu 2 fois (le bâtiment + le point)
    if (resultats.some((r) => r.nom === p.name)) continue;

    resultats.push({
      id: `${p.osm_type}${p.osm_id}`,
      nom: p.name,
      detail: [p.street, p.city ?? p.district].filter(Boolean).join(", "),
      type: TYPES_LIEU[p.osm_value] ?? "autre",
      lat: latLieu,
      lon: lonLieu,
      label: p.name,
    });
  }

  return resultats.slice(0, 6);
}
