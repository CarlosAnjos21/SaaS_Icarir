// src/components/AdminPanel/AdminMissions/TaskQuizModal.jsx

import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Plus, Loader, Trash2 } from 'lucide-react';

const INITIAL_QUIZ_QUESTION_STATE = {
    enunciado: "",
    opcoes: ["", "", "", ""],
    resposta_correta: "", 
};

// Componente recebe 'task' (os dados da Tarefa), 'setTask' (o setter), categorias, e handlers
const TaskQuizModal = ({ task, setTask, handleSave, handleClose, isEditing, isLoading, categories = [], missions = [] }) => {
    
    // Suporta múltiplas perguntas
    const [quizPerguntas, setQuizPerguntas] = useState(() => {
        if (Array.isArray(task?.quiz?.perguntas) && task.quiz.perguntas.length > 0) {
            return task.quiz.perguntas;
        }
        return [{ ...INITIAL_QUIZ_QUESTION_STATE }];
    });

    // Se a tarefa já tem quiz ao carregar, marca como true automaticamente
    const [hasQuiz, setHasQuiz] = useState(() => !!(task?.quiz && Array.isArray(task.quiz.perguntas) && task.quiz.perguntas.length > 0));

    // UseEffect para sincronizar quando a tarefa muda (ao editar)
    // Observamos a versão serializada do quiz para detectar mudanças profundas na estrutura
    useEffect(() => {
        try {
            const serialized = JSON.stringify(task?.quiz || null);
            if (task?.quiz && Array.isArray(task.quiz.perguntas) && task.quiz.perguntas.length > 0) {
                setQuizPerguntas(task.quiz.perguntas);
                setHasQuiz(true);
                console.log('TaskQuizModal - sincronizado quiz:', task.quiz.perguntas);
            } else {
                setQuizPerguntas([{ ...INITIAL_QUIZ_QUESTION_STATE }]);
                setHasQuiz(false);
            }
            // também logamos a versão serializada para ajudar no debug de referências
            console.log('TaskQuizModal - task.quiz (serialized):', serialized);
        } catch (err) {
            console.warn('TaskQuizModal - falha ao serializar task.quiz para sincronização', err);
            setQuizPerguntas([{ ...INITIAL_QUIZ_QUESTION_STATE }]);
            setHasQuiz(false);
        }
    }, [task.id, JSON.stringify(task?.quiz || null)]); // Sincroniza quando a tarefa muda (deep watch)

    // Preservar/editar descrição do quiz
    const [quizDescricao, setQuizDescricao] = useState(() => task?.quiz?.descricao || '');

    // Sincroniza quizDescricao quando a tarefa muda
    useEffect(() => {
        try {
            setQuizDescricao(task?.quiz?.descricao || '');
        } catch (err) {
            setQuizDescricao('');
        }
    }, [task.id, JSON.stringify(task?.quiz || null)]);
    
    // Trata mudanças nos campos simples (título, pontos, etc.)
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTask(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? Number(value) : (type === 'checkbox' ? checked : value)
        }));
    };

    // Adiciona nova pergunta
    const handleAddQuestion = () => {
        setQuizPerguntas(prev => [...prev, { ...INITIAL_QUIZ_QUESTION_STATE }]);
    };

    // Remove pergunta
    const handleRemoveQuestion = (qIndex) => {
        if (quizPerguntas.length > 1) {
            setQuizPerguntas(prev => prev.filter((_, i) => i !== qIndex));
        }
    };

    // Trata mudanças nos campos da pergunta
    const handleQuizChange = (qIndex, field, value) => {
        setQuizPerguntas(prev => {
            const perguntas = [...prev];
            perguntas[qIndex] = { ...perguntas[qIndex], [field]: value };
            return perguntas;
        });
    };

    // Trata mudanças nas opções de resposta
    const handleOptionChange = (qIndex, optIndex, value) => {
        setQuizPerguntas(prev => {
            const perguntas = [...prev];
            const updatedOptions = [...perguntas[qIndex].opcoes];
            updatedOptions[optIndex] = value;
            perguntas[qIndex] = { ...perguntas[qIndex], opcoes: updatedOptions };
            return perguntas;
        });
    };

    // Alterna a inclusão do Quiz
    const handleToggleQuiz = () => {
        const shouldHaveQuiz = !hasQuiz;
        setHasQuiz(shouldHaveQuiz);
        if (shouldHaveQuiz) {
            setQuizPerguntas([{ ...INITIAL_QUIZ_QUESTION_STATE }]);
        }
    };
    
    // Efeito para sincronizar os dados complexos (Quiz) com o estado da Tarefa antes de salvar
    useEffect(() => {
        if (hasQuiz) {
            // Monta o objeto que o backend espera (Tarefa com Quiz aninhado)
            setTask(prev => ({
                ...prev,
                quiz: { 
                    titulo: prev.quiz?.titulo || `Quiz da Tarefa: ${prev.titulo || 'Novo'}`,
                    descricao: quizDescricao || prev.quiz?.descricao || '',
                    perguntas: quizPerguntas
                }
            }));
        } else {
            setTask(prev => ({
                ...prev,
                quiz: null
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quizPerguntas, hasQuiz, setTask, task.titulo, quizDescricao]); // Dependências controladas


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
                        <div>
                            <label className="text-xs text-gray-600 font-medium mb-1 block">Título da Tarefa *</label>
                            <input
                                type="text"
                                name="titulo"
                                placeholder="Ex: Completar perfil"
                                className="w-full border p-3 rounded-lg caret-black text-gray-900"
                                value={task.titulo || ''}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-600 font-medium mb-1 block">Categoria *</label>
                            <select
                                name="categoria_id"
                                className="w-full border p-3 rounded-lg appearance-none caret-black text-gray-900"
                                value={task.categoria_id || ''}
                                onChange={handleChange}
                                disabled={isLoading}
                            >
                                <option value="">Selecione...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-600 font-medium mb-1 block">Descrição</label>
                        <textarea
                            name="descricao"
                            placeholder="Descreva os detalhes da tarefa..."
                            rows="3"
                            className="w-full border p-3 rounded-lg caret-black text-gray-900"
                            value={task.descricao || ''}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs text-gray-600 font-medium mb-1 block">Tipo (opcional)</label>
                            <select
                                name="tipo"
                                className="w-full border p-3 rounded-lg appearance-none caret-black text-gray-900"
                                value={task.tipo || ''}
                                onChange={handleChange}
                                disabled={isLoading}
                            >
                                <option value="">Selecione...</option>
                                <option value="administrativa">Administrativa</option>
                                <option value="conhecimento">Conhecimento</option>
                                <option value="engajamento">Engajamento</option>
                                <option value="social">Social</option>
                                <option value="feedback">Feedback</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-600 font-medium mb-1 block">Pontos (XP)</label>
                            <input
                                type="number"
                                name="pontos"
                                placeholder="Ex: 100"
                                className="w-full border p-3 rounded-lg caret-black text-gray-900"
                                value={task.pontos ?? ''}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-600 font-medium mb-1 block">Ordem de Exibição</label>
                            <input
                                type="number"
                                name="ordem"
                                placeholder="Ex: 1"
                                className="w-full border p-3 rounded-lg caret-black text-gray-900"
                                value={task.ordem ?? ''}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-600 font-medium mb-1 block">Dificuldade</label>
                            <select
                                name="dificuldade"
                                className="w-full border p-3 rounded-lg appearance-none caret-black text-gray-900"
                                value={task.dificuldade || 'facil'}
                                onChange={handleChange}
                                disabled={isLoading}
                            >
                                <option value="facil">Fácil</option>
                                <option value="medio">Médio</option>
                                <option value="dificil">Difícil</option>
                            </select>
                        </div>
                    </div>
                    {/* Instruções adicionais */}
                    <div>
                        <label className="text-xs text-gray-600 font-medium mb-1 block">Instruções (opcional)</label>
                        <textarea
                            name="instrucoes"
                            placeholder="Ex: Acesse o link, preencha o formulário..."
                            rows="2"
                            className="w-full border p-3 rounded-lg caret-black text-gray-900"
                            value={task.instrucoes || ''}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Requisitos: aceita JSON ou lista separada por vírgula */}
                    <div>
                        <label className="text-xs text-gray-600 font-medium mb-1 block">Requisitos (opcional)</label>
                        <textarea
                            name="requisitos"
                            placeholder='Ex: email_verificado,perfil_completo'
                            rows="2"
                            className="w-full border p-3 rounded-lg caret-black text-gray-900"
                            value={typeof task.requisitos === 'string' ? task.requisitos : (task.requisitos ? JSON.stringify(task.requisitos) : '')}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500 mt-1">Separe por vírgula ou use JSON</p>
                    </div>
                    {/* Se fornecido, permite escolher missão associada (opcional) */}
                    {missions && missions.length > 0 && (
                        <div>
                            <label className="text-xs text-gray-600 font-medium mb-1 block">Missão Vinculada (opcional)</label>
                            <select
                                name="missao_id"
                                className="w-full border p-3 rounded-lg appearance-none caret-black text-gray-900"
                                value={task.missao_id ?? ''}
                                onChange={handleChange}
                                disabled={isLoading}
                            >
                                <option value="">Nenhuma</option>
                                {missions.map(m => (
                                    <option key={m.id} value={m.id}>{m.titulo}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    
                    {/* INCLUSÃO DE QUIZ */}
                    <div className="border p-4 rounded-lg bg-blue-50">
                        <label className="flex items-center gap-3 font-semibold text-[#FE5900]">
                            <input type="checkbox" checked={hasQuiz} onChange={handleToggleQuiz} className="w-4 h-4 text-blue-600" disabled={isLoading}/>
                            Esta Tarefa é um Quiz de Múltipla Escolha?
                        </label>
                    </div>

                    {/* FORMULÁRIO DO QUIZ (Se hasQuiz for true) */}
                    {hasQuiz && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-gray-800 flex items-center gap-2"><CheckSquare size={18}/> Perguntas do Quiz</h4>
                                <button
                                    type="button"
                                    onClick={handleAddQuestion}
                                    className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1"
                                    disabled={isLoading}
                                >
                                    <Plus size={14} /> Adicionar Pergunta
                                </button>
                            </div>

                            {/* Descrição do Quiz (opcional) */}
                            <div>
                                <label className="text-xs text-gray-600 font-medium mb-1 block">Descrição do Quiz (opcional)</label>
                                <textarea
                                    rows={2}
                                    className="w-full border p-3 rounded-lg caret-black text-gray-900"
                                    placeholder="Breve contexto do quiz..."
                                    value={quizDescricao}
                                    onChange={(e) => setQuizDescricao(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>

                            {quizPerguntas.map((q, qIndex) => (
                                <div key={qIndex} className="p-4 border rounded-lg bg-gray-50 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h5 className="font-semibold text-gray-700">Pergunta {qIndex + 1}</h5>
                                        {quizPerguntas.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveQuestion(qIndex)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                                disabled={isLoading}
                                                title="Remover pergunta"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="text-xs text-gray-600 font-medium mb-1 block">Enunciado da Pergunta</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Qual é a capital da França?"
                                            className="w-full border p-3 rounded-lg caret-black text-gray-900"
                                            value={q.enunciado || ''}
                                            onChange={(e) => handleQuizChange(qIndex, "enunciado", e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-700">Opções de Resposta:</p>
                                        {q.opcoes.map((opt, optIndex) => (
                                            <div key={optIndex} className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name={`correct-option-${qIndex}`}
                                                    checked={q.resposta_correta === opt} 
                                                    onChange={() => handleQuizChange(qIndex, "resposta_correta", opt)}
                                                    className="w-4 h-4 text-green-600"
                                                    disabled={isLoading}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder={`Opção ${optIndex + 1}`}
                                                    className={`flex-1 border p-2 rounded caret-black text-gray-900 ${
                                                        q.resposta_correta === opt ? 'border-green-400 bg-green-50' : 'border-gray-300'
                                                    }`}
                                                    value={opt}
                                                    onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className='text-xs text-gray-500 mt-2'>* Selecione o rádio (círculo) para marcar a resposta correta.</div>
                                </div>
                            ))}
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
                        onClick={() => {
                            // preparar tarefa antes de salvar: normalizar `requisitos` (tentar JSON; se falhar, csv -> array)
                            const prepareTaskForSave = (t) => {
                                const copy = { ...t };
                                // Normalize tipo to match backend enum values (lowercase, trimmed)
                                if (copy.tipo !== undefined && copy.tipo !== null && copy.tipo !== '') {
                                    try {
                                        copy.tipo = String(copy.tipo).toLowerCase().trim();
                                    } catch (e) {
                                        copy.tipo = copy.tipo;
                                    }
                                } else {
                                    copy.tipo = null;
                                }
                                // Normalize requisitos
                                if (copy.requisitos === undefined || copy.requisitos === null || copy.requisitos === '') {
                                    copy.requisitos = null;
                                } else if (typeof copy.requisitos === 'string') {
                                    const text = copy.requisitos.trim();
                                    try {
                                        copy.requisitos = JSON.parse(text);
                                    } catch (e) {
                                        // não é JSON -> separar por vírgula em um array de strings já trimado
                                        copy.requisitos = text.split(',').map(s => s.trim()).filter(Boolean);
                                    }
                                }
                                return copy;
                            };
                            handleSave(prepareTaskForSave(task));
                        }} 
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