// src/components/missions/MissionDetails.jsx (Corrigido para usar dados da prop)

import React, { useState } from 'react';
import {
    ArrowLeft,
    Calendar,
    Award,
} from 'lucide-react';

// IMPORTAÇÕES DOS COMPONENTES FILHOS
import TaskItem from './TaskItem';
import TaskDetailsModal from './TaskDetailsModal';

// ===================================================================
// DADOS MOCKADOS FORAM REMOVIDOS DESTE ARQUIVO!
// O componente agora depende EXCLUSIVAMENTE da prop 'mission'.
// ===================================================================

// ===================================================================
// COMPONENTE PRINCIPAL: MissionDetails
// ===================================================================
export default function MissionDetails({ mission = {}, onBack, onCompleteStep }) {

    const [selectedTask, setSelectedTask] = useState(null);
    // Usamos 'mission.tasks' para determinar as categorias, por isso inicializamos as tabs
    const [activeTab, setActiveTab] = useState('Todas as Tarefas');

    // Desestruturando APENAS da prop 'mission' (que vem com dados da API e normalizada)
    const {
        title,
        deadline,
        category,
        accumulatedPoints,
        totalTasks,
        completedTasks,
        tasks = [] // Garante que 'tasks' seja sempre um array, mesmo que vazio
    } = mission;

    // Lógica de Estado
    const handleTaskClick = (task) => {
        setSelectedTask(task);
    };

    const handleCloseModal = () => {
        setSelectedTask(null);
    };

    // Lógica para agrupar tarefas por categoria para as tabs (usando as tarefas REAIS)
    const tasksByCategory = tasks.reduce((acc, task) => {
        // A categoria deve vir do objeto task (definida na normalização em Missions.jsx)
        const cat = task.category || 'Outras';
        if (!acc[cat]) {
            acc[cat] = [];
        }
        acc[cat].push(task);
        return acc;
    }, {});

    // Gera as guias dinamicamente com base nas categorias presentes
    const dynamicTabs = Object.keys(tasksByCategory).map(cat => ({
        name: cat,
        key: cat,
        count: tasksByCategory[cat].length
    }));

    const tabs = [
        { name: 'Todas as Tarefas', key: 'Todas as Tarefas', count: tasks.length },
        ...dynamicTabs
    ];

    const filteredTasks = activeTab === 'Todas as Tarefas'
        ? tasks
        : tasks.filter(task => (task.category || 'Outras') === activeTab);

    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <div className="p-4 sm:p-6 md:p-10 min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto">

                {/* HEADER E PROGRESSO */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    {/* Botão Voltar */}
                    <button
                        className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4 transition-colors"
                        onClick={onBack}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar para Missões
                    </button>

                    {/* Título e Metadados */}
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
                        {title}
                    </h1>
                    <p className="text-sm text-gray-500 mb-4">
                        <Calendar className="w-4 h-4 inline mr-1 text-gray-400" />
                        **Prazo:** {deadline || 'Não definido'} • **Categoria:** {category || 'Geral'}
                    </p>

                    <hr className="my-4 border-gray-100" />

                    {/* Resumo de Pontos e Progresso */}
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div className="flex items-center">
                            <Award className="w-6 h-6 text-orange-500 mr-3" />
                            <div>
                                <span className="text-xl font-bold text-gray-700 block">
                                    Pontos Acumulados na Missão:
                                </span>
                                <span className="text-3xl font-extrabold text-orange-600">
                                    {accumulatedPoints} pts
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold text-gray-700 mb-1">
                                Progresso: {completedTasks}/{totalTasks} Tarefas
                            </span>
                            <div className="w-40 bg-gray-200 h-2 rounded-full">
                                <div
                                    className="h-2 bg-blue-600 rounded-full transition-all duration-500"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="my-6 border-gray-100" />

                {/* GUIAS DE FILTRO DE TAREFAS */}
                <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            className={`py-3 px-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.key
                                ? 'border-orange-500 text-orange-600 font-semibold'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.name} ({tab.count})
                        </button>
                    ))}
                </div>

                {/* LISTA DE TAREFAS FILTRADAS */}
                <div className="space-y-4">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onTaskClick={handleTaskClick}
                                onComplete={() => onCompleteStep(task.id)} // Passa a função de conclusão para a tarefa
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 italic text-center p-4 bg-white rounded-lg shadow">
                            Nenhuma tarefa nesta categoria.
                        </p>
                    )}
                </div>
            </div>

            {/* RENDERIZAÇÃO DO MODAL DE DETALHES DA TAREFA */}
            <TaskDetailsModal task={selectedTask} onClose={handleCloseModal} onComplete={() => onCompleteStep(selectedTask.id)} />

        </div>
    );
}