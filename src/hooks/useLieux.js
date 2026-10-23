import { useEffect, useState } from "react";
import { chercherLieux } from "../lib/wikipedia";

// lieux Wikipédia autour du centre, chargés seulement quand l'onglet est ouvert
export function useLieux(centre, actif) {
  const [etat, setEtat] = useState({ cle: "", lieux: [], error: "" });

  const lat = centre?.[0];
  const lon = centre?.[1];
  const cle = centre ? `${lat},${lon}` : "";
  const doitCharger = Boolean(actif && centre);

  useEffect(() => {
    // déjà chargé pour ce centre -> pas de nouvelle requête
    if (!doitCharger || etat.cle === cle) return;

    let annule = false;
    chercherLieux(lat, lon)
      .then((lieux) => {
        if (!annule) setEtat({ cle, lieux, error: "" });
      })
      .catch((err) => {
        if (!annule) setEtat({ cle, lieux: [], error: err.message || "Erreur lors du chargement des lieux" });
      });

    return () => {
      annule = true;
    };
  }, [doitCharger, cle, lat, lon, etat.cle]);

  const aJour = etat.cle === cle;
  return {
    lieux: aJour ? etat.lieux : [],
    loading: doitCharger && !aJour,
    error: aJour ? etat.error : "",
  };
}
