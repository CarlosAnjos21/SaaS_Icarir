// src/components/AdminPanel/AdminMissions/TaskQuizModal.jsx

import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Plus, Loader } from 'lucide-react';

const INITIAL_QUIZ_QUESTION_STATE = {
    enunciado: "",
    opcoes: ["", "", "", ""],
    resposta_correta: "", 
};

// Componente recebe 'task' (os dados da Tarefa), 'setTask' (o setter), categorias, e handlers
const TaskQuizModal = ({ task, setTask, handleSave, handleClose, isEditing, isLoading, categories = [] }) => {
    
    // Simplificando: o quiz é um objeto que contém o array de perguntas (apenas 1 por enquanto)
    const [quizData, setQuizData] = useState(task.quiz?.perguntas?.[0] || INITIAL_QUIZ_QUESTION_STATE);
    const [hasQuiz, setHasQuiz] = useState(!!task.quiz);
    
    // Trata mudanças nos campos simples (título, pontos, etc.)
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTask(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? Number(value) : (type === 'checkbox' ? checked : value)
        }));
    };

    // Trata mudanças nos campos do Quiz
    const handleQuizChange = (field, value) => {
        setQuizData(prev => ({ ...prev, [field]: value }));
    };

    // Trata mudanças nas opções de resposta do Quiz
    const handleOptionChange = (index, value) => {
        const updatedOptions = [...quizData.opcoes];
        updatedOptions[index] = value;
        handleQuizChange("opcoes", updatedOptions);
    };

    // Alterna a inclusão do Quiz
    const handleToggleQuiz = () => {
        const shouldHaveQuiz = !hasQuiz;
        setHasQuiz(shouldHaveQuiz);
        if (shouldHaveQuiz) {
            setQuizData(INITIAL_QUIZ_QUESTION_STATE);
        }
    };
    
    // Efeito para sincronizar os dados complexos (Quiz) com o estado da Tarefa antes de salvar
    useEffect(() => {
        if (hasQuiz) {
            // Monta o objeto que o backend espera (Tarefa com Quiz aninhado)
            setTask(prev => ({
                ...prev,
                tipo: 'Quiz', // Define o tipo da Tarefa para Quiz
                quiz: { 
                    titulo: `Quiz da Tarefa: ${prev.titulo || 'Novo'}`,
                    perguntas: [quizData]
                }
            }));
        } else {
            setTask(prev => ({
                ...prev,
                tipo: 'Comum', // Tipo de tarefa normal (Ajuste o valor conforme seu enum)
                quiz: null
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quizData, hasQuiz, setTask, task.titulo]); // Dependências controladas


    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl w-full max-w-3xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-[#394C97]">
                    {isEditing ? "Editar Tarefa" : "Criar Nova Tarefa"}
                </h2>

                <button onClick={handleClose} disabled={isLoading} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 disabled:opacity-50">
                    <X size={24} />
                </button>

                <div className="space-y-6">
                    {/* DETALHES DA TAREFA */}
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="titulo"
                            placeholder="Título da Tarefa"
                            className="w-full border p-3 rounded-lg"
                            value={task.titulo || ''}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                        <select
                            name="categoria_id"
                            className="w-full border p-3 rounded-lg appearance-none"
                            value={task.categoria_id || ''}
                            onChange={handleChange}
                            disabled={isLoading}
                        >
                            <option value="">Selecione a Categoria*</option>
                            {/* Renderiza as categorias disponíveis */}
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.nome}</option>
                            ))}
                        </select>
                    </div>

                    <textarea
                        name="descricao"
                        placeholder="Descrição detalhada da Tarefa"
                        rows="3"
                        className="w-full border p-3 rounded-lg"
                        value={task.descricao || ''}
                        onChange={handleChange}
                        disabled={isLoading}
                    />

                    <div className="grid grid-cols-3 gap-4">
                        <input
                            type="number"
                            name="pontos"
                            placeholder="Pontos (Ex: 100)"
                            className="w-full border p-3 rounded-lg"
                            value={task.pontos || 0}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                        <input
                            type="number"
                            name="ordem"
                            placeholder="Ordem de Exibição"
                            className="w-full border p-3 rounded-lg"
                            value={task.ordem || 0}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                        <select
                            name="dificuldade"
                            className="w-full border p-3 rounded-lg appearance-none"
                            value={task.dificuldade || 'facil'}
                            onChange={handleChange}
                            disabled={isLoading}
                        >
                            <option value="facil">Fácil</option>
                            <option value="medio">Médio</option>
                            <option value="dificil">Difícil</option>
                        </select>
                    </div>
                    
                    {/* INCLUSÃO DE QUIZ */}
                    <div className="border p-4 rounded-lg bg-blue-50">
                        <label className="flex items-center gap-3 font-semibold text-blue-800">
                            <input type="checkbox" checked={hasQuiz} onChange={handleToggleQuiz} className="w-4 h-4 text-blue-600" disabled={isLoading}/>
                            Esta Tarefa é um Quiz de Múltipla Escolha?
                        </label>
                    </div>

                    {/* FORMULÁRIO DO QUIZ (Se hasQuiz for true) */}
                    {hasQuiz && (
                        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                            <h4 className="font-semibold text-gray-800 flex items-center gap-2"><CheckSquare size={18}/> Pergunta e Respostas</h4>
                            
                            <input
                                type="text"
                                placeholder="Enunciado da Pergunta (Pergunta principal do Quiz)"
                                className="w-full border p-3 rounded-lg"
                                value={quizData.enunciado || ''}
                                onChange={(e) => handleQuizChange("enunciado", e.target.value)}
                                disabled={isLoading}
                            />
                            
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Opções de Resposta:</p>
                                {quizData.opcoes.map((opt, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="correct-option"
                                            checked={quizData.resposta_correta === opt} 
                                            onChange={() => handleQuizChange("resposta_correta", opt)}
                                            className="w-4 h-4 text-green-600"
                                            disabled={isLoading}
                                        />
                                        <input
                                            type="text"
                                            placeholder={`Opção ${i + 1}`}
                                            className={`flex-1 border p-2 rounded ${quizData.resposta_correta === opt ? 'border-green-400 bg-green-50' : 'border-gray-300'}`}
                                            value={opt}
                                            onChange={(e) => handleOptionChange(i, e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className='text-xs text-gray-500 mt-2'>* Selecione o rádio (círculo) para marcar a resposta correta.</div>
                        </div>
                    )}
                </div>

                {/* Ações do Modal */}
                <div className="mt-8 flex justify-end gap-4 border-t pt-4">
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isLoading}
                        className="bg-[#394C97] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#2f3f7a] shadow-md transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? <Loader size={20} className="animate-spin" /> : null}
                        {isEditing ? "Salvar Alterações" : "Criar Tarefa"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskQuizModal;