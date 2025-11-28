// src/components/AdminPanel/AdminMissions/CategoriesContent.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Plus, Loader, Edit, Trash2, AlertTriangle } from 'lucide-react';
// Certifique-se que você atualizou o apiFunctions.js para incluir estas:
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../../api/apiFunctions'; 

const INITIAL_CATEGORY_STATE = {
    nome: "",
    descricao: "",
    icone: "",
    cor: "#000000",
    ordem: 0,
    // ... (restante do código que gera o CRUD de Categorias)
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


    // --- FUNÇÕES DE CRUD (Omitting detail for brevity, see previous response for full code) ---

    const handleCreateEdit = async (data) => { /* ... */ };
    const handleDelete = async (id) => { /* ... */ };
    
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
            {/* ... (renderização da lista) */}
        </div>
    );
};

export default CategoriesContent;