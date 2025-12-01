// src/components/AdminPanel/AdminMissions/TasksQuizzesContent.jsx (Revisado)

import React, { useState, useEffect, useCallback } from "react";
import { Briefcase, Plus, Loader, AlertTriangle, Edit, Trash2, Tag } from "lucide-react";
import { fetchTasks, createTask, updateTask, deleteTask, fetchCategories, fetchMissions } from '../../../api/apiFunctions'; 
import TaskQuizModal from './TaskQuizModal'; 

const INITIAL_TASK_STATE = {
    missao_id: null, 
    categoria_id: null, // Obrigatório
    titulo: "",
    descricao: "",
    instrucoes: "",
    pontos: 0,
    tipo: null, // corresponde ao enum TipoTarefa do backend (pode ser null)
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
    const [categories, setCategories] = useState([]); // Para o dropdown de categorias
    const [missionsList, setMissionsList] = useState([]);
    
    // ESTADOS DE FLUXO
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // ESTADOS DE CRIAÇÃO/EDIÇÃO
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTask, setCurrentTask] = useState(INITIAL_TASK_STATE);


    // --- FUNÇÕES DE CARREGAMENTO (READ - GET) ---

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [tasksData, categoriesData] = await Promise.all([
                fetchTasks(),
                fetchCategories() 
            ]);
            // O backend utiliza soft-delete (ativa = false). Filtrar tarefas inativas para que exclusões persistam após atualização.
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
                console.warn('Não foi possível carregar missões para o modal de Tarefa:', err?.message || err);
            }
        })();
    }, []);


    // --- FUNÇÕES DE CONTROLE DO MODAL ---

    const handleModalOpen = (taskToEdit = null) => {
        if (taskToEdit) {
            setIsEditing(true);
            // Deep copy para edição
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


    // --- FUNÇÕES DE API (CREATE/UPDATE/DELETE) ---

    const handleSaveTask = async () => {
        // Validação básica
        if (!currentTask.titulo || !currentTask.categoria_id) {
            alert("Preencha Título e Categoria da Tarefa.");
            return;
        }

        // missao_id é obrigatório no backend
        if (!currentTask.missao_id) {
            alert('Selecione a Missão associada à Tarefa (campo obrigatório).');
            return;
        }
        
           // Se for quiz (presença do objeto quiz), verifica se a pergunta e a resposta estão preenchidas
           if (currentTask.quiz && (!currentTask.quiz?.perguntas?.[0]?.enunciado || !currentTask.quiz.perguntas[0].resposta_correta)) {
               alert("Preencha o Enunciado do Quiz e marque a Resposta Correta.");
               return;
           }

        setIsSaving(true);
        try {
            let result;
            if (isEditing) {
                // Atualiza a Tarefa
                result = await updateTask(currentTask.id, currentTask);
                setTasks(tasks.map(t => t.id === result.id ? result : t));
            } else {
                // Cria a Tarefa
                result = await createTask(currentTask);
                setTasks([...tasks, result]);
            }
            handleModalClose();
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
            alert(`Falha ao salvar a Tarefa: ${errorMsg}`);
            console.error("Erro ao salvar Tarefa:", err, err.response?.data);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTask = async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir esta Tarefa e o Quiz associado?")) {
            return;
        }

        try {
            await deleteTask(id);
            setTasks(tasks.filter(t => t.id !== id));
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            alert(`Falha ao excluir a Tarefa: ${errorMsg}`);
            console.error("Erro ao deletar Tarefa:", err);
        }
    };
    
    // Função auxiliar para buscar o nome da categoria para exibição
    // Prioriza a categoria aninhada em cada tarefa (task.categoria.nome) quando disponível
    const getCategoryName = (task) => {
        if (!task) return 'Sem Categoria';
        if (task.categoria && task.categoria.nome) return task.categoria.nome;
        const id = task.categoria_id;
        return categories.find(c => c.id === id)?.nome || 'Sem Categoria';
    };


    // --- RENDERIZAÇÃO ---

    if (loading) {
        return <div className="text-center p-10"><Loader size={30} className="animate-spin mx-auto text-[#394C97]" /> <p className="mt-2 text-gray-500">Carregando Tarefas e Categorias...</p></div>;
    }

    if (error) {
         return (
             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center gap-3" role="alert">
                 <AlertTriangle size={20} />
                 <span className="block sm:inline">{error}</span>
                 <button onClick={loadData} className="ml-4 underline font-semibold">Tentar Novamente</button>
             </div>
         );
     }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Briefcase size={22}/> Gestão de Tarefas e Quizzes</h3>
                <button
                    onClick={() => handleModalOpen()}
                    className="bg-[#394C97] text-white px-4 py-2 rounded-xl shadow-lg hover:bg-[#2f3f7a] transition flex items-center gap-2 font-semibold disabled:opacity-50"
                    disabled={isSaving}
                >
                    <Plus size={20} />
                    Criar Nova Tarefa
                </button>
            </div>
            
            <div className="grid gap-4">
                {tasks.length === 0 ? (
                    <p className="text-gray-500 p-4 bg-white rounded-lg shadow">Nenhuma tarefa criada ainda.</p>
                ) : (
                    tasks.map((task) => (
                        <div key={task.id} className="bg-white shadow p-4 rounded-xl border-l-4 border-indigo-400 flex justify-between items-center">
                            <div className="flex-1">
                                <p className="text-lg font-bold text-gray-900">{task.titulo}</p>
                                <div className="flex items-center text-sm text-gray-600 gap-4 mt-1">
                                    <p className="flex items-center gap-1"><Tag size={16} /> {getCategoryName(task)}</p>
                                    <p className={`font-semibold ${task.quiz ? 'text-green-600' : 'text-yellow-600'}`}>{task.quiz ? 'Quiz' : (task.tipo || 'Comum')} ({task.pontos} pts)</p>
                                    <p className="text-xs text-gray-400">Ordem: {task.ordem}</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <button onClick={() => handleModalOpen(task)} disabled={isSaving} className="text-blue-600 hover:text-blue-800 p-2 rounded-full transition hover:bg-blue-50 disabled:opacity-50">
                                    <Edit size={20} />
                                </button>
                                <button onClick={() => handleDeleteTask(task.id)} disabled={isSaving} className="text-red-500 hover:text-red-700 p-2 rounded-full transition hover:bg-red-50 disabled:opacity-50">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
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
                    categories={categories} // Passa as categorias para o dropdown
                    missions={missionsList}
                />
            )}
        </div>
    );
};

export default TasksQuizzesContent;