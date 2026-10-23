import { formatCHF } from "../lib/format";

// compact = version mini (juste la barre + %), utilisée dans les cartes de voyage
export default function BudgetBar({ depense, budget, compact = false }) {
  const depenseNum = Number(depense) || 0;
  const budgetNum = Number(budget) || 0;

  // budget à 0 : pas de division par zéro, on considère 100% si on a déjà dépensé
  const ratio = budgetNum > 0 ? (depenseNum / budgetNum) * 100 : depenseNum > 0 ? 100 : 0;
  const largeur = Math.min(ratio, 100);
  const depasse = depenseNum > budgetNum;

  // dégradé rose -> violet par défaut, ambre si on approche, rouge si dépassé
  let couleur = "bg-gradient-to-r from-rose-500 to-violet-500 shadow-[0_0_12px] shadow-rose-500/40";
  if (depasse) couleur = "bg-red-500 shadow-[0_0_12px] shadow-red-500/40";
  else if (ratio > 80) couleur = "bg-gradient-to-r from-amber-400 to-orange-500";

  const barre = (
    <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden ${compact ? "h-1.5" : "h-2.5"}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${couleur}`}
        style={{ width: `${largeur}%` }}
      />
    </div>
  );

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1">{barre}</div>
        <span className={`text-xs ${depasse ? "text-red-400 font-semibold" : "text-slate-400"}`}>
          {Math.round(ratio)}%
        </span>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex justify-between gap-2 text-sm mb-1.5">
        <span className={depasse ? "text-red-400 font-semibold" : "text-slate-400"}>
          <span className="font-semibold">{formatCHF(depenseNum)}</span> dépensés sur {formatCHF(budgetNum)}
        </span>
        <span className={`font-bold ${depasse ? "text-red-400" : "text-slate-200"}`}>
          {Math.round(ratio)}%
        </span>
      </div>
      {barre}
      {depasse && (
        <p className="text-red-400 text-xs mt-1.5">
          Budget dépassé de {formatCHF(depenseNum - budgetNum)}
        </p>
      )}
    </div>
  );
}
