import React, { useState } from 'react';
import {
    ArrowLeft,
    Calendar,
    Award,
} from 'lucide-react'; // Importamos APENAS os ícones usados DIRETAMENTE AQUI

// IMPORTAÇÕES DOS COMPONENTES FILHOS
// Estes arquivos devem existir na mesma pasta ou no caminho relativo correto:
import TaskItem from './TaskItem';
import TaskDetailsModal from './TaskDetailsModal';

// ===================================================================
// DADOS MOCKADOS (Mantidos)
// ===================================================================
const missionData = {
    id: 'Q4_MARKET_ANALYSIS',
    title: 'Análise de Mercado Q4',
    deadline: '25/11/2025',
    category: 'Estratégia',
    accumulatedPoints: 275, // Corrigido para 275 pts, como na imagem
    totalTasks: 8,
    completedTasks: 3,
    description: 'Esta missão é focada na consolidação dos resultados e planejamento estratégico do último trimestre do ano fiscal (Q4). Inclui tarefas de conhecimento, administrativas e de engajamento da equipe.',
    tasks: [
        { id: 1, name: 'Quiz: Fundamentos de Q4', description: 'Acerte 80% do quiz sobre os pilares estratégicos da análise de mercado.', points: 250, status: 'PENDENTE', category: 'Conhecimento' },
        { id: 2, name: 'Flashcards: Termos Técnicos', description: 'Revisar e marcar 100% dos flashcards de vocabulário do setor.', points: 150, status: 'PENDENTE', category: 'Conhecimento' },
        { id: 3, name: 'Envio: Documento de Escopo', description: 'Fazer upload do rascunho final do documento de escopo da missão.', points: 100, status: 'CONCLUÍDA', category: 'Administrativas' },
        { id: 4, name: 'Preencher Formulário de Feedback', description: 'Submeter o formulário obrigatório de autoavaliação de riscos.', points: 50, status: 'PENDENTE', category: 'Administrativas' },
        { id: 5, name: 'Postagem no LinkedIn', description: 'Publicar um resumo dos objetivos da missão na rede social da empresa.', points: 100, status: 'CONCLUÍDA', category: 'Engajamento' },
        { id: 6, name: 'Comentar 3 Posts da Equipe', description: 'Interagir de forma construtiva em pelo menos 3 publicações de colegas.', points: 75, status: 'CONCLUÍDA', category: 'Engajamento' },
        { id: 7, name: 'Revisão de Metas Q4', description: 'Enviar relatório consolidado da revisão de metas.', points: 20, status: 'PENDENTE', category: 'Administrativas' },
        { id: 8, name: 'Brainstorm com Time', description: 'Participar da sessão de Brainstorm sobre a nova estratégia.', points: 40, status: 'PENDENTE', category: 'Conhecimento' },
    ],
};

// ===================================================================
// COMPONENTE PRINCIPAL: MissionDetails
// ===================================================================
export default function MissionDetails({ mission = {}, onBack, onCompleteStep }) {

    const [selectedTask, setSelectedTask] = useState(null); // Estado para a tarefa selecionada
    const [activeTab, setActiveTab] = useState('Todas as Tarefas');

    // Lógica de Estado
    const handleTaskClick = (task) => {
        setSelectedTask(task);
    };

    const handleCloseModal = () => {
        setSelectedTask(null);
    };

    const {
        title,
        deadline,
        category,
        accumulatedPoints,
        totalTasks,
        completedTasks,
        tasks = []
    } = { ...missionData, ...mission };

    // Lógica para agrupar tarefas por categoria para as tabs
    const tasksByCategory = tasks.reduce((acc, task) => {
        if (!acc[task.category]) {
            acc[task.category] = [];
        }
        acc[task.category].push(task);
        return acc;
    }, {});

    const tabs = [
        { name: 'Todas as Tarefas', key: 'Todas as Tarefas', count: tasks.length },
        { name: 'Conhecimento', key: 'Conhecimento', count: tasksByCategory.Conhecimento?.length || 0 },
        { name: 'Administrativas', key: 'Administrativas', count: tasksByCategory.Administrativas?.length || 0 },
        { name: 'Engajamento', key: 'Engajamento', count: tasksByCategory.Engajamento?.length || 0 },
    ];

    const filteredTasks = activeTab === 'Todas as Tarefas'
        ? tasks
        : tasks.filter(task => task.category === activeTab);

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
                        **Prazo:** {deadline} • **Categoria:** {category}
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
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 italic text-center p-4">
                            Nenhuma tarefa nesta categoria.
                        </p>
                    )}
                </div>
            </div>

            {/* RENDERIZAÇÃO DO MODAL DE DETALHES DA TAREFA */}
            <TaskDetailsModal task={selectedTask} onClose={handleCloseModal} />

        </div>
    );
}