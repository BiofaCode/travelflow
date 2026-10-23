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
  Wallet,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import StepItem from "../components/StepItem";
import StepForm from "../components/StepForm";
import TripMap from "../components/TripMap";
import BudgetBar from "../components/BudgetBar";
import BudgetPanel from "../components/BudgetPanel";
import ExplorePanel from "../components/ExplorePanel";
import Spinner from "../components/Spinner";
import { useLieux } from "../hooks/useLieux";
import { useAuth } from "../hooks/useAuth";
import { geocodeDestination } from "../lib/nominatim";
import { formatDate, formatJourCourt, listerJours, nombreDeJours, aujourdhui } from "../lib/dates";
import { formatCHF, formatHeure } from "../lib/format";

// jour vide = on prendra le jour affiché dans le planning
const ETAPE_VIDE = { titre: "", jour: "", heure: "", cout: "", notes: "", latitude: "", longitude: "" };

const ONGLETS = [
  { id: "planning", label: "Planning", icone: CalendarDays },
  { id: "explorer", label: "Explorer", icone: Compass },
  { id: "budget", label: "Budget", icone: Wallet },
];

// tri par heure, les étapes sans heure à la fin
function trierParHeure(a, b) {
  if (!a.heure && !b.heure) return 0;
  if (!a.heure) return 1;
  if (!b.heure) return -1;
  return a.heure.localeCompare(b.heure);
}

// "Départ dans 12 jours" / "En cours – jour 3 sur 7" / "Terminé"
function compteARebours(debut, fin) {
  const today = aujourdhui();
  if (today > fin) return "Terminé";

  // écart en jours (dates à minuit UTC, donc des multiples de 24h)
  const ecart = Math.round((new Date(debut) - new Date(today)) / 86400000);
  if (ecart === 1) return "Départ demain";
  if (ecart > 0) return `Départ dans ${ecart} jours`;

  return `En cours – jour ${-ecart + 1} sur ${nombreDeJours(debut, fin)}`;
}

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

  const formRef = useRef(null);

  // hook appelé ici (avant les return) : il ne charge rien tant que l'onglet n'est pas ouvert
  const { lieux, loading: lieuxLoading, error: lieuxError } = useLieux(
    centreDestination,
    onglet === "explorer"
  );

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
  const rebours = compteARebours(trip.date_debut, trip.date_fin);

  const pointChoisi =
    newStep.latitude !== "" && newStep.longitude !== ""
      ? [Number(newStep.latitude), Number(newStep.longitude)]
      : null;

  return (
    <>
      {/* l'écran normal est caché à l'impression, c'est le bloc du bas qui s'imprime */}
      <div className="space-y-6 print:hidden">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-400 hover:text-rose-300 transition"
        >
          <ArrowLeft size={16} /> Retour à mes voyages
        </Link>

        {/* fond invisible quand le menu "..." est ouvert : un clic à côté le referme
            (en dehors du header : .card a un backdrop-blur qui casserait le "fixed") */}
        {menuOuvert && (
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setMenuOuvert(false)}
            className="fixed inset-0 z-[1050] cursor-default"
          />
        )}

        {/* en-tête du voyage (pas d'overflow-hidden sinon le menu est coupé).
            z-index seulement menu ouvert, pour passer au-dessus de la carte Leaflet */}
        <header className={`card relative ${menuOuvert ? "z-[1100]" : ""}`}>
          <div className="rounded-3xl bg-gradient-to-br from-rose-500/15 via-slate-900 to-slate-900 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 break-words">{trip.titre}</h1>
                {trip.destination && (
                  <p className="mt-1 flex items-center gap-1.5 text-slate-300">
                    <MapPin size={16} className="text-rose-400 shrink-0" />
                    {trip.destination}
                  </p>
                )}
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                  <CalendarDays size={16} className="shrink-0" />
                  {formatDate(trip.date_debut)} → {formatDate(trip.date_fin)}
                  <span className="text-slate-500">· {nbJours} jour{nbJours > 1 ? "s" : ""}</span>
                </p>
                <p
                  className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    rebours === "Terminé"
                      ? "bg-slate-800 text-slate-400"
                      : "bg-gradient-to-r from-rose-500/20 to-violet-500/20 text-rose-300"
                  }`}
                >
                  <Hourglass size={14} /> {rebours}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {lienCopie && (
                  <span className="inline-flex items-center gap-1 text-sm text-emerald-400">
                    <Check size={16} /> Lien copié !
                  </span>
                )}
                <Link to={`/trips/${id}/edit`} className="btn-secondary">
                  <Pencil size={16} /> Modifier
                </Link>

                {/* actions secondaires rangées dans un petit menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOuvert(!menuOuvert)}
                    aria-label="Plus d'actions"
                    aria-expanded={menuOuvert}
                    className="btn-secondary"
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

            <div className="mt-4 max-w-xl">
              <BudgetBar depense={totalDepense} budget={trip.budget_total} />
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          {/* colonne gauche : onglets + contenu */}
          <div className="min-w-0 space-y-6">
            <div role="tablist" className="flex gap-1 rounded-2xl border border-slate-800 bg-slate-900 p-1">
              {ONGLETS.map(({ id: idOnglet, label, icone: Icone }) => {
                const estActif = onglet === idOnglet;
                return (
                  <button
                    key={idOnglet}
                    type="button"
                    role="tab"
                    aria-selected={estActif}
                    onClick={() => setOnglet(idOnglet)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      estActif ? "bg-rose-500 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <Icone size={16} />
                    {label}
                  </button>
                );
              })}
            </div>

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
                        className={`shrink-0 rounded-xl border px-3 py-2 text-left transition ${
                          estActif
                            ? "border-rose-500 bg-rose-500/10 text-slate-100"
                            : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <span className="flex items-center gap-2 text-sm font-semibold">
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
                    <h2 className="font-semibold text-slate-100">
                      {jourActif ? formatJourCourt(jourActif) : "Planning"}
                    </h2>
                    {totalDuJour > 0 && (
                      <span className="text-sm text-slate-400">
                        Sous-total : <span className="font-semibold text-slate-200">{formatCHF(totalDuJour)}</span>
                      </span>
                    )}
                  </div>

                  {etapesDuJour.length > 0 ? (
                    <ol>
                      {etapesDuJour.map((step, index) => (
                        <StepItem
                          key={step.id}
                          step={step}
                          numero={index + 1}
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

                <div ref={formRef} className="scroll-mt-24">
                  <StepForm
                    step={{ ...newStep, jour: newStep.jour || jourActif }}
                    onChange={setNewStep}
                    onSubmit={handleSubmitStep}
                    jours={jours}
                    erreur={stepError}
                    enCours={ajoutEnCours}
                    modeEdition={idEnEdition !== null}
                    onAnnuler={annulerEdition}
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
                />
              ) : (
                <p className="card p-4 text-sm text-slate-400">
                  Ajoute une destination (Modifier) pour voir des suggestions.
                </p>
              ))}

            {onglet === "budget" && <BudgetPanel trip={trip} steps={trip.steps} jours={jours} />}
          </div>

          {/* colonne droite : la carte (au-dessus du contenu sur mobile) */}
          <aside className="order-first lg:order-none">
            <div className="lg:sticky lg:top-20">
              <TripMap
                steps={trip.steps}
                jourActif={jourActif}
                centreDestination={centreDestination}
                suggestions={onglet === "explorer" ? lieux || [] : []}
                suggestionSurvolee={suggestionSurvolee}
                onAjouterSuggestion={ajouterDepuisExplorer}
                onMapClick={handleMapClick}
                pointChoisi={pointChoisi}
                className="h-[300px] sm:h-[360px] lg:h-[calc(100vh-7rem)]"
              />
            </div>
          </aside>
        </div>
      </div>

      {/* version imprimable : cachée à l'écran, tout l'itinéraire jour par jour */}
      <div className="hidden print:block bg-white text-black">
        <h1 className="text-2xl font-bold">{trip.titre}</h1>
        <p className="text-sm">
          {trip.destination && `${trip.destination} · `}
          {formatDate(trip.date_debut)} → {formatDate(trip.date_fin)} · {nbJours} jour{nbJours > 1 ? "s" : ""}
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
