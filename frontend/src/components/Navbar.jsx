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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolledEnough, setScrolledEnough] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // 👈 Novo estado
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolledEnough(window.scrollY > 700);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Simulação de verificação de login (pode ser substituído por token real)
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  const isTransparent = isHome && !scrolledEnough;

  const navbarClasses = `w-full px-8 py-3 flex justify-between items-center fixed top-0 left-0 z-50 backdrop-blur-md transition-all duration-500 ${
    isTransparent
      ? "bg-transparent text-white"
      : "bg-white text-[#394C97] shadow-md"
  }`;

  const navLinks = [
    { name: "Home", path: "/" },
    !isAuthenticated && { name: "Register", path: "/register" }, // 👈 Condicional
    { name: "Missions", path: "/missions" },
    { name: "Ranking", path: "/ranking" },
    { name: "Admin", path: "/admin" },
    { name: "Sorteio", path: "/Sorteio" },
    /* { name: "Feedbacks", path: "/feedbacks" }, */
  ].filter(Boolean); // 👈 Remove valores falsos

  return (
    <nav className={navbarClasses}>
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <img
          src={logoIcarir}
          alt="Logo ICARIR"
          className="h-12 w-auto transition-transform duration-300 hover:scale-105"
        />
      </Link>

      {/* Navegação principal (desktop) */}
      <ul className="hidden md:flex gap-8 text-sm font-medium tracking-wide">
        {navLinks.map((item, index) => (
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

      {/* Ícones e menus */}
      <div className="relative flex items-center gap-5">
        <a
          href="https://www.instagram.com/escoladeempreendedores"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm hover:text-orange transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm8.75 2.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
          </svg>
          <span>Instagram</span>
        </a>

        {/* Botão menu mobile */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="hover:text-orange transition focus:outline-none"
            aria-label="Abrir menu mobile"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Ícones de busca e notificação */}
        <button className="hover:text-orange transition focus:outline-none">
          <MagnifyingGlassIcon className="h-6 w-6" />
        </button>
        <button className="hover:text-orange transition focus:outline-none">
          <BellIcon className="h-6 w-6" />
        </button>

        {/* Ícone de usuário */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="hover:text-orange transition focus:outline-none"
          >
            <UserCircleIcon className="h-6 w-6" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-3 w-52 bg-white text-[#394C97] rounded-lg shadow-xl overflow-hidden border border-[#394C97] z-50 transition duration-300">
              <ul className="flex flex-col">
                {[
                  { name: "Perfil", path: "/profile" },
                  { name: "Painel", path: "/carreira" },
                  { name: "Viagens", path: "/trips" },
                  { name: "Sair da Conta", path: "/logout", danger: true },
                ].map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.path}
                      className={`block px-5 py-3 text-sm hover:bg-gray-100 transition ${
                        item.danger ? "text-red-500" : ""
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Menu suspenso mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full right-8 mt-3 w-52 bg-white text-[#394C97] rounded-lg shadow-xl border border-[#394C97] z-50 transition duration-300">
          <ul className="flex flex-col">
            {navLinks.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  className="block px-5 py-3 text-sm hover:bg-gray-100 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}