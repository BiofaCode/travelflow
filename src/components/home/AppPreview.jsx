import { couleurJour } from "../../lib/couleurs";

// fausse capture de l'app : une mini carte avec les épingles et le trajet,
// et la liste des étapes en dessous, tout en HTML/SVG
// même style que la vraie page d'un voyage (épingles en goutte, une couleur par jour)
const etapes = [
  { n: 1, jour: 0, lieu: "Alfama", detail: "Jour 1 · 10:00", trajet: "12 min · 900 m" },
  { n: 2, jour: 0, lieu: "Tour de Belém", detail: "Jour 1 · 15:00", trajet: null },
  { n: 1, jour: 1, lieu: "Palais de Pena", detail: "Jour 2 · 10:30", trajet: null },
];

export default function AppPreview() {
  return (
    <div
      className="w-full max-w-md mx-auto rounded-3xl border border-slate-800 bg-slate-950/70 p-3 shadow-2xl shadow-violet-950/50"
      aria-hidden="true"
    >
      {/* barre de fenêtre */}
      <div className="flex items-center gap-1.5 px-2 pb-3">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-3 text-[11px] text-slate-500 truncate">Mon road-trip au Portugal</span>
      </div>

      {/* mini carte : eau, parc, rues, trajet blanc + couleur, épingles */}
      <div className="rounded-2xl overflow-hidden">
        <svg viewBox="0 0 300 160" className="w-full h-auto">
          <rect width="300" height="160" fill="#2b3a55" />
          <path d="M0 125 C 60 105, 100 145, 160 120 S 250 100, 300 112 L300 160 L0 160 Z" fill="#1e5a8a" />
          <ellipse cx="225" cy="45" rx="38" ry="20" fill="#2f5d4a" />
          <path d="M0 40 L300 70 M40 0 L80 160 M150 0 L170 160 M0 95 L300 85" stroke="#3b4c6b" strokeWidth="3" />
          <path d="M60 105 L135 62" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
          <path d="M60 105 L135 62" fill="none" stroke={couleurJour(0)} strokeWidth="4" strokeLinecap="round" />
          {[
            [60, 105, 1, 0],
            [135, 62, 2, 0],
            [240, 40, 1, 1],
          ].map(([x, y, n, jour]) => (
            // une goutte : un cercle + une pointe en bas, comme .carte-pin
            <g key={`${n}-${jour}`} transform={`translate(${x} ${y})`}>
              <path d="M0 0 L-8 -12 A11 11 0 1 1 8 -12 Z" fill={couleurJour(jour)} stroke="#fff" strokeWidth="2" />
              <text y="-16" textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff">
                {n}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* liste des étapes */}
      <div className="mt-3 flex flex-col gap-2">
        {etapes.map((e) => (
          <div key={e.lieu}>
            <div className="flex items-center gap-3 rounded-xl bg-slate-900 border border-slate-800 p-2.5">
              <span className="carte-pin carte-pin-sm shrink-0" style={{ background: couleurJour(e.jour) }}>
                <span>{e.n}</span>
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-100 truncate">{e.lieu}</p>
                <p className="text-xs text-slate-500 truncate">{e.detail}</p>
              </div>
            </div>
            {e.trajet && <p className="mt-1 pl-11 text-[11px] text-slate-500">{e.trajet}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
