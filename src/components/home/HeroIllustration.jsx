// illustration faite à la main en SVG : une carte pliée, un chemin en pointillés,
// des épingles, un petit avion et deux nuages
export default function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 420 340"
      className="w-full h-auto"
      role="img"
      aria-label="Carte de voyage avec un itinéraire en pointillés et un avion"
    >
      <defs>
        <linearGradient id="hero-degrade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="hero-carte" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      {/* halo derrière la carte */}
      <circle cx="210" cy="175" r="150" fill="url(#hero-degrade)" opacity="0.12" />

      {/* carte pliée en 3 panneaux */}
      <g transform="translate(60 70)">
        <path d="M0 20 L100 0 L100 220 L0 240 Z" fill="url(#hero-carte)" stroke="#334155" strokeWidth="2" />
        <path d="M100 0 L200 20 L200 240 L100 220 Z" fill="#162033" stroke="#334155" strokeWidth="2" />
        <path d="M200 20 L300 0 L300 220 L200 240 Z" fill="url(#hero-carte)" stroke="#334155" strokeWidth="2" />

        {/* un peu de "relief" pour faire carte */}
        <path d="M20 70 q30 -20 60 0 t50 10" fill="none" stroke="#334155" strokeWidth="2" />
        <path d="M150 160 q25 -15 45 5" fill="none" stroke="#334155" strokeWidth="2" />
        <path d="M220 60 q30 15 60 -5" fill="none" stroke="#334155" strokeWidth="2" />
        <circle cx="245" cy="165" r="18" fill="#1e3a5f" opacity="0.6" />

        {/* itinéraire en pointillés */}
        <path
          d="M40 190 C 80 120, 120 200, 150 120 S 230 60, 260 80"
          fill="none"
          stroke="url(#hero-degrade)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="2 12"
        />

        {/* épingles */}
        <g transform="translate(40 190)">
          <path d="M0 0 C -14 -16, -14 -34, 0 -34 C 14 -34, 14 -16, 0 0 Z" fill="#f43f5e" />
          <circle cy="-23" r="5" fill="#fff" />
        </g>
        <g transform="translate(150 120)">
          <path d="M0 0 C -14 -16, -14 -34, 0 -34 C 14 -34, 14 -16, 0 0 Z" fill="#c026d3" />
          <circle cy="-23" r="5" fill="#fff" />
        </g>
        <g transform="translate(260 80)">
          <path d="M0 0 C -14 -16, -14 -34, 0 -34 C 14 -34, 14 -16, 0 0 Z" fill="#8b5cf6" />
          <circle cy="-23" r="5" fill="#fff" />
        </g>
      </g>

      {/* petit avion */}
      <g transform="translate(330 60) rotate(20)">
        <path
          d="M0 0 L36 10 L0 20 L6 10 Z"
          fill="#fff"
        />
        <path d="M6 10 L-6 -2 L-2 10 L-6 22 Z" fill="#e2e8f0" />
      </g>
      <path
        d="M250 40 q40 -10 75 20"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="2"
        strokeDasharray="4 6"
        opacity="0.6"
      />

      {/* nuages */}
      <g fill="#e2e8f0" opacity="0.85">
        <ellipse cx="70" cy="50" rx="26" ry="11" />
        <ellipse cx="88" cy="42" rx="16" ry="11" />
        <ellipse cx="370" cy="270" rx="24" ry="10" />
        <ellipse cx="385" cy="262" rx="14" ry="10" />
      </g>
    </svg>
  );
}
