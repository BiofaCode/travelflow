import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Compass,
  Copy,
  Hourglass,
  Link2,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Printer,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import StepItem from "../components/StepItem";
import StepForm from "../components/StepForm";
import TripMap from "../components/TripMap";
import BudgetBar from "../components/BudgetBar";
import BudgetPanel from "../components/BudgetPanel";
import ExplorePanel from "../components/ExplorePanel";
import CouvertureVoyage from "../components/CouvertureVoyage";
import Spinner from "../components/Spinner";
import { useLieux } from "../hooks/useLieux";
import { useAuth } from "../hooks/useAuth";
import { geocodeDestination } from "../lib/nominatim";
import { formatDate, formatJourCourt, listerJours, nombreDeJours, aujourdhui, trierParHeure, compteARebours } from "../lib/dates";
import { distanceKm, trajetEstime } from "../lib/distance";
import { couleurJour } from "../lib/couleurs";
import { formatCHF, formatHeure } from "../lib/format";

// jour vide = on prendra le jour affiché dans le planning
const ETAPE_VIDE = { titre: "", jour: "", heure: "", cout: "", notes: "", latitude: "", longitude: "" };

const ONGLETS = [
  { id: "planning", label: "Planning", icone: CalendarDays },
  { id: "explorer", label: "Explorer", icone: Compass },
  { id: "budget", label: "Budget", icone: Wallet },
];

// une étape Supabase -> valeurs du formulaire (que des strings, comme les inputs)
function etapeVersFormulaire(step) {
  return {
    titre: step.titre || "",
    jour: step.jour,
    heure: formatHeure(step.heure), // "09:30:00" -> "09:30" pour l'input time
    cout: step.cout != null ? String(step.cout) : "",
    notes: step.notes || "",
    latitude: step.latitude != null ? String(step.latitude) : "",
    longitude: step.longitude != null ? String(step.longitude) : "",
  };
}

const CLASSE_ITEM_MENU =
  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-800";

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onglet, setOnglet] = useState("planning");
  const [jourChoisi, setJourChoisi] = useState("");

  const [newStep, setNewStep] = useState(ETAPE_VIDE);
  const [stepError, setStepError] = useState("");
  const [ajoutEnCours, setAjoutEnCours] = useState(false);
  // id de l'étape qu'on modifie (null = formulaire en mode ajout)
  const [idEnEdition, setIdEnEdition] = useState(null);

  const [menuOuvert, setMenuOuvert] = useState(false);
  const [lienCopie, setLienCopie] = useState(false);
  const [duplicationEnCours, setDuplicationEnCours] = useState(false);

  const [centreDestination, setCentreDestination] = useState(null);
  const [suggestionSurvolee, setSuggestionSurvolee] = useState(null);
  // mot-clé de la recherche dans Explorer ("" = lieux populaires)
  const [motCle, setMotCle] = useState("");

  const formRef = useRef(null);

  // hook appelé ici (avant les return) : il ne charge rien tant que l'onglet n'est pas ouvert
  const { lieux, loading: lieuxLoading, error: lieuxError } = useLieux(
    centreDestination,
    onglet === "explorer",
    motCle
  );
  // lieux populaires proposés dans le titre du formulaire d'étape (onglet Planning)
  const { lieux: lieuxPopulaires } = useLieux(centreDestination, onglet === "planning");

  useEffect(() => {
    async function fetchTrip() {
      const { data, error } = await supabase
        .from("trips")
        .select("*, steps(*)")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
      } else {
        setTrip(data);
      }
      setLoading(false);
    }

    fetchTrip();
  }, [id]);

  // géocode la destination dès qu'elle est connue (ou qu'elle change) : donne
  // un point central pour la carte même avant d'avoir des étapes géolocalisées
  useEffect(() => {
    if (!trip?.destination) return; // rien à géocoder

    geocodeDestination(trip.destination).then((resultat) => {
      if (resultat) setCentreDestination([resultat.lat, resultat.lon]);
    });
  }, [trip?.destination]);

  // utilisée après un ajout/suppression de step, pour rafraîchir la liste
  // (séparée du fetch initial ci-dessus : eslint n'aime pas qu'un useEffect
  // appelle une fonction "partagée" qui fait du setState)
  async function refreshTrip() {
    const { data, error } = await supabase
      .from("trips")
      .select("*, steps(*)")
      .eq("id", id)
      .single();

    if (!error) setTrip(data);
  }

  async function handleDelete() {
    setMenuOuvert(false);
    const confirme = window.confirm("Supprimer ce voyage définitivement ?");
    if (!confirme) return;

    // les steps liées partent automatiquement (on delete cascade défini en SQL)
    const { error } = await supabase.from("trips").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/");
  }

  // copie le voyage + toutes ses étapes, puis on ouvre la copie
  async function handleDupliquer() {
    setMenuOuvert(false);
    setDuplicationEnCours(true);

    const { data: copie, error } = await supabase
      .from("trips")
      .insert({
        titre: `${trip.titre} (copie)`,
        destination: trip.destination,
        date_debut: trip.date_debut,
        date_fin: trip.date_fin,
        budget_total: trip.budget_total,
        voyageurs: trip.voyageurs || 1,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      setDuplicationEnCours(false);
      alert(error.message);
      return;
    }

    if (trip.steps.length > 0) {
      // pas d'id ni de trip_id d'origine : Supabase génère les nouveaux id
      const etapes = trip.steps.map((step) => ({
        jour: step.jour,
        heure: step.heure,
        titre: step.titre,
        notes: step.notes,
        cout: step.cout,
        latitude: step.latitude,
        longitude: step.longitude,
        trip_id: copie.id,
      }));
      const { error: erreurEtapes } = await supabase.from("steps").insert(etapes);
      if (erreurEtapes) alert("Voyage copié, mais pas ses étapes : " + erreurEtapes.message);
    }

    // même route, seul l'id change : on remet la page à zéro à la main
    setDuplicationEnCours(false);
    setIdEnEdition(null);
    setNewStep(ETAPE_VIDE);
    setJourChoisi("");
    setOnglet("planning");
    navigate(`/trips/${copie.id}`);
  }

  function handleImprimer() {
    setMenuOuvert(false);
    window.print();
  }

  async function handleCopierLien() {
    setMenuOuvert(false);
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLienCopie(true);
      setTimeout(() => setLienCopie(false), 2000);
    } catch {
      alert("Impossible de copier le lien.");
    }
  }

  // tous les jours du voyage, même ceux sans étape
  const jours = trip ? listerJours(trip.date_debut, trip.date_fin) : [];
  // pas de setState dans un effet : on déduit le jour affiché à chaque rendu
  const jourActif = jours.includes(jourChoisi)
    ? jourChoisi
    : jours.includes(aujourdhui())
      ? aujourdhui()
      : jours[0] || "";

  // sert pour l'ajout ET la modification (selon idEnEdition)
  async function handleSubmitStep(e) {
    e.preventDefault();
    setStepError("");
    setAjoutEnCours(true);

    const jourEtape = newStep.jour || jourActif;

    const donnees = {
      ...newStep,
      jour: jourEtape,
      heure: newStep.heure || null, // "" n'est pas une heure valide pour Postgres
      cout: Number(newStep.cout), // "" -> 0 automatiquement avec Number()
      // vide -> null plutôt que 0 : (0,0) est un vrai point sur Terre (dans l'Atlantique)
      latitude: newStep.latitude !== "" ? Number(newStep.latitude) : null,
      longitude: newStep.longitude !== "" ? Number(newStep.longitude) : null,
    };

    const { error } = idEnEdition
      ? await supabase.from("steps").update(donnees).eq("id", idEnEdition)
      : await supabase.from("steps").insert({ ...donnees, trip_id: id });

    setAjoutEnCours(false);

    if (error) {
      setStepError(error.message);
      return;
    }

    await refreshTrip();
    setJourChoisi(jourEtape); // on suit l'étape, même si elle a changé de jour
    setNewStep(ETAPE_VIDE);
    setIdEnEdition(null);
  }

  // crayon d'une étape -> formulaire pré-rempli en mode édition
  function commencerEdition(step) {
    setStepError("");
    setIdEnEdition(step.id);
    setNewStep(etapeVersFormulaire(step));
    allerAuFormulaire();
  }

  function annulerEdition() {
    setStepError("");
    setIdEnEdition(null);
    setNewStep(ETAPE_VIDE);
  }

  // bouton rapide sous la liste : formulaire vide sur le jour affiché
  function ajouterAuJour() {
    setStepError("");
    setIdEnEdition(null);
    setNewStep({ ...ETAPE_VIDE, jour: jourActif });
    allerAuFormulaire();
  }

  async function handleDeleteStep(stepId) {
    const confirme = window.confirm("Supprimer cette étape ?");
    if (!confirme) return;

    const { error } = await supabase.from("steps").delete().eq("id", stepId);

    if (error) {
      alert(error.message);
      return;
    }

    if (stepId === idEnEdition) annulerEdition(); // elle n'existe plus
    await refreshTrip();
  }

  // descend jusqu'au formulaire (petit délai : il faut que l'onglet Planning soit affiché)
  function allerAuFormulaire() {
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      formRef.current?.querySelector("input")?.focus({ preventScroll: true });
    }, 50);
  }

  // un lieu d'Explorer -> pré-remplit le formulaire d'étape
  function ajouterDepuisExplorer(lieu) {
    // si on modifiait une étape, on repart sur un nouvel ajout
    const etaitEnEdition = idEnEdition !== null;
    setIdEnEdition(null);
    setNewStep((avant) => ({
      ...(etaitEnEdition ? ETAPE_VIDE : avant),
      titre: lieu.titre,
      notes: lieu.description || "",
      latitude: lieu.lat,
      longitude: lieu.lon,
    }));
    setOnglet("planning");
    allerAuFormulaire();
  }

  // clic sur la carte -> position de la future étape (ou de celle qu'on modifie)
  function handleMapClick({ lat, lon }) {
    setNewStep((avant) => ({ ...avant, latitude: lat, longitude: lon }));
    if (onglet !== "planning") setOnglet("planning");
  }

  if (loading) return <Spinner />;

  if (!trip) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center space-y-3">
        <p className="text-slate-400">Ce voyage n'existe pas.</p>
        <Link to="/" className="inline-flex items-center gap-1.5 text-rose-400 hover:underline">
          <ArrowLeft size={16} /> Retour à mes voyages
        </Link>
      </div>
    );
  }

  const etapesDuJour = trip.steps.filter((s) => s.jour === jourActif).sort(trierParHeure);
  const totalDuJour = etapesDuJour.reduce((somme, s) => somme + (Number(s.cout) || 0), 0);
  const totalDepense = trip.steps.reduce((somme, step) => somme + (Number(step.cout) || 0), 0);
  const nbJours = nombreDeJours(trip.date_debut, trip.date_fin);
  const nbVoyageurs = trip.voyageurs || 1;
  const rebours = compteARebours(trip.date_debut, trip.date_fin);

  const pointChoisi =
    newStep.latitude !== "" && newStep.longitude !== ""
      ? [Number(newStep.latitude), Number(newStep.longitude)]
      : null;

  // photos connues des lieux Wikipédia, retrouvées par le titre de l'étape
  // (une étape ajoutée depuis Explorer ou les lieux populaires a le même titre)
  const photos = new Map();
  for (const lieu of [...lieuxPopulaires, ...lieux]) {
    if (lieu.image) photos.set(lieu.titre.toLowerCase(), lieu.image);
  }
  const photoSecours = lieuxPopulaires.find((l) => l.image)?.image ?? null;

  // pour chaque étape du jour : son numéro (le même que sur la carte, donc on ne
  // compte que celles qui ont une position) et le trajet jusqu'à la suivante
  let compteur = 0;
  const etapesAffichees = etapesDuJour.map((step, i) => {
    const surCarte = step.latitude != null && step.longitude != null;
    if (surCarte) compteur++;
    const suivante = etapesDuJour[i + 1];
    let trajet = null;
    if (surCarte && suivante?.latitude != null && suivante?.longitude != null) {
      const km = distanceKm(step, suivante);
      trajet = { km, ...trajetEstime(km) };
    }
    return { step, numero: surCarte ? compteur : "–", trajet };
  });

  return (
    <>
      {/* fond invisible quand le menu "..." est ouvert : un clic à côté le referme
          (en dehors du header : .card a un backdrop-blur qui casserait le "fixed") */}
      {menuOuvert && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setMenuOuvert(false)}
          className="fixed inset-0 z-[1050] cursor-default print:hidden"
        />
      )}

      {/* mise en page façon Wanderlog. Sur grand écran : 2 colonnes, le contenu à
          gauche et la carte à droite sur toute la hauteur (elle reste en place
          quand on scrolle). Sur mobile : tout en colonne, la carte entre l'en-tête
          et le planning (pour pouvoir cliquer dessus en ajoutant une étape) */}
      <div className="print:hidden lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(380px,45%)] lg:grid-rows-[auto_1fr]">
        {/* --- en-tête : photo + carte du titre qui chevauche la photo --- */}
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <div className="relative">
            <CouvertureVoyage destination={trip.destination} imageSecours={photoSecours} />
            <Link
              to="/"
              className="absolute left-4 top-4 sm:left-8 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-black/60"
            >
              <ArrowLeft size={16} /> Mes voyages
            </Link>
          </div>

          <div className="mx-auto max-w-3xl px-4 sm:px-8">
            {/* pas d'overflow-hidden sinon le menu est coupé. z-index plus haut
                menu ouvert, pour passer au-dessus de la carte Leaflet.
                bg-slate-900 plein : sinon la photo se voit à travers la carte */}
            <header
              className={`card relative -mt-16 sm:-mt-20 bg-slate-900 p-5 sm:p-6 ${menuOuvert ? "z-[1100]" : "z-10"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <h1 className="min-w-0 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 break-words">
                  {trip.titre}
                </h1>

                <div className="flex shrink-0 items-center gap-2">
                  <Link to={`/trips/${id}/edit`} className="btn-secondary px-3" aria-label="Modifier le voyage">
                    <Pencil size={16} />
                    <span className="hidden sm:inline">Modifier</span>
                  </Link>

                  {/* actions secondaires rangées dans un petit menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMenuOuvert(!menuOuvert)}
                      aria-label="Plus d'actions"
                      aria-expanded={menuOuvert}
                      className="btn-secondary px-3"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {menuOuvert && (
                      <div className="absolute right-0 z-10 mt-2 w-52 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 py-1 shadow-xl">
                        <button
                          type="button"
                          onClick={handleDupliquer}
                          disabled={duplicationEnCours}
                          className={CLASSE_ITEM_MENU}
                        >
                          <Copy size={16} /> {duplicationEnCours ? "Copie..." : "Dupliquer"}
                        </button>
                        <button type="button" onClick={handleImprimer} className={CLASSE_ITEM_MENU}>
                          <Printer size={16} /> Imprimer
                        </button>
                        <button type="button" onClick={handleCopierLien} className={CLASSE_ITEM_MENU}>
                          <Link2 size={16} /> Copier le lien
                        </button>
                        <div className="my-1 border-t border-slate-800" />
                        <button
                          type="button"
                          onClick={handleDelete}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                        >
                          <Trash2 size={16} /> Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
                {trip.destination && (
                  <span className="inline-flex items-center gap-1.5 text-slate-300">
                    <MapPin size={16} className="text-rose-400 shrink-0" />
                    {trip.destination}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={16} className="shrink-0" />
                  {formatDate(trip.date_debut)} → {formatDate(trip.date_fin)}
                  <span className="text-slate-500">· {nbJours} j</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users size={16} className="shrink-0" />
                  {nbVoyageurs} voyageur{nbVoyageurs > 1 ? "s" : ""}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    rebours === "Terminé"
                      ? "bg-slate-800 text-slate-400"
                      : "bg-gradient-to-r from-rose-500/20 to-violet-500/20 text-rose-300"
                  }`}
                >
                  <Hourglass size={14} /> {rebours}
                </span>
                {lienCopie && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                    <Check size={14} /> Lien copié !
                  </span>
                )}
              </div>

              <div className="mt-5 border-t border-slate-800 pt-4">
                <BudgetBar depense={totalDepense} budget={trip.budget_total} />
              </div>
            </header>
          </div>
        </div>

        {/* --- la carte : à droite sur grand écran, sous l'en-tête sur mobile --- */}
        <aside className="px-4 pt-6 sm:px-8 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:p-0">
          <div className="lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)]">
            <TripMap
              steps={trip.steps}
              jours={jours}
              jourActif={jourActif}
              centreDestination={centreDestination}
              photos={photos}
              suggestions={onglet === "explorer" ? lieux || [] : []}
              suggestionSurvolee={suggestionSurvolee}
              onAjouterSuggestion={ajouterDepuisExplorer}
              onMapClick={handleMapClick}
              pointChoisi={pointChoisi}
              className="h-[300px] sm:h-[380px] lg:h-full lg:rounded-none lg:border-y-0 lg:border-r-0 lg:shadow-none"
            />
          </div>
        </aside>

        {/* --- le contenu : onglets + planning / explorer / budget --- */}
        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          <div className="mx-auto max-w-3xl px-4 pb-12 sm:px-8">
            {/* onglets soulignés, collés sous la navbar quand on descend */}
            <div
              role="tablist"
              className="sticky top-16 z-20 -mx-4 mt-6 flex gap-6 border-b border-slate-800 bg-[var(--fond-page)]/90 px-4 backdrop-blur sm:-mx-8 sm:px-8"
            >
              {ONGLETS.map(({ id: idOnglet, label, icone: Icone }) => {
                const estActif = onglet === idOnglet;
                return (
                  <button
                    key={idOnglet}
                    type="button"
                    role="tab"
                    aria-selected={estActif}
                    onClick={() => setOnglet(idOnglet)}
                    className={`-mb-px flex items-center gap-2 border-b-2 py-3 text-sm font-semibold transition ${
                      estActif
                        ? "border-rose-500 text-slate-100"
                        : "border-transparent text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <Icone size={16} className={estActif ? "text-rose-400" : ""} />
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="pt-6">
              {onglet === "planning" && (
                <div className="space-y-6">
                  {/* barre des jours : seule elle scrolle horizontalement */}
                  <nav className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                    {jours.map((jour, index) => {
                      const estActif = jour === jourActif;
                      const nbEtapes = trip.steps.filter((s) => s.jour === jour).length;
                      return (
                        <button
                          key={jour}
                          type="button"
                          onClick={() => setJourChoisi(jour)}
                          className={`shrink-0 rounded-2xl border px-3.5 py-2 text-left transition ${
                            estActif
                              ? "border-rose-500 bg-rose-500/10 text-slate-100"
                              : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <span className="flex items-center gap-2 text-sm font-semibold">
                            {/* pastille = la couleur du jour sur la carte */}
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: couleurJour(index) }} />
                            Jour {index + 1}
                            {nbEtapes > 0 && (
                              <span
                                className={`rounded-full px-1.5 text-xs ${
                                  estActif ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-300"
                                }`}
                              >
                                {nbEtapes}
                              </span>
                            )}
                          </span>
                          <span className="block text-xs text-slate-500">{formatJourCourt(jour)}</span>
                        </button>
                      );
                    })}
                  </nav>

                  <section>
                    <div className="mb-4 flex items-baseline justify-between gap-3">
                      <h2 className="text-xl font-bold capitalize text-slate-100">
                        {jourActif ? formatJourCourt(jourActif) : "Planning"}
                      </h2>
                      {totalDuJour > 0 && (
                        <span className="text-sm text-slate-400">
                          Sous-total : <span className="font-semibold text-slate-200">{formatCHF(totalDuJour)}</span>
                        </span>
                      )}
                    </div>

                    {etapesAffichees.length > 0 ? (
                      <ol>
                        {etapesAffichees.map(({ step, numero, trajet }) => (
                          <StepItem
                            key={step.id}
                            step={step}
                            numero={numero}
                            trajet={trajet}
                            couleur={couleurJour(jours.indexOf(jourActif))}
                            image={photos.get((step.titre || "").toLowerCase()) ?? null}
                            onDelete={handleDeleteStep}
                            onEdit={commencerEdition}
                            enEdition={step.id === idEnEdition}
                          />
                        ))}
                      </ol>
                    ) : (
                      <p className="card p-4 text-slate-500 italic text-sm">
                        Aucune étape prévue pour cette journée.
                      </p>
                    )}

                    {jourActif && (
                      <button
                        type="button"
                        onClick={ajouterAuJour}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-800 px-4 py-3 text-sm font-semibold text-slate-400 transition hover:border-rose-500/50 hover:text-rose-400"
                      >
                        <Plus size={16} /> Ajouter une étape à ce jour
                      </button>
                    )}
                  </section>

                  <div ref={formRef} className="scroll-mt-32">
                    <StepForm
                      step={{ ...newStep, jour: newStep.jour || jourActif }}
                      onChange={setNewStep}
                      onSubmit={handleSubmitStep}
                      jours={jours}
                      erreur={stepError}
                      enCours={ajoutEnCours}
                      modeEdition={idEnEdition !== null}
                      onAnnuler={annulerEdition}
                      centre={centreDestination}
                      lieuxPopulaires={lieuxPopulaires}
                    />
                  </div>
                </div>
              )}

              {onglet === "explorer" &&
                (centreDestination ? (
                  <ExplorePanel
                    lieux={lieux}
                    loading={lieuxLoading}
                    error={lieuxError}
                    onAjouter={ajouterDepuisExplorer}
                    onSurvol={(lieu) => setSuggestionSurvolee(lieu ? lieu.id : null)}
                    motCle={motCle}
                    onRecherche={setMotCle}
                  />
                ) : (
                  <p className="card p-4 text-sm text-slate-400">
                    Ajoute une destination (Modifier) pour voir des suggestions.
                  </p>
                ))}

              {onglet === "budget" && <BudgetPanel trip={trip} steps={trip.steps} jours={jours} />}
            </div>
          </div>
        </div>
      </div>
      {/* version imprimable : cachée à l'écran, tout l'itinéraire jour par jour */}
      <div className="hidden print:block bg-white text-black">
        <h1 className="text-2xl font-bold">{trip.titre}</h1>
        <p className="text-sm">
          {trip.destination && `${trip.destination} · `}
          {formatDate(trip.date_debut)} → {formatDate(trip.date_fin)} · {nbJours} jour{nbJours > 1 ? "s" : ""} · {nbVoyageurs} voyageur{nbVoyageurs > 1 ? "s" : ""}
        </p>
        <p className="text-sm">
          Budget : {formatCHF(trip.budget_total)} · Prévu : {formatCHF(totalDepense)}
        </p>

        {jours.map((jour, index) => {
          const etapes = trip.steps.filter((s) => s.jour === jour).sort(trierParHeure);
          return (
            <section key={jour} className="mt-5 break-inside-avoid">
              <h2 className="border-b border-gray-400 pb-1 font-bold">
                Jour {index + 1} · {formatJourCourt(jour)}
              </h2>
              {etapes.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {etapes.map((step) => (
                    <li key={step.id} className="text-sm">
                      <span className="font-semibold">{formatHeure(step.heure) || "—"}</span> {step.titre}
                      {step.cout > 0 && ` · ${formatCHF(step.cout)}`}
                      {step.notes && <p className="text-gray-600">{step.notes}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm italic text-gray-500">Rien de prévu.</p>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
