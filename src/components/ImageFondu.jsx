import { useState } from "react";

// photo qui apparaît en fondu une fois chargée (au lieu de s'afficher par morceaux)
// key={src} côté parent : une nouvelle photo = un nouveau composant = repart invisible
export default function ImageFondu({ src, className = "" }) {
  const [chargee, setChargee] = useState(false);
  return (
    <img
      src={src}
      alt=""
      onLoad={() => setChargee(true)}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
        chargee ? "opacity-100" : "opacity-0"
      } ${className}`}
    />
  );
}
