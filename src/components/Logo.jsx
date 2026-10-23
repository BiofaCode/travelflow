import { Plane } from "lucide-react";

// logo maison : avion dans un rond dégradé + "travel" blanc et "flow" en dégradé
export default function Logo({ taille = "md" }) {
  const petit = taille === "sm";

  return (
    <span className="inline-flex items-center gap-2 font-extrabold tracking-tight">
      <span
        className={`grid place-items-center rounded-full bg-gradient-to-br from-rose-500 to-violet-500 text-white shadow-lg shadow-rose-500/20 ${
          petit ? "w-7 h-7" : "w-9 h-9"
        }`}
      >
        <Plane size={petit ? 15 : 18} className="-rotate-12" aria-hidden="true" />
      </span>
      <span className={petit ? "text-base" : "text-xl"}>
        <span className="text-slate-50">travel</span>
        <span className="bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text text-transparent">
          flow
        </span>
      </span>
    </span>
  );
}
