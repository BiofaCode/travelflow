// panneau décoratif à gauche des pages connexion / inscription (caché sur mobile)
export default function AuthVisuel({ titre, texte }) {
  return (
    <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-rose-500 via-fuchsia-600 to-violet-700 p-10">
      {/* lueurs en fond */}
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/15 blur-3xl" />
      <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-orange-400/30 blur-3xl" />

      <p className="relative text-sm font-semibold uppercase tracking-widest text-white/80">TravelFlow</p>

      {/* petite illustration maison : globe + trajet d'avion */}
      <svg viewBox="0 0 240 180" className="relative w-full max-w-xs mx-auto" aria-hidden="true">
        <circle cx="120" cy="95" r="62" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.5" strokeWidth="2" />
        <ellipse cx="120" cy="95" rx="28" ry="62" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="1.5" />
        <path d="M58 95 H182 M66 65 H174 M66 125 H174" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
        <path
          d="M20 150 C 60 40, 170 20, 220 60"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeDasharray="5 7"
          strokeLinecap="round"
        />
        <circle cx="20" cy="150" r="6" fill="white" />
        {/* épingle à l'arrivée */}
        <path d="M220 38 a12 12 0 0 1 12 12 c0 9 -12 22 -12 22 s-12 -13 -12 -22 a12 12 0 0 1 12 -12z" fill="white" />
        <circle cx="220" cy="50" r="4.5" fill="#d946ef" />
      </svg>

      <div className="relative">
        <h2 className="text-3xl font-extrabold leading-tight text-white">{titre}</h2>
        <p className="mt-3 text-white/85">{texte}</p>
      </div>
    </div>
  );
}
