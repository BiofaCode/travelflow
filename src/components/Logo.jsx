import { useId } from "react";

// le logo TravelFlow, dessiné en SVG (pas d'image à charger, net à toutes les tailles) :
// une épingle de carte au bout d'un trajet en pointillés = "travel" + "flow"
// même dessin que public/favicon.svg
export function LogoIcone({ className = "w-9 h-9" }) {
  // id unique : le logo est 2 fois sur la page (navbar + footer) et un
  // dégradé SVG est retrouvé par son id
  const idDegrade = useId();

  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={idDegrade} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f43f5e" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${idDegrade})`} />
      {/* le trajet : des points ronds (trait de longueur ~0 + bouts arrondis) */}
      <path
        d="M6.5 25.5c3.5 0 4-4.5 7.5-4.5s3.5 2 6 0"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="0.1 3.4"
        opacity="0.85"
      />
      {/* l'épingle */}
      <path d="M21 5.5a5.5 5.5 0 0 1 5.5 5.5c0 4-5.5 9.5-5.5 9.5s-5.5-5.5-5.5-9.5A5.5 5.5 0 0 1 21 5.5z" fill="#fff" />
      <circle cx="21" cy="11" r="2.2" fill={`url(#${idDegrade})`} />
    </svg>
  );
}

// icône + nom. "travel" dans la couleur du texte, "flow" en dégradé
export default function Logo({ taille = "md" }) {
  const petit = taille === "sm";

  return (
    <span className="inline-flex items-center gap-2 font-extrabold tracking-tight">
      <LogoIcone className={`${petit ? "w-7 h-7" : "w-9 h-9"} drop-shadow-[0_4px_10px_rgb(244_63_94/0.25)]`} />
      <span className={petit ? "text-base" : "text-xl"}>
        <span className="text-slate-50">travel</span>
        <span className="bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text text-transparent">
          flow
        </span>
      </span>
    </span>
  );
}
