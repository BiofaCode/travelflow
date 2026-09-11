import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow">
      <Link to="/" className="font-bold text-xl text-blue-600">TravelFlow</Link>
      <div className="flex gap-4">
        <Link to="/" className="text-gray-600 hover:text-blue-600">Mes voyages</Link>
        <Link to="/login" className="text-gray-600 hover:text-blue-600">Connexion</Link>
      </div>
    </nav>
  );
}
