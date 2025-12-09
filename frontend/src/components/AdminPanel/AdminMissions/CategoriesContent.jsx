import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Settings, 
    Plus, 
    Loader, 
    AlertTriangle, 
    RefreshCw, 
    Layers, 
    FolderOpen 
} from 'lucide-react';
import { fetchCategories, createCategory, updateCategory, deleteCategory, createTask, updateTask, deleteTask, fetchMissions } from '../../../api/apiFunctions'; 
import CategoryModal from './CategoryModal';
import CategoryCard from './CategoryCard';
import TaskQuizModal from './TaskQuizModal';

const INITIAL_CATEGORY_STATE = {
    nome: "",
    descricao: "",
    icone: "",
    cor: "#000000",
    ordem: 0,
};

const CategoriesContent = () => {
    // ESTADOS
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Estado do Modal de Categoria
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(INITIAL_CATEGORY_STATE);
    
    // Estado do modal de Tarefa
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [isTaskSaving, setIsTaskSaving] = useState(false);
    const [missionsList, setMissionsList] = useState([]);

    // FUNÇÃO DE CARREGAMENTO (READ - GET)
    const loadCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch (err) {
            setError(`Falha ao carregar categorias: ${err.message || 'Erro de conexão'}`);
            console.error("Erro ao carregar categorias:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    useEffect(() => {
        // carregar missões para seleção opcional ao criar tarefas fora do contexto de uma missão
        (async () => {
            try {
                const ms = await fetchMissions();
                setMissionsList(ms);
            } catch (err) {
                // ignorar erro: carregar missões não é crítico aqui
            }
        })();
    }, []);


    // --- FUNÇÕES DE CRUD CATEGORIA ---

    const handleCreateEdit = async (data) => {
        setIsSaving(true);
        try {
            let result;
            if (isEditing && data.id) {
                result = await updateCategory(data.id, data);
                setCategories(categories.map(c => c.id === result.id ? result : c));
            } else {
                result = await createCategory(data);
                setCategories([...categories, result]);
            }
            setShowModal(false);
            setCurrentCategory(INITIAL_CATEGORY_STATE);
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message;
            alert(`Falha ao salvar categoria: ${errorMsg}`);
            console.error('Erro salvar categoria:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja remover esta categoria? Essa ação pode falhar se existirem tarefas vinculadas.')) return;
        try {
            await deleteCategory(id);
            setCategories(categories.filter(c => c.id !== id));
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message;
            alert(`Falha ao remover categoria: ${errorMsg}`);
            console.error('Erro remover categoria:', err);
        }
    };

    // --- Manipuladores de CRUD de Tarefas usados pelos cartões de categoria ---
    const openCreateTaskForCategory = (category) => {
        const empty = {
            missao_id: missionsList && missionsList.length > 0 ? missionsList[0].id : null,
            categoria_id: category.id,
            titulo: '',
            descricao: '',
            instrucoes: '',
            pontos: 0,
            tipo: null,
            dificuldade: 'facil',
            ordem: 0,
            ativa: true,
            requisitos: null,
            tarefa_anterior_id: null,
            quiz: null,
        };
        setCurrentTask(empty);
        setShowTaskModal(true);
    };

    const handleSaveTask = async (task) => {
        setIsTaskSaving(true);
        try {
            let res;
            if (task.id) {
                res = await updateTask(task.id, task);
            } else {
                res = await createTask(task);
            }
            // recarregar categorias para refletir as alterações
            await loadCategories();
            setShowTaskModal(false);
            setCurrentTask(null);
        } catch (err) {
            const message = err.response?.data?.error || err.message;
            alert(`Falha ao salvar tarefa: ${message}`);
            console.error('Erro salvar tarefa:', err);
        } finally {
            setIsTaskSaving(false);
        }
    };
    
    // --- RENDERIZAÇÃO ---

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Loader size={32} className="animate-spin text-[#394C97] mb-4" /> 
                <p className="text-gray-500 font-medium text-sm">Carregando estrutura...</p>
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
                            <Layers className="w-6 h-6 text-[#FE5900]" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Categorias</h1>
                            <p className="text-blue-100/90 text-sm md:text-base mt-1 font-light">Organização estrutural das tarefas</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
                
                {/* Header de Ações */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/50 text-sm text-gray-600 font-medium shadow-sm">
                        Total de Categorias: <span className="text-[#394C97] font-bold">{categories.length}</span>
                    </div>

                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => { setIsEditing(false); setCurrentCategory(INITIAL_CATEGORY_STATE); setShowModal(true); }}
                        className="bg-[#FE5900] text-white px-6 py-3 rounded-xl shadow-lg hover:bg-[#e04f00] hover:shadow-orange-500/20 transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-wide transform hover:-translate-y-0.5"
                        disabled={isSaving}
                    >
                        <Plus size={16} strokeWidth={3} />
                        Nova Categoria
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
                        <button onClick={loadCategories} className="p-1.5 hover:bg-red-100 rounded-md transition-colors">
                            <RefreshCw size={14} />
                        </button>
                    </motion.div>
                )}

                {/* Grid de Categorias */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {categories.length === 0 && !error ? (
                            <div className="col-span-full p-12 text-center text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center">
                                <FolderOpen size={40} className="mb-3 opacity-20" />
                                <p className="text-sm font-medium">Nenhuma categoria cadastrada.</p>
                            </div>
                        ) : (
                            categories.map((cat, index) => (
                                <motion.div
                                    key={cat.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <CategoryCard
                                        category={cat}
                                        onEdit={() => { setIsEditing(true); setCurrentCategory(cat); setShowModal(true); }}
                                        onDelete={() => handleDelete(cat.id)}
                                        onCreateTask={(c) => openCreateTaskForCategory(c)}
                                    />
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Modal de Categoria */}
            {showModal && (
                <CategoryModal
                    category={currentCategory}
                    setCategory={setCurrentCategory}
                    onSave={handleCreateEdit}
                    onClose={() => { setShowModal(false); setIsEditing(false); setCurrentCategory(INITIAL_CATEGORY_STATE); }}
                    isEditing={isEditing}
                    isLoading={isSaving}
                />
            )}

            {/* Modal de Tarefa (create only via category card) */}
            {showTaskModal && (
                <TaskQuizModal
                    task={currentTask}
                    setTask={setCurrentTask}
                    handleSave={handleSaveTask}
                    handleClose={() => { setShowTaskModal(false); setCurrentTask(null); }}
                    isEditing={!!currentTask?.id}
                    isLoading={isTaskSaving}
                    categories={categories}
                    missions={missionsList}
                />
            )}
        </div>
    );
};

export default CategoriesContent;