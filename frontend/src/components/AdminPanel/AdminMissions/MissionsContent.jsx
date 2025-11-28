// src/components/AdminPanel/AdminMissions/MissionsContent.jsx (Atualizado como Container)

import React, { useState } from "react";
import { Zap, Settings, Briefcase } from "lucide-react";

// Importa os subcomponentes de gestão
import MissionListAndCRUD from './MissionListAndCRUD';
import CategoriesContent from './CategoriesContent'; 
import TasksQuizzesContent from './TasksQuizzesContent'; // O componente que acabamos de implementar

const MissionsContent = () => {
    // Estado para controlar a aba interna ativa
    const [internalTab, setInternalTab] = useState("missions");

    const tabs = [
        { id: "missions", label: "Missões (Viagens)", icon: Zap, content: <MissionListAndCRUD /> },
        { id: "categories", label: "Categorias de Tarefas", icon: Settings, content: <CategoriesContent /> },
        { id: "tasks", label: "Tarefas & Quizzes", icon: Briefcase, content: <TasksQuizzesContent /> },
    ];

    const currentContent = tabs.find(tab => tab.id === internalTab)?.content;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">🚀 Gestão de Conteúdo Central</h2>
            
            {/* Barra de Navegação Interna */}
            <div className="flex border-b border-gray-300 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setInternalTab(tab.id)}
                        className={`px-6 py-3 font-semibold transition flex items-center gap-2 ${
                            internalTab === tab.id
                                ? "border-b-4 border-[#FE5900] text-[#FE5900]"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        <tab.icon size={20} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Conteúdo da Aba Interna */}
            <div className="p-4">
                {currentContent}
            </div>
        </div>
    );
};

export default MissionsContent;