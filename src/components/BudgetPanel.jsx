import { Wallet, Receipt, PiggyBank, Trophy } from "lucide-react";
import BudgetBar from "./BudgetBar";
import { formatCHF } from "../lib/format";
import { formatJourCourt } from "../lib/dates";

// petite card avec icône pour un chiffre clé
function ChiffreCle({ icone: Icone, titre, valeur, couleur, fond }) {
  return (
    <div className="card p-4 flex items-center gap-3 min-w-0">
      <span className={`grid place-items-center w-11 h-11 shrink-0 rounded-2xl ${fond}`}>
        <Icone size={20} className={couleur} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{titre}</p>
        <p className={`text-lg sm:text-xl font-extrabold truncate ${couleur}`}>{valeur}</p>
      </div>
    </div>
  );
}

export default function BudgetPanel({ trip, steps, jours }) {
  const budget = Number(trip.budget_total) || 0;
  const depense = steps.reduce((somme, s) => somme + (Number(s.cout) || 0), 0);
  const restant = budget - depense;

  // total par jour, pour les petites barres
  const parJour = jours.map((jour) => ({
    jour,
    total: steps
      .filter((s) => s.jour === jour)
      .reduce((somme, s) => somme + (Number(s.cout) || 0), 0),
  }));
  const max = Math.max(...parJour.map((j) => j.total), 0);

  const plusCheres = [...steps]
    .filter((s) => s.cout > 0)
    .sort((a, b) => b.cout - a.cout)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ChiffreCle icone={Wallet} titre="Budget" valeur={formatCHF(budget)} couleur="text-slate-100" fond="bg-violet-500/15" />
        <ChiffreCle icone={Receipt} titre="Dépensé" valeur={formatCHF(depense)} couleur="text-slate-100" fond="bg-rose-500/15" />
        <ChiffreCle
          icone={PiggyBank}
          titre="Restant"
          valeur={formatCHF(restant)}
          couleur={restant < 0 ? "text-red-400" : "text-emerald-400"}
          fond={restant < 0 ? "bg-red-500/15" : "bg-emerald-500/15"}
        />
      </div>

      <div className="card p-5">
        <BudgetBar depense={depense} budget={budget} />
      </div>

      <div className="card p-5">
        <h3 className="font-bold text-slate-100 mb-4">Dépenses par jour</h3>
        <ul className="space-y-3">
          {parJour.map(({ jour, total }, index) => (
            <li key={jour} className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-3 text-sm">
              <span className="text-slate-400 truncate" title={formatJourCourt(jour)}>
                Jour {index + 1}
              </span>
              <div className="h-3 rounded-full bg-slate-800/80 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-violet-500 transition-all duration-500"
                  style={{ width: max > 0 ? `${(total / max) * 100}%` : "0%" }}
                />
              </div>
              <span className={`whitespace-nowrap font-semibold ${total > 0 ? "text-slate-200" : "text-slate-500"}`}>
                {formatCHF(total)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card p-5">
        <h3 className="flex items-center gap-2 font-bold text-slate-100 mb-4">
          <Trophy size={18} className="text-amber-400" />
          Top 5 des étapes les plus chères
        </h3>
        {plusCheres.length > 0 ? (
          <ol className="space-y-2 text-sm">
            {plusCheres.map((s, index) => (
              <li key={s.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-800/40 px-3 py-2">
                <span className="flex items-center gap-3 min-w-0 text-slate-300">
                  <span className="grid place-items-center w-6 h-6 shrink-0 rounded-full bg-rose-500/15 text-rose-400 text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="truncate">{s.titre}</span>
                </span>
                <span className="font-bold text-slate-100 whitespace-nowrap">{formatCHF(s.cout)}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-slate-500 italic">Aucune dépense pour l'instant.</p>
        )}
      </div>
    </div>
  );
}
