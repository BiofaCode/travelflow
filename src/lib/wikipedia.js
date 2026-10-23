// lieux intéressants autour d'un point, via la recherche de Wikipédia
// gratuite, sans clé, et origin=* autorise l'appel direct depuis le navigateur (CORS)
// (Overpass, prévu au départ, était trop souvent saturé / en timeout)
//
// "nearcoord:8km,lat,lon" limite la recherche autour du point, et les résultats
// sont classés par pertinence -> les lieux les plus connus sortent en premier.
// On interroge le Wikipédia français ET anglais : le français est vite pauvre
// hors francophonie (ex: Tokyo), l'anglais complète.

// pour chaque langue : ce qui ressemble à un lieu à visiter, et ce qui y
// ressemble mais n'en est pas un (organismes, événements, transports...)
const FILTRES = {
  fr: {
    lieu: /\b(musée|monument|basilique|église|cathédrale|chapelle|temple|sanctuaire|mosquée|synagogue|abbaye|monastère|palais|château|fort|villa|place|fontaine|parc|jardin|pont|tour\b|statue|théâtre|opéra|ruines|site|forum|colline|arc\b|colonne|obélisque|mausolée|catacombe|marché|plage|lac|mont|île|cascade|galerie|aquarium|zoo|édifice|bâtiment|porte|phare|belvédère|grotte|vieille ville)/i,
    exclure: /organisme|institution|organisation|groupe|congrégation|ordre |tournoi|édition|jeux|olympique|académie|dicastère|juridiction|diocèse|patriarcat|capitale|civilisation|club|équipe|entreprise|parti|journal|école|université|institut|ministère|bataille|bombardement|opération|siège|traité|élection|incendie|séisme|attentat|gare|station|ligne de|circuit|arrondissement|province|commune|région/i,
  },
  en: {
    lieu: /\b(museum|monument|basilica|church|cathedral|chapel|temple|shrine|mosque|synagogue|abbey|monastery|palace|castle|fort|villa|square|fountain|park|garden|bridge|tower|statue|theatre|theater|opera|ruins|forum|hill|arch\b|column|obelisk|mausoleum|catacomb|market|beach|lake|mount|island|waterfall|gallery|aquarium|zoo|gate|lighthouse|cave|old town|landmark|skyscraper|observation)/i,
    exclure: /organi[sz]ation|institut|university|school|company|club|team|league|battle|bombing|earthquake|attack|election|ministry|olympic|station|railway|line\b|ward\b|district|prefecture|municipality|province|diocese|order of|television|newspaper|headquarters/i,
  },
};

async function chercherDansWikipedia(langue, lat, lon) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: `nearcoord:8km,${lat},${lon}`,
    gsrlimit: "50",
    prop: "coordinates|pageimages|description",
    colimit: "max", // sinon l'API ne renvoie les coordonnées que pour 10 pages
    piprop: "thumbnail",
    pithumbsize: "400",
    pilimit: "max",
    format: "json",
    origin: "*",
  });

  const response = await fetch(`https://${langue}.wikipedia.org/w/api.php?${params}`);
  const data = await response.json();
  const { lieu, exclure } = FILTRES[langue];

  // pas de résultat du tout -> data.query n'existe pas
  return Object.values(data.query?.pages ?? {})
    .filter((p) => {
      const texte = `${p.title} ${p.description ?? ""}`;
      return p.coordinates && lieu.test(texte) && !exclure.test(texte);
    })
    .sort((a, b) => a.index - b.index) // ordre de pertinence renvoyé par Wikipédia
    .map((p) => ({
      id: `${langue}-${p.pageid}`,
      titre: p.title,
      description: p.description ?? "",
      lat: p.coordinates[0].lat,
      lon: p.coordinates[0].lon,
      image: p.thumbnail?.source ?? null,
      url: `https://${langue}.wikipedia.org/?curid=${p.pageid}`,
    }));
}

// deux lieux à moins de ~150 m l'un de l'autre = sûrement le même endroit,
// décrit dans les deux langues
function memeEndroit(a, b) {
  return Math.abs(a.lat - b.lat) < 0.0015 && Math.abs(a.lon - b.lon) < 0.0015;
}

export async function chercherLieux(lat, lon) {
  // allSettled : si une des deux langues plante, on garde quand même l'autre
  const [fr, en] = await Promise.allSettled([
    chercherDansWikipedia("fr", lat, lon),
    chercherDansWikipedia("en", lat, lon),
  ]);

  const lieuxFr = fr.status === "fulfilled" ? fr.value : [];
  const lieuxEn = en.status === "fulfilled" ? en.value : [];

  if (fr.status === "rejected" && en.status === "rejected") {
    throw new Error("Impossible de contacter Wikipédia");
  }

  // le français en priorité, l'anglais seulement pour ce qui manque
  const complement = lieuxEn.filter((l) => !lieuxFr.some((f) => memeEndroit(f, l)));
  return [...lieuxFr, ...complement].slice(0, 24);
}
