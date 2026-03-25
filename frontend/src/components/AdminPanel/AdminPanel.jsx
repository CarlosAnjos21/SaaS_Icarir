import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BarChart2,
  Users,
  Zap,
  Briefcase,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Importa os conteúdos das abas
import DashboardContent from "./DashboardContent";
import UsersContent from "./UsersContent";
import MissionsContent from "./AdminMissions/MissionsContent";
import TasksQuizzesContent from "./AdminMissions/TasksQuizzesContent";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Detecta tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setIsSidebarOpen(false); // fecha sidebar no mobile
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Restaurar aba ativa da query `adminTab`
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("adminTab");
    if (tab && ["dashboard", "missions", "users", "tasks"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Atualiza query param quando muda a aba
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set("adminTab", activeTab);
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  }, [activeTab, location.pathname, location.search, navigate]);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart2, content: <DashboardContent /> },
    { id: "missions", label: "Missões Ativas", icon: Zap, content: <MissionsContent /> },
    { id: "users", label: "Gestão de Usuários", icon: Users, content: <UsersContent /> },
    { id: "tasks", label: "Tarefas", icon: Briefcase, content: <TasksQuizzesContent /> },
  ];

  const currentTab = tabs.find((tab) => tab.id === activeTab);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans overflow-hidden relative">
      {/* SIDEBAR */}
      <motion.aside
        initial={{ width: isSidebarOpen ? 280 : 80 }}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`
          bg-white shadow-2xl border-r border-gray-200 flex flex-col h-screen
          z-50 ${isMobile ? "fixed top-0 left-0" : "relative"}
        `}
      >
        {/* Logo e Toggle */}
        <div className="p-6 flex items-center justify-between">
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-2xl font-extrabold text-[#394C97] tracking-tight whitespace-nowrap"
              >
                Icarir<span className="text-[#FE5900]">. </span>ADM
              </motion.h1>
            )}
          </AnimatePresence>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-4 space-y-3 overflow-y-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                activeTab === tab.id
                  ? "bg-[#394C97] text-white shadow-lg shadow-blue-900/20"
                  : "text-gray-600 hover:bg-blue-50 hover:text-[#394C97]"
              }`}
            >
              <div className={`relative z-10 ${!isSidebarOpen && "mx-auto"}`}>
                <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              </div>
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-medium text-sm whitespace-nowrap relative z-10"
                  >
                    {tab.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {activeTab === tab.id && isSidebarOpen && (
                <ChevronRight size={16} className="ml-auto opacity-50 relative z-10" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors group"
          >
            <LogOut
              size={20}
              className={`group-hover:rotate-180 transition-transform duration-300 ${
                !isSidebarOpen && "mx-auto"
              }`}
            />
            {isSidebarOpen && <span className="font-semibold text-sm">Sair do Sistema</span>}
          </button>
        </div>
      </motion.aside>

      {/* MAIN */}
      <main className="flex-1 h-screen overflow-y-auto bg-gray-50 relative transition-all duration-300">
        <div className="w-full h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {currentTab ? (
                currentTab.content
              ) : (
                <div className="flex items-center justify-center h-screen text-gray-400">
                  Selecione uma opção no menu.
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Overlay para Mobile quando sidebar aberta */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}