import { Link, useLocation, useNavigate } from "react-router-dom"; // 🛑 Adicionado useNavigate
import {
    MagnifyingGlassIcon,
    BellIcon,
    UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import logoIcarir from "../assets/símbolo-icarir.png";

export default function Navbar() {
    const navigate = useNavigate(); // 🛑 Inicialização do hook de navegação
    
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolledEnough, setScrolledEnough] = useState(false);

    // Inicialização direta e clara do estado de autenticação.
    const [isAuthenticated, setIsAuthenticated] = useState(
        !!localStorage.getItem("token")
    );

    const location = useLocation();
    const isHome = location.pathname === "/";

    // monitorar scroll
    useEffect(() => {
        const handleScroll = () => setScrolledEnough(window.scrollY > 700);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Monitoramento robusto de login/logout (usando 'storage' para sincronizar abas).
    useEffect(() => {
        const checkAuth = () => {
            setIsAuthenticated(!!localStorage.getItem("token"));
        };
        // Inicializa a verificação na montagem e monitora mudanças de storage
        window.addEventListener("storage", checkAuth);
        checkAuth(); // Verifica na montagem para pegar o estado atual
        return () => window.removeEventListener("storage", checkAuth);
    }, []);

    // 🚨 CORREÇÃO: Função dedicada para Log Out usando useNavigate.
    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setMenuOpen(false);
        // 🚀 CORREÇÃO: Usa useNavigate para evitar REFRESH total da página
        navigate("/login"); 
    };

    const isTransparent = isHome && !scrolledEnough;

    const navbarClasses = `w-full px-8 py-3 flex justify-between items-center fixed top-0 left-0 z-50 backdrop-blur-md transition-all duration-500 ${isTransparent
                ? "bg-transparent text-white"
                : "bg-white text-[#394C97] shadow-md"
            }`;

    // Links principais da navegação (Desktop e Mobile)
    const navLinks = [
        { name: "Início", path: "/" },
        // Use um ternário ou 'null' para o Cadastro/Registro
        /*isAuthenticated ? null :*/ { name: "Cadastro", path: "/register" },
        { name: "Missão", path: "/missions" },
        { name: "Classificação", path: "/ranking" },
        { name: "Administrador", path: "/admin" },
        /*{ name: "Sorteio", path: "/Sorteio" },*/
    ].filter(Boolean); // Remove o item nulo (Cadastro) se o usuário estiver logado.

    // Array para mapear os itens do menu de usuário
    const userMenuItems = [
        { name: "Perfil", path: "/profile", isLogout: false },
        { name: "Painel", path: "/carreira", isLogout: false },
        { name: "Viagens", path: "/trips", isLogout: false },
        // O item 'Sair' é marcado como isLogout para usar o `handleLogout`
        { name: "Sair da Conta", path: "/login", isLogout: true, danger: true },
    ];


    return (
        <nav className={navbarClasses}>
            {/* LOGO */}
            <Link to="/" className="flex items-center gap-2">
                <img
                    src={logoIcarir}
                    alt="Logo ICARIR"
                    className="h-12 w-auto transition-transform duration-300 hover:scale-105"
                />
            </Link>

            {/* MENU DESKTOP */}
            <ul className="hidden md:flex gap-8 text-sm font-medium tracking-wide">
                {navLinks.map((item, index) => (
                    <li key={index} className="relative group">
                        <Link
                            to={item.path}
                            className={`transition duration-300 ${isTransparent ? "text-white" : "text-[#394C97]"
                                } hover:text-orange`}
                        >
                            {item.name}
                            <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-orange scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
                        </Link>
                    </li>
                ))}
            </ul>

            {/* ÍCONES */}
            <div className="relative flex items-center gap-5">

                {/* Instagram */}
                <a
                    href="https://www.instagram.com/escoladeempreendedores"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:text-orange transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm8.75 2.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
                    </svg>
                    <span>Instagram</span>
                </a>

                {/* Mobile burger */}
                <div className="md:hidden">
                    <button
                        onClick={() => setMobileMenuOpen((prev) => !prev)}
                        className="hover:text-orange transition focus:outline-none"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                <MagnifyingGlassIcon className="h-6 w-6 hover:text-orange cursor-pointer" />
                <BellIcon className="h-6 w-6 hover:text-orange cursor-pointer" />

                {/* **MENU USER** */}
                <div className="relative">
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="hover:text-orange transition focus:outline-none"
                    >
                        <UserCircleIcon className="h-6 w-6" />
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 mt-3 w-52 bg-white text-[#394C97] rounded-lg shadow-xl border border-[#394C97] z-50">
                            <ul className="flex flex-col">
                                {isAuthenticated ? (
                                    userMenuItems.map((item, index) => (
                                        <li key={index}>
                                            {item.isLogout ? (
                                                // Botão de Log Out usa a função dedicada
                                                <button
                                                    onClick={handleLogout}
                                                    className={`block w-full text-left px-5 py-3 text-sm hover:bg-gray-100 transition ${item.danger ? "text-red-500" : ""}`}
                                                >
                                                    {item.name}
                                                </button>
                                            ) : (
                                                // Links normais
                                                <Link
                                                    to={item.path}
                                                    className={`block px-5 py-3 text-sm hover:bg-gray-100 transition ${item.danger ? "text-red-500" : ""}`}
                                                    onClick={() => setMenuOpen(false)}
                                                >
                                                    {item.name}
                                                </Link>
                                            )}
                                        </li>
                                    ))
                                ) : (
                                    // Se não estiver autenticado, pode mostrar o link para Login
                                    <li>
                                        <Link
                                            to="/login"
                                            onClick={() => setMenuOpen(false)}
                                            className="block px-5 py-3 text-sm hover:bg-gray-100 transition text-[#394C97] font-semibold"
                                        >
                                            Login
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* MOBILE DROPDOWN */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full right-8 mt-3 w-52 bg-white text-[#394C97] rounded-lg shadow-xl border border-[#394C97] z-50">
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
                         {/* Adiciona link de Login/Perfil no mobile se não estiver nos navLinks */}
                        {!isAuthenticated && (
                            <li>
                                <Link
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-5 py-3 text-sm hover:bg-gray-100 transition font-semibold"
                                >
                                    Login
                                </Link>
                            </li>
                        )}
                        {/* Se estiver autenticado, adiciona Sair da Conta no menu mobile */}
                        {isAuthenticated && (
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-5 py-3 text-sm text-red-500 hover:bg-gray-100 transition"
                                >
                                    Sair da Conta
                                </button>
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </nav>
    );
}
