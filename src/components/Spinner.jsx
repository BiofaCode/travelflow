import { LoaderCircle } from "lucide-react";

export default function Spinner({ texte = "Chargement..." }) {
  return (
    <div className="flex items-center justify-center gap-2 text-slate-500 py-16">
      <LoaderCircle className="animate-spin" size={20} />
      <span className="text-sm">{texte}</span>
    </div>
  );
}
