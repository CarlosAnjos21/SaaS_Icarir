import { Link, useLocation } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <nav
      className={`w-full px-6 py-4 flex justify-between items-center fixed top-0 left-0 z-50 ${
        isHome ? "bg-transparent text-[#FEF7EC]" : "bg-[#394C97] text-[#FEF7EC]"
      }`}
    >
      <h1 className="text-xl font-bold text-orange">Gamification</h1>

      <ul className="flex gap-6 text-sm">
        {[
          { name: "Home", path: "/" },
          { name: "Register", path: "/register" },
          { name: "Missions", path: "/missions" },
          { name: "Ranking", path: "/ranking" },
          { name: "Admin", path: "/admin" },
          { name: "Feedbacks", path: "/feedbacks" },
        ].map((item, index) => (
          <li key={index} className="relative group">
            <Link
              to={item.path}
              className={`hover:text-orange transition duration-300 ${
                isHome ? "text-[#FEF7EC]" : "text-[#FEF7EC]"
              }`}
            >
              {item.name}
              <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-orange scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="relative flex items-center gap-4">
        <button className="hover:text-orange transition">
          <MagnifyingGlassIcon className="h-6 w-6" />
        </button>
        <button className="hover:text-orange transition">
          <BellIcon className="h-6 w-6" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="hover:text-orange transition"
          >
            <UserCircleIcon className="h-6 w-6" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-50">
              <Link
                to="/profile"
                className="block px-4 py-2 hover:bg-gray-100 transition"
              >
                Perfil
              </Link>
              <Link
                to="/dashboard"
                className="block px-4 py-2 hover:bg-gray-100 transition"
              >
                Painel
              </Link>
              <Link
                to="/trips"
                className="block px-4 py-2 hover:bg-gray-100 transition"
              >
                Viagens
              </Link>
              <Link
                to="/logout"
                className="block px-4 py-2 hover:bg-gray-100 text-red-500 transition"
              >
                Sair da Conta
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}