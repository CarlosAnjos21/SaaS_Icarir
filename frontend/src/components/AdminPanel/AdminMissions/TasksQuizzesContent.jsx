import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Briefcase, 
    Plus, 
    Loader, 
    AlertTriangle, 
    Edit, 
    Trash2, 
    Tag, 
    ListChecks, 
    FileText, 
    CheckSquare, 
    Trophy,
    RefreshCw
} from "lucide-react";
import { fetchTasks, createTask, updateTask, deleteTask, fetchCategories, fetchMissions } from '../../../api/apiFunctions'; 
import TaskQuizModal from './TaskQuizModal'; 

const INITIAL_TASK_STATE = {
    missao_id: null, 
    categoria_id: null, 
    titulo: "",
    descricao: "",
    instrucoes: "",
    pontos: 0,
    tipo: null, 
    dificuldade: 'facil',
    ordem: 0,
    ativa: true,
    requisitos: null,
    tarefa_anterior_id: null,
    quiz: null,
};

const TasksQuizzesContent = () => {
    // ESTADOS DE DADOS
    const [tasks, setTasks] = useState([]);
    const [categories, setCategories] = useState([]); 
    const [missionsList, setMissionsList] = useState([]);
    
    // ESTADOS DE FLUXO
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // ESTADOS DE CRIAÇÃO/EDIÇÃO
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTask, setCurrentTask] = useState(INITIAL_TASK_STATE);

    // --- FUNÇÕES DE CARREGAMENTO ---

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [tasksData, categoriesData] = await Promise.all([
                fetchTasks(),
                fetchCategories() 
            ]);
            // O backend utiliza soft-delete (ativa = false). 
            setTasks(Array.isArray(tasksData) ? tasksData.filter(t => t.ativa !== false) : []);
            setCategories(categoriesData);
        } catch (err) {
            setError(`Falha ao carregar dados: ${err.message || 'Erro de conexão'}`);
            console.error("Erro ao carregar Tarefas/Categorias:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        (async () => {
            try {
                const ms = await fetchMissions();
                setMissionsList(ms);
            } catch (err) {
                console.warn('Não foi possível carregar missões para o modal:', err?.message || err);
            }
        })();
    }, []);

    // --- HANDLERS ---

    const handleModalOpen = (taskToEdit = null) => {
        if (taskToEdit) {
            setIsEditing(true);
            setCurrentTask(JSON.parse(JSON.stringify(taskToEdit))); 
        } else {
            setIsEditing(false);
            setCurrentTask(INITIAL_TASK_STATE);
        }
        setShowModal(true);
        setError(null);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setIsEditing(false);
        setCurrentTask(INITIAL_TASK_STATE);
    };

    const handleSaveTask = async () => {
        if (!currentTask.titulo || !currentTask.categoria_id) {
            alert("Preencha Título e Categoria da Tarefa.");
            return;
        }

        if (!currentTask.missao_id) {
            alert('Selecione a Missão associada à Tarefa (campo obrigatório).');
            return;
        }
        
        if (currentTask.quiz && (!currentTask.quiz?.perguntas?.[0]?.enunciado || !currentTask.quiz.perguntas[0].resposta_correta)) {
            alert("Preencha o Enunciado do Quiz e marque a Resposta Correta.");
            return;
        }

        setIsSaving(true);
        try {
            let result;
            if (isEditing) {
                result = await updateTask(currentTask.id, currentTask);
                setTasks(prev => prev.map(t => t.id === result.id ? result : t));
            } else {
                result = await createTask(currentTask);
                setTasks(prev => [...prev, result]);
            }
            handleModalClose();
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
            alert(`Falha ao salvar a Tarefa: ${errorMsg}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTask = async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir esta Tarefa e o Quiz associado?")) return;

        try {
            await deleteTask(id);
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            alert(`Falha ao excluir a Tarefa: ${errorMsg}`);
        }
    };
    
    const getCategoryName = (task) => {
        if (!task) return 'Sem Categoria';
        if (task.categoria && task.categoria.nome) return task.categoria.nome;
        const id = task.categoria_id;
        return categories.find(c => c.id === id)?.nome || 'Sem Categoria';
    };

    // --- RENDERIZAÇÃO ---

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Loader size={32} className="animate-spin text-[#394C97] mb-4" /> 
                <p className="text-gray-500 font-medium text-sm">Sincronizando atividades...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
            
            {/* --- BANNER SUPERIOR --- */}
            <div className="h-64 w-full bg-[#394C97] relative rounded-b-[2.5rem] md:rounded-b-none overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center pb-10 md:translate-y-2 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-5 text-white"
                    >
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl ring-1 ring-white/20">
                            <ListChecks className="w-6 h-6 text-[#FE5900]" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Tarefas e Quizzes</h1>
                            <p className="text-blue-100/90 text-sm md:text-base mt-1 font-light">Gerencie atividades práticas e avaliações de conhecimento</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
                
                {/* Header de Ações */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/50 text-sm text-gray-600 font-medium shadow-sm">
                        Total de Atividades: <span className="text-[#394C97] font-bold">{tasks.length}</span>
                    </div>

                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => handleModalOpen()}
                        className="bg-[#FE5900] text-white px-6 py-3 rounded-xl shadow-lg hover:bg-[#e04f00] hover:shadow-orange-500/20 transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-wide transform hover:-translate-y-0.5"
                        disabled={isSaving}
                    >
                        <Plus size={16} strokeWidth={3} />
                        Criar Nova Tarefa
                    </motion.button>
                </div>

                {/* Erro */}
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between gap-3 mb-6 shadow-sm text-sm"
                    >
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={16} />
                            <span>{error}</span>
                        </div>
                        <button onClick={loadData} className="p-1.5 hover:bg-red-100 rounded-md transition-colors">
                            <RefreshCw size={14} />
                        </button>
                    </motion.div>
                )}
                
                {/* Grid de Tarefas */}
                <div className="grid gap-4">
                    <AnimatePresence>
                        {tasks.length === 0 && !error ? (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }}
                                className="p-12 text-center text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center"
                            >
                                <Briefcase size={40} className="mb-3 opacity-20" />
                                <p className="text-sm font-medium">Nenhuma tarefa criada ainda.</p>
                                <p className="text-xs mt-1 opacity-70">Clique no botão acima para começar.</p>
                            </motion.div>
                        ) : (
                            tasks.map((task, index) => (
                                <motion.div 
                                    key={task.id} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden"
                                >
                                    {/* Barra lateral colorida baseada no tipo */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${task.quiz ? 'bg-indigo-500' : 'bg-amber-500'}`} />

                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pl-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {task.quiz ? (
                                                    <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1 border border-indigo-100">
                                                        <CheckSquare size={10} /> Quiz
                                                    </span>
                                                ) : (
                                                    <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1 border border-amber-100">
                                                        <FileText size={10} /> Tarefa
                                                    </span>
                                                )}
                                                <span className="text-gray-300 text-xs">•</span>
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Tag size={12} /> {getCategoryName(task)}
                                                </span>
                                            </div>
                                            
                                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-[#394C97] transition-colors">
                                                {task.titulo}
                                            </h3>
                                            
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
                                                    <Trophy size={12} className="text-[#FE5900]" /> 
                                                    {task.pontos} XP
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    Ordem: {task.ordem}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleModalOpen(task)} 
                                                disabled={isSaving} 
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                title="Editar Tarefa"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteTask(task.id)} 
                                                disabled={isSaving} 
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                title="Excluir Tarefa"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Modal de Tarefa/Quiz */}
            {showModal && (
                <TaskQuizModal 
                    task={currentTask}
                    setTask={setCurrentTask}
                    handleSave={handleSaveTask}
                    handleClose={handleModalClose}
                    isEditing={isEditing}
                    isLoading={isSaving}
                    categories={categories} 
                    missions={missionsList}
                />
            )}
        </div>
    );
};

export default TasksQuizzesContent;