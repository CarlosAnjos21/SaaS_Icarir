// src/components/AdminPanel/AdminMissions/CategoriesContent.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Plus, Loader, Edit, Trash2, AlertTriangle } from 'lucide-react';
// Certifique-se que você atualizou o apiFunctions.js para incluir estas:
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../../api/apiFunctions'; 
import CategoryModal from './CategoryModal';
import CategoryCard from './CategoryCard';
import TaskQuizModal from './TaskQuizModal';
import { createTask, updateTask, deleteTask } from '../../../api/apiFunctions';
import { fetchMissions } from '../../../api/apiFunctions';

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

    // Estado do Modal (A ser expandido com um CategoryModal)
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


    // --- FUNÇÕES DE CRUD ---

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

    const openEditTask = (task) => {
        setCurrentTask(JSON.parse(JSON.stringify(task)));
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

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Remover esta tarefa?')) return;
        try {
            await deleteTask(taskId);
            await loadCategories();
        } catch (err) {
            const message = err.response?.data?.error || err.message;
            alert(`Falha ao remover tarefa: ${message}`);
        }
    };
    
    // --- RENDERIZAÇÃO ---

    if (loading) return <div className="text-center p-10"><Loader size={30} className="animate-spin mx-auto text-gray-500" /> <p className="mt-2 text-gray-500">Carregando categorias...</p></div>;

    return (
        <div>
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Settings size={22}/> Gestão de Categorias de Tarefas</h3>
                <button 
                    onClick={() => { setIsEditing(false); setCurrentCategory(INITIAL_CATEGORY_STATE); setShowModal(true); }}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition flex items-center gap-2 font-semibold disabled:opacity-50"
                    disabled={isSaving}
                >
                    <Plus size={20} /> Nova Categoria
                </button>
            </div>
            <div className="grid gap-4">
                {categories.length === 0 ? (
                    <p className="text-gray-500 p-4 bg-white rounded-lg shadow">Nenhuma categoria cadastrada.</p>
                ) : (
                    categories.map(cat => (
                        <CategoryCard
                            key={cat.id}
                            category={cat}
                            onEdit={() => { setIsEditing(true); setCurrentCategory(cat); setShowModal(true); }}
                            onDelete={() => handleDelete(cat.id)}
                            onCreateTask={(c) => openCreateTaskForCategory(c)}
                        />
                    ))
                )}
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

            {/* Modal de Tarefa (create/edit) */}
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