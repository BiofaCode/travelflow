import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Map as MapIcon, Compass, Wallet, Smartphone, Pencil, ArrowRight } from "lucide-react";
import HeroPhotos from "../components/home/HeroPhotos";
import AppPreview from "../components/home/AppPreview";
import SearchBar from "../components/home/SearchBar";

// pilules décoratives du hero (juste pour le style, ça ne filtre rien)
const typesVoyage = ["Road-trip", "City-trip", "Tour du monde"];

const fonctionnalites = [
  {
    icone: CalendarDays,
    titre: "Planning jour par jour",
    texte: "Tes étapes sont rangées par date, tu vois tout de suite ce que tu fais chaque jour.",
  },
  {
    icone: MapIcon,
    titre: "Carte interactive",
    texte: "Chaque étape apparaît sur la carte, reliée aux autres pour suivre ton itinéraire.",
  },
  {
    icone: Compass,
    titre: "Idées de lieux",
    texte: "Des suggestions de lieux à visiter autour de tes étapes, avec un résumé Wikipédia.",
  },
  {
    icone: Wallet,
    titre: "Suivi du budget",
    texte: "Fixe un budget et compare-le aux dépenses de tes étapes pour éviter les mauvaises surprises.",
  },
  {
    icone: Pencil,
    titre: "Modifiable à tout moment",
    texte: "Ajoute, modifie ou supprime une étape en quelques clics, même pendant le voyage.",
  },
  {
    icone: Smartphone,
    titre: "Sur mobile aussi",
    texte: "L'interface s'adapte à ton téléphone pour consulter ton planning sur place.",
  },
];

const etapes = [
  { titre: "Crée ton compte", texte: "Une adresse e-mail et un mot de passe, c'est tout." },
  { titre: "Ajoute ton voyage", texte: "Destination, dates et budget : la base de ton projet." },
  { titre: "Remplis tes étapes", texte: "Ajoute les lieux jour par jour et regarde la carte se dessiner." },
];

function Fonctionnalite({ icone, titre, texte }) {
  const Icone = icone;
  return (
    <div className="card p-6 transition hover:border-slate-700">
      <span className="grid place-items-center w-11 h-11 rounded-full bg-gradient-to-br from-rose-500/20 to-violet-500/20 text-rose-400">
        <Icone size={22} aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-bold text-slate-100">{titre}</h3>
      <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{texte}</p>
    </div>
  );
}

export default function Home() {
  const [typeChoisi, setTypeChoisi] = useState("Road-trip");

  return (
    <div className="flex flex-col gap-20 sm:gap-28 pb-10">
      {/* ---------- hero ---------- */}
      <section className="pt-6 sm:pt-12">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-50 leading-[1.05]">
              Planifie tes
              <br />
              <span className="bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text text-transparent">
                voyages
              </span>{" "}
              en un clin d'œil
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-lg">
              Étapes, carte, budget : regroupe tout ton itinéraire au même endroit et pars
              l'esprit tranquille.
            </p>

            <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Type de voyage">
              {typesVoyage.map((type) => {
                const actif = type === typeChoisi;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTypeChoisi(type)}
                    aria-pressed={actif}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                      actif
                        ? "bg-rose-100 text-rose-600 border-rose-100"
                        : "border-slate-700 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* photos de destinations (Wikipédia) */}
          <HeroPhotos />
        </div>

        <div className="mt-12">
          <SearchBar />
        </div>
      </section>

      {/* ---------- présentation ---------- */}
      <section className="rounded-[2rem] bg-gradient-to-br from-violet-950 via-slate-900 to-slate-950 border border-violet-900/40 p-6 sm:p-12 overflow-hidden">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-50/10 px-4 py-1.5 text-sm font-semibold text-slate-200">
              👋 Bienvenue sur TravelFlow
            </span>
            <h2 className="mt-5 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-50">
              Organise ton voyage{" "}
              <span className="bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text text-transparent">
                sans prise de tête
              </span>
            </h2>
            <p className="mt-4 text-slate-300 leading-relaxed">
              Fini les notes éparpillées entre ton téléphone, tes mails et un vieux carnet.
              Avec TravelFlow, chaque voyage a sa page : les étapes jour par jour, la carte
              de l'itinéraire et le budget qui se met à jour tout seul.
            </p>
            <p className="mt-3 text-slate-400 leading-relaxed">
              Tu sais en un coup d'œil où tu dors, ce que tu visites et combien il te reste.
            </p>
          </div>

          <AppPreview />
        </div>
      </section>

      {/* ---------- fonctionnalités ---------- */}
      <section>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-50 text-center">
          Tout ce qu'il faut pour{" "}
          <span className="bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text text-transparent">
            bien partir
          </span>
        </h2>
        <p className="mt-3 text-slate-400 text-center max-w-xl mx-auto">
          Des outils simples, pensés pour préparer un voyage du début à la fin.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fonctionnalites.map((f) => (
            <Fonctionnalite key={f.titre} icone={f.icone} titre={f.titre} texte={f.texte} />
          ))}
        </div>
      </section>

      {/* ---------- comment ça marche ---------- */}
      <section>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-50 text-center">
          Comment ça marche ?
        </h2>

        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {etapes.map((etape, i) => (
            <li key={etape.titre} className="card p-6">
              <span className="grid place-items-center w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-violet-500 text-white font-extrabold">
                {i + 1}
              </span>
              <h3 className="mt-4 font-bold text-slate-100">{etape.titre}</h3>
              <p className="mt-1.5 text-sm text-slate-400">{etape.texte}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- bandeau final ---------- */}
      <section className="rounded-[2rem] bg-gradient-to-r from-rose-500 to-violet-600 p-8 sm:p-12 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Prêt à partir ?
        </h2>
        <p className="mt-3 text-white/85 max-w-md mx-auto">
          Crée ton compte gratuitement et prépare ton prochain voyage dès maintenant.
        </p>
        <Link
          to="/signup"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
        >
          Commencer
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
