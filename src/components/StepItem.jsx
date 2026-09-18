export default function StepItem({ step }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-start">
      <div>
        <span className="inline-block text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
          {step.heure}
        </span>
        <h4 className="font-semibold text-gray-800 mt-1">{step.titre}</h4>
        {/* notes pas obligatoire, on affiche que si y'en a */}
        {step.notes && (
          <p className="text-sm text-gray-500 mt-1">{step.notes}</p>
        )}
      </div>
      <span className="font-semibold text-gray-700 whitespace-nowrap ml-4">
        {step.cout} CHF
      </span>
    </div>
  );
}