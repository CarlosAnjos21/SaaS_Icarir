import { Link, useLocation } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import logoIcarir from "../assets/símbolo-icarir.png";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolledEnough, setScrolledEnough] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolledEnough(scrollY > 700);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isTransparent = isHome && !scrolledEnough;

  const navbarClasses = `w-full px-8 py-3 flex justify-between items-center fixed top-0 left-0 z-50 backdrop-blur-md transition-all duration-500 ${
    isTransparent ? "bg-transparent text-white" : "bg-white text-[#394C97] shadow-md"
  }`;

  return (
    <nav className={navbarClasses}>
      <Link to="/" className="flex items-center gap-2">
        <img
          src={logoIcarir}
          alt="Logo ICARIR"
          className="h-10 w-auto transition-transform duration-300 hover:scale-105"
        />
      </Link>

      <ul className="flex gap-8 text-sm font-medium tracking-wide">
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
              className={`transition duration-300 ${
                isTransparent ? "text-white" : "text-[#394C97]"
              } hover:text-orange`}
            >
              {item.name}
              <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-orange scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="relative flex items-center gap-5">
        <button className="hover:text-orange transition focus:outline-none focus:ring-0 focus:shadow-none">
          <MagnifyingGlassIcon className="h-6 w-6" />
        </button>
        <button className="hover:text-orange transition focus:outline-none focus:ring-0 focus:shadow-none">
          <BellIcon className="h-6 w-6" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="hover:text-orange transition focus:outline-none focus:ring-0 focus:shadow-none"
          >
            <UserCircleIcon className="h-6 w-6" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-3 w-52 bg-white text-[#394C97] rounded-lg shadow-xl overflow-hidden animate-fade-in z-50">
              {[
                { name: "Perfil", path: "/profile" },
                { name: "Painel", path: "/dashboard" },
                { name: "Viagens", path: "/trips" },
                { name: "Sair da Conta", path: "/logout", danger: true },
              ].map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className={`block px-5 py-3 text-sm hover:bg-gray-100 transition ${
                    item.danger ? "text-red-500" : ""
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}