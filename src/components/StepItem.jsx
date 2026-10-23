export default function StepItem({ step, onDelete }) {
  return (
    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 flex justify-between items-start">
      <div>
        <span className="inline-block text-xs font-semibold px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded">
          {step.heure}
        </span>
        <h4 className="font-semibold text-slate-100 mt-1">{step.titre}</h4>
        {/* notes pas obligatoire, on affiche que si y'en a */}
        {step.notes && (
          <p className="text-sm text-slate-400 mt-1">{step.notes}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 ml-4">
        <span className="font-semibold text-slate-300 whitespace-nowrap">
          {step.cout} CHF
        </span>
        {/* onDelete vient du parent (TripDetail), StepItem ne fait qu'appeler la fonction */}
        <button
          onClick={() => onDelete(step.id)}
          className="text-xs text-red-400 hover:underline"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
