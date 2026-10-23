// fausse capture de l'app : une mini carte avec des épingles numérotées
// et quelques cartes "Jour X" en dessous, tout en HTML/SVG
const jours = [
  { jour: 1, lieu: "Lisbonne", detail: "Arrivée + Alfama" },
  { jour: 2, lieu: "Sintra", detail: "Palais de Pena" },
  { jour: 3, lieu: "Porto", detail: "Bords du Douro" },
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

      {/* mini carte */}
      <div className="rounded-2xl bg-slate-900 overflow-hidden">
        <svg viewBox="0 0 300 160" className="w-full h-auto">
          <rect width="300" height="160" fill="#0f172a" />
          <path d="M0 120 C 60 100, 90 140, 150 110 S 250 90, 300 105 L300 160 L0 160 Z" fill="#13233d" />
          <path d="M30 30 q40 -15 80 5" fill="none" stroke="#1e293b" strokeWidth="3" />
          <path d="M180 40 q40 20 90 0" fill="none" stroke="#1e293b" strokeWidth="3" />
          <path
            d="M60 120 L130 70 L230 45"
            fill="none"
            stroke="#f43f5e"
            strokeWidth="3"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />
          {[
            [60, 120, 1],
            [130, 70, 2],
            [230, 45, 3],
          ].map(([x, y, n]) => (
            <g key={n}>
              <circle cx={x} cy={y} r="11" fill="#f43f5e" stroke="#fff" strokeWidth="2" />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
                {n}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* liste des jours */}
      <div className="mt-3 flex flex-col gap-2">
        {jours.map((j) => (
          <div key={j.jour} className="flex items-center gap-3 rounded-xl bg-slate-900 border border-slate-800 p-2.5">
            <span className="grid place-items-center w-8 h-8 rounded-full bg-rose-500/15 text-rose-400 text-xs font-bold shrink-0">
              J{j.jour}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-100 truncate">
                Jour {j.jour} · {j.lieu}
              </p>
              <p className="text-xs text-slate-500 truncate">{j.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
