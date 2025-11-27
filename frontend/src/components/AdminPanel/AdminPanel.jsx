// src/components/AdminPanel/AdminPanel.jsx (FINALMENTE COMPLETO)

import { useState } from "react";
import { BarChart2, Users, Settings, Zap, Briefcase, HelpCircle } from "lucide-react";

// Importa os componentes desmembrados
import DashboardContent from './DashboardContent'; 
import UsersContent from './UsersContent'; 
import MissionsContent from './AdminMissions/MissionsContent'; // ⬅️ NOVO IMPORT FINAL

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState("dashboard");

    const tabs = [
        { id: "dashboard", label: "Dashboard", icon: BarChart2, content: <DashboardContent /> }, 
        
        // ⬅️ NOVO: Missões com conteúdo desmembrado!
        { id: "missions", label: "Missões Ativas", icon: Zap, content: <MissionsContent /> },
        
        { id: "users", label: "Gestão de Usuários", icon: Users, content: <UsersContent /> },
        
        // Abas Adicionais
        { id: "tasks", label: "Tarefas", icon: Briefcase, content: <p className="text-gray-600 p-6 bg-white rounded-xl shadow-lg">Gerencie tarefas vinculadas às missões.</p> },
        { id: "quizzes", label: "Quizzes", icon: HelpCircle, content: <p className="text-gray-600 p-6 bg-white rounded-xl shadow-lg">Crie quizzes interativos.</p> },
        { id: "settings", label: "Configurações", icon: Settings, content: <p className="text-gray-600 p-6 bg-white rounded-xl shadow-lg">Ajuste preferências do sistema.</p> },
    ];
    
    const currentTab = tabs.find(tab => tab.id === activeTab);

    // O restante do layout (que você me enviou no início)
    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-xl p-6 border-r border-gray-200 sticky top-0 h-screen overflow-y-auto">
                <h1 className="text-3xl font-extrabold text-[#394C97] mb-8">Icarir Admin</h1>
                <nav className="space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center gap-3 ${
                                activeTab === tab.id
                                    ? "bg-[#394C97] text-white font-semibold shadow-md"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-[#FE5900]"
                            }`}
                        >
                            <tab.icon size={20} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Conteúdo principal */}
            <main className="flex-1 p-10 max-w-full overflow-x-hidden pt-[150px]">
                <header className="fixed top-0 left-64 right-0 bg-gray-100 z-10 p-10 pb-4 border-b border-gray-200 pt-[90px]">
                    <h1 className="text-4xl font-extrabold text-gray-900">{currentTab?.label || 'Painel'}</h1>
                </header>
                <div className="max-w-7xl mx-auto">
                    {currentTab ? currentTab.content : <p className="text-gray-500">Selecione uma opção no menu lateral.</p>}
                </div>
            </main>
        </div>
    );
}