// lieux intéressants autour d'un point, via la recherche de Wikipédia
// gratuite, sans clé, et origin=* autorise l'appel direct depuis le navigateur (CORS)
// (Overpass, prévu au départ, était trop souvent saturé / en timeout)
//
// "nearcoord:10km,lat,lon" limite la recherche autour du point, et les résultats
// sont classés par pertinence -> les lieux les plus connus sortent en premier.
// On interroge le Wikipédia français ET anglais : le français est vite pauvre
// hors francophonie (ex: Tokyo), l'anglais complète.

// pour chaque langue : ce qui ressemble à un lieu à visiter, et ce qui y
// ressemble mais n'en est pas un (organismes, événements, transports...)
const FILTRES = {
  fr: {
    lieu: /\b(musée|monument|mémorial|basilique|église|cathédrale|chapelle|temple|sanctuaire|mosquée|synagogue|abbaye|monastère|palais|château|fort|villa|place|fontaine|parc|jardin|pont|tour\b|statue|théâtre|opéra|ruines|site|forum|colline|arc\b|colonne|obélisque|mausolée|catacombe|marché|halle|plage|lac|mont|île|cascade|galerie|aquarium|zoo|planétarium|stade|brasserie|quartier|point de vue|rue piétonne|hôtel de ville|édifice|bâtiment|porte|phare|belvédère|grotte|vieille ville)/i,
    exclure: /organisme|institution|organisation|groupe|congrégation|ordre |tournoi|édition|jeux|olympique|académie|dicastère|juridiction|diocèse|patriarcat|capitale|civilisation|club|équipe|entreprise|\bmarque\b|parti|journal|école|université|institut|ministère|bataille|bombardement|opération|siège|traité|élection|incendie|séisme|attentat|putsch|coup d.état|fusillade|championnat|tramway|gare|station|ligne de|circuit|arrondissement|province|commune|région/i,
  },
  en: {
    lieu: /\b(museum|monument|memorial|basilica|church|cathedral|chapel|temple|shrine|mosque|synagogue|abbey|monastery|palace|castle|fort|villa|square|fountain|park|garden|bridge|tower|statue|theatre|theater|opera|ruins|forum|hill|arch\b|column|obelisk|mausoleum|catacomb|market|beach|lake|mount|island|waterfall|gallery|aquarium|zoo|planetarium|stadium|arena|brewery|beer hall|neighbou?rhood|viewpoint|pedestrian|town hall|gate|lighthouse|cave|old town|landmark|skyscraper|observation)/i,
    exclure: /organi[sz]ation|institut|university|school|company|brand|manufacturer|club|team|league|battle|bombing|earthquake|attack|shooting|championships?|tournament|tram|transit|s-bahn|capital of|election|ministry|olympic|station|railway|line\b|ward\b|district|prefecture|municipality|province|diocese|order of|television|newspaper|headquarters/i,
  },
};

// catégorie d'un lieu, d'après son titre + sa description (fr et en)
// l'ordre compte : "musée de la cathédrale" doit rester un musée
const CATEGORIES = [
  ["musee", /\b(musée|museum|galerie|gallery|planétarium|planetarium|temple de la renommée|hall of fame)/i],
  ["religieux", /\b(église|cathédrale|basilique|chapelle|temple|sanctuaire|mosquée|synagogue|abbaye|monastère|church|cathedral|basilica|chapel|shrine|mosque|abbey|monastery|jinja)|-ji\b|-dera\b/i],
  ["loisirs", /\b(stade|stadium|arena|zoo|aquarium|parc d'attractions|parc à thème|amusement park|theme park|théâtre|opéra|theatre|theater|opera|cinéma|cinema|concert|marché|halle|market|brasserie|brewery|beer hall|restaurant|bar\b|shopping|centre commercial|rue piétonne|pedestrian)/i],
  ["nature", /\b(parc|park|jardin|garden|lac|lake|plage|beach|mont|mount|colline|hill|île|island|cascade|waterfall|grotte|cave|forêt|forest|rivière|river|point de vue|viewpoint|belvédère)/i],
  ["monument", /\b(monument|mémorial|memorial|palais|palace|château|castle|fort|tour\b|tower|statue|arc\b|arch\b|colonne|column|obélisque|obelisk|mausolée|mausoleum|pont|bridge|porte|gate|place|square|fontaine|fountain|ruines|ruins|hôtel de ville|town hall|édifice|bâtiment|building|skyscraper|gratte-ciel|phare|lighthouse)/i],
];

function categorieDe(texte) {
  const trouvee = CATEGORIES.find(([, regex]) => regex.test(texte));
  return trouvee ? trouvee[0] : "autre";
}

// la description est plus fiable que le titre ("Toranomon Hills" = un gratte-ciel)
// donc on regarde d'abord elle, et le titre seulement si elle ne donne rien
function trouverCategorie(titre, description) {
  const parDescription = categorieDe(description);
  return parDescription !== "autre" ? parDescription : categorieDe(titre);
}

async function chercherDansWikipedia(langue, lat, lon, motCle) {
  // avec un mot-clé on élargit un peu le rayon (15 km)
  const recherche = motCle ? `${motCle} nearcoord:15km,${lat},${lon}` : `nearcoord:10km,${lat},${lon}`;

  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: recherche,
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
      if (!p.coordinates || exclure.test(texte)) return false;
      // avec un mot-clé, l'utilisateur sait ce qu'il cherche : pas de filtre "lieu"
      return motCle ? true : lieu.test(texte);
    })
    .sort((a, b) => a.index - b.index) // ordre de pertinence renvoyé par Wikipédia
    .map((p) => ({
      id: `${langue}-${p.pageid}`,
      titre: p.title,
      description: p.description ?? "",
      categorie: trouverCategorie(p.title, p.description ?? ""),
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

export async function chercherLieux(lat, lon, motCle = "") {
  const mot = motCle.trim();

  // allSettled : si une des deux langues plante, on garde quand même l'autre
  const [fr, en] = await Promise.allSettled([
    chercherDansWikipedia("fr", lat, lon, mot),
    chercherDansWikipedia("en", lat, lon, mot),
  ]);

  const lieuxFr = fr.status === "fulfilled" ? fr.value : [];
  const lieuxEn = en.status === "fulfilled" ? en.value : [];

  if (fr.status === "rejected" && en.status === "rejected") {
    throw new Error("Impossible de contacter Wikipédia");
  }

  // le français en priorité, l'anglais seulement pour ce qui manque
  const complement = lieuxEn.filter((l) => !lieuxFr.some((f) => memeEndroit(f, l)));
  return [...lieuxFr, ...complement].slice(0, 30);
}
