// src/components/missions/MissionDetails.jsx

import React, { useState } from 'react';
import {
    ArrowLeft,
    Calendar,
    Award,
    Trophy, // Ícone para o Ranking (NOVO)
    User,   // Ícone para o Usuário (NOVO)
} from 'lucide-react';

// IMPORTAÇÕES DOS COMPONENTES FILHOS
import TaskItem from './TaskItem';
import TaskDetailsModal from './TaskDetailsModal';

// ===================================================================
// DADOS MOCKADOS PARA SIMULAR O RANKING DA MISSÃO (NOVO BLOCO)
// Em um projeto real, isso viria da prop 'mission' ou de uma API.
// ===================================================================
const MOCK_RANKING_DATA = [
    { id: 1, name: 'Você (usuário atual)', points: 450, isCurrentUser: true },
    { id: 2, name: 'Alice Silva', points: 510, isCurrentUser: false },
    { id: 3, name: 'Bruno Costa', points: 380, isCurrentUser: false },
    { id: 4, name: 'Carla Dias', points: 320, isCurrentUser: false },
    { id: 5, name: 'Eduardo Reis', points: 290, isCurrentUser: false },
];

// ===================================================================
// COMPONENTE AUXILIAR PARA O RANKING E GRÁFICO (NOVO COMPONENTE)
// ===================================================================
function MissionRanking({ rankingData }) {
    const maxPoints = Math.max(...rankingData.map(item => item.points));

    return (
        // Componente Ranking encapsulado em seu próprio card/div
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center text-xl font-bold text-gray-900 mb-4 border-b pb-3">
                <Trophy className="w-6 h-6 text-yellow-600 mr-3" />
                Ranking da Missão
            </div>
            <div className="space-y-3">
                {rankingData.sort((a, b) => b.points - a.points).map((item, index) => {
                    const progressWidth = maxPoints > 0 ? Math.round((item.points / maxPoints) * 100) : 0;
                    const rank = index + 1;
                    const isCurrentUser = item.isCurrentUser;

                    const itemStyle = isCurrentUser
                        ? 'bg-blue-50 border-2 border-blue-600'
                        : 'bg-gray-50 hover:bg-gray-100 transition-colors';

                    return (
                        <div
                            key={item.id}
                            className={`flex items-center p-3 rounded-lg ${itemStyle}`}
                        >
                            {/* Posição do Ranking */}
                            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold mr-3 ${rank === 1
                                ? 'bg-yellow-500 text-white shadow-md'
                                : 'bg-gray-200 text-gray-700'
                                }`}>
                                {rank}
                            </span>

                            {/* Nome e Pontos */}
                            <div className="flex-1 min-w-0">
                                <p className={`font-semibold truncate ${isCurrentUser ? 'text-blue-700' : 'text-gray-800'}`}>
                                    {isCurrentUser && <User className="w-4 h-4 inline mr-1" />}
                                    {item.name}
                                </p>
                                <p className={`text-xs ${isCurrentUser ? 'text-blue-500' : 'text-gray-500'}`}>
                                    {item.points} pts
                                </p>
                            </div>

                            {/* GRÁFICO DE BARRA */}
                            <div className="w-1/3 ml-4 hidden sm:block">
                                <div className="h-2 bg-gray-200 rounded-full">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-700 ${isCurrentUser ? 'bg-blue-400' : 'bg-green-400'}`}
                                        style={{ width: `${progressWidth}%` }}
                                        title={`${progressWidth}% do máximo de pontos`}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ===================================================================
// COMPONENTE PRINCIPAL: MissionDetails
// ===================================================================
export default function MissionDetails({ mission = {}, onBack, onCompleteStep }) {

    const [selectedTask, setSelectedTask] = useState(null);
    const [activeTab, setActiveTab] = useState('Todas as Tarefas');

    const {
        title,
        deadline,
        category,
        accumulatedPoints,
        totalTasks,
        completedTasks,
        tasks = []
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

                {/* Bloco 1: HEADER E PROGRESSO (O Card Principal - Original) */}
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

                {/* Bloco 3: GUIAS DE FILTRO DE TAREFAS (Original) */}
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

                {/* Bloco 4: LISTA DE TAREFAS FILTRADAS (Original) */}
                <div className="space-y-4">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onTaskClick={handleTaskClick}
                                onComplete={() => onCompleteStep(task.id)}
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 italic text-center p-4 bg-white rounded-lg shadow">
                            Nenhuma tarefa nesta categoria.
                        </p>
                    )}
                </div>
                <hr className="my-6 border-gray-100" />


                <hr className="my-6 border-gray-100" />
            </div>
            {/* Bloco 2: NOVO RANKING (Div separada) */}
            <MissionRanking rankingData={MOCK_RANKING_DATA} />

            {/* RENDERIZAÇÃO DO MODAL DE DETALHES DA TAREFA */}
            {/* Adicionado o condicional para renderizar o Modal apenas se houver uma tarefa selecionada */}
            {selectedTask && (
                <TaskDetailsModal
                    task={selectedTask}
                    onClose={handleCloseModal}
                    onComplete={() => {
                        onCompleteStep(selectedTask.id);
                        handleCloseModal();
                    }}
                />
            )}
        </div>
    );
}