import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Zap, 
    Settings, 
    Briefcase, 
    Rocket, 
    Map, 
    ListChecks 
} from "lucide-react";

// Importa os subcomponentes de gestão
import MissionListAndCRUD from './MissionListAndCRUD';
import CategoriesContent from './CategoriesContent'; 
import TasksQuizzesContent from './TasksQuizzesContent'; 

const MissionsContent = () => {
    // Estado para controlar a aba interna ativa
    const [internalTab, setInternalTab] = useState("missions");

    const tabs = [
        { 
            id: "missions", 
            label: "Missões (Viagens)", 
            icon: Map, 
            description: "Gerencie destinos e campanhas principais",
            content: <MissionListAndCRUD /> 
        },
        { 
            id: "categories", 
            label: "Categorias", 
            icon: Settings, 
            description: "Classificação de tarefas e objetivos",
            content: <CategoriesContent /> 
        },
        { 
            id: "tasks", 
            label: "Tarefas & Quizzes", 
            icon: ListChecks, 
            description: "Atividades diárias e validação de conhecimento",
            content: <TasksQuizzesContent /> 
        },
    ];

    const currentContent = tabs.find(tab => tab.id === internalTab)?.content;

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
            
            {/* --- BANNER SUPERIOR (Hero Section) --- */}
            <div className="h-64 w-full bg-[#394C97] relative rounded-b-[2.5rem] md:rounded-b-none overflow-hidden">
                {/* Elementos decorativos de fundo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
                
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center pb-10 md:translate-y-2 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-5 text-white"
                    >
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl ring-1 ring-white/20">
                            <Rocket className="w-8 h-8 text-[#FE5900]" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Gestão de Conteúdo</h1>
                            <p className="text-blue-100/90 text-sm md:text-base mt-1 font-light">Controle central de missões, tarefas e engajamento</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* --- CONTEÚDO PRINCIPAL (Sobreposto) --- */}
            <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
                
                {/* MENU DE NAVEGAÇÃO INTERNA (Cards de Abas) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {tabs.map((tab, index) => {
                        const isActive = internalTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setInternalTab(tab.id)}
                                className={`relative overflow-hidden p-4 rounded-xl border transition-all duration-300 text-left flex items-start gap-4 group ${
                                    isActive 
                                    ? "bg-white dark:bg-[#3a3a3a] border-transparent shadow-lg scale-[1.02] ring-1 ring-blue-100 dark:ring-blue-900" 
                                    : "bg-white/80 dark:bg-[#505050] border-transparent hover:bg-white dark:hover:bg-[#3a3a3a] hover:shadow-md text-gray-700 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                                }`}
                            >
                                {/* Indicador de Ativo */}
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeTabIndicator"
                                        className="absolute top-0 left-0 w-1 h-full bg-[#FE5900]" 
                                    />
                                )}

                                <div className={`p-2.5 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-[#394C97] dark:bg-orange-900/20 dark:text-[#FE5900]' : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'}`}>
                                    <tab.icon size={20} />
                                </div>
                                <div>
                                    <span className={`block font-bold text-sm ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'}`}>
                                        {tab.label}
                                    </span>
                                    <span className={`text-xs mt-0.5 block ${isActive ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                        {tab.description}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* ÁREA DE CONTEÚDO DINÂMICO */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[500px] overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={internalTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="p-6"
                        >
                            {currentContent}
                        </motion.div>
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
};

export default MissionsContent;