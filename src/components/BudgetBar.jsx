export default function BudgetBar({ depense, budget }) {
  const pourcentage = budget > 0 ? Math.min((depense / budget) * 100, 100) : 0;
  const depasse = depense > budget;

  return (
    <div className="mt-3">
      <div className="flex justify-between text-sm mb-1">
        <span className={depasse ? "text-red-400 font-semibold" : "text-slate-400"}>
          {depense} CHF dépensés sur {budget} CHF
        </span>
        <span className={depasse ? "text-red-400 font-semibold" : "text-slate-400"}>
          {Math.round(pourcentage)}%
        </span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${depasse ? "bg-red-500" : "bg-rose-500"}`}
          style={{ width: `${pourcentage}%` }}
        />
      </div>
      {depasse && (
        <p className="text-red-400 text-xs mt-1">
          Budget dépassé de {depense - budget} CHF
        </p>
      )}
    </div>
  );
}
