export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow">
      <span className="font-bold text-xl text-blue-600">TravelFlow</span>
      <div className="flex gap-4">
        <a href="/" className="text-gray-600 hover:text-blue-600">Mes voyages</a>
        <a href="/login" className="text-gray-600 hover:text-blue-600">Connexion</a>
      </div>
    </nav>
  );
}