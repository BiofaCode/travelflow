à venirimport { useContext } from "react";
import { AuthContext } from "../context/authContext";

// juste un raccourci pour pas écrire useContext(AuthContext) à chaque fois
export function useAuth() {
  return useContext(AuthContext);
}
