import { useSyncExternalStore } from "react";

// le thème est stocké directement comme classe "light" sur <html> (posée par le
// script de index.html avant React). Ici on se contente de lire cette classe.

// prévient React quand la classe de <html> change, comme ça tous les boutons
// (navbar desktop + menu mobile) restent synchronisés
function abonner(callback) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function lireTheme() {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

export function useTheme() {
  const theme = useSyncExternalStore(abonner, lireTheme);

  function basculerTheme() {
    const nouveau = theme === "light" ? "dark" : "light";
    document.documentElement.classList.toggle("light", nouveau === "light");

    // couleur de la barre du navigateur sur mobile
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", nouveau === "light" ? "#f4f6fb" : "#020617");

    // localStorage peut planter (navigation privée...) : pas grave, juste pas mémorisé
    try {
      localStorage.setItem("theme", nouveau);
    } catch {
      // rien
    }
  }

  return { theme, basculerTheme };
}
