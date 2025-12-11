import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Plus, Trash2, HelpCircle, CheckSquare, List } from 'lucide-react';

const TaskQuizModal = ({ 
    task, 
    setTask, 
    handleSave, 
    handleClose, 
    isEditing, 
    isLoading, 
    categories, 
    missions 
}) => {
    
    // --- MANIPULAÇÃO GERAL ---
    const handleChange = (field, value) => {
        setTask(prev => ({ ...prev, [field]: value }));
    };

    // --- LÓGICA DE QUIZ ---
    const handleAddQuestion = () => {
        const newQuestion = {
            enunciado: "",
            tipo: "multipla_escolha",
            opcoes: ["", "", "", ""],
            resposta_correta: ""
        };
        
        const currentQuiz = task.quiz || { perguntas: [] };
        const currentQuestions = currentQuiz.perguntas || currentQuiz.questions || [];
        
        setTask(prev => ({
            ...prev,
            quiz: {
                ...currentQuiz,
                perguntas: [...currentQuestions, newQuestion]
            }
        }));
    };

    const handleRemoveQuestion = (index) => {
        const currentQuiz = task.quiz || { perguntas: [] };
        const currentQuestions = currentQuiz.perguntas || currentQuiz.questions || [];
        
        const updatedQuestions = currentQuestions.filter((_, i) => i !== index);
        
        setTask(prev => ({
            ...prev,
            quiz: { ...currentQuiz, perguntas: updatedQuestions }
        }));
    };

    const handleQuestionChange = (index, field, value) => {
        const currentQuiz = task.quiz || { perguntas: [] };
        // Garante que é um array
        const currentQuestions = [...(currentQuiz.perguntas || currentQuiz.questions || [])];
        
        // Atualiza a pergunta específica
        currentQuestions[index] = { ...currentQuestions[index], [field]: value };
        
        setTask(prev => ({
            ...prev,
            quiz: { ...currentQuiz, perguntas: currentQuestions }
        }));
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const currentQuiz = task.quiz || { perguntas: [] };
        const currentQuestions = [...(currentQuiz.perguntas || currentQuiz.questions || [])];
        
        // Copia as opções da pergunta específica
        const currentOptions = [...(currentQuestions[qIndex].opcoes || ["", "", "", ""])];
        currentOptions[oIndex] = value;
        currentQuestions[qIndex].opcoes = currentOptions;

        setTask(prev => ({
            ...prev,
            quiz: { ...currentQuiz, perguntas: currentQuestions }
        }));
    };

    // Renderiza inputs de quiz se necessário
    const renderQuizFields = () => {
        const currentQuiz = task.quiz || { perguntas: [] };
        const questions = currentQuiz.perguntas || currentQuiz.questions || [];

        return (
            <div className="space-y-6 mt-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <List size={16} /> Perguntas do Quiz
                    </h3>
                    <button 
                        type="button"
                        onClick={handleAddQuestion}
                        className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-bold flex items-center gap-1 transition-colors"
                    >
                        <Plus size={12} /> Adicionar Pergunta
                    </button>
                </div>

                {questions.length === 0 ? (
                    <div className="text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-sm text-gray-500">Nenhuma pergunta adicionada.</p>
                    </div>
                ) : (
                    questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group">
                            <button 
                                type="button"
                                onClick={() => handleRemoveQuestion(qIndex)}
                                className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                title="Remover pergunta"
                            >
                                <Trash2 size={14} />
                            </button>

                            <div className="space-y-3 pr-8">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Enunciado</label>
                                    <input 
                                        type="text" 
                                        value={q.enunciado || ""}
                                        onChange={(e) => handleQuestionChange(qIndex, 'enunciado', e.target.value)}
                                        className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Ex: Qual a capital do Brasil?"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(q.opcoes || ["", "", "", ""]).map((opt, oIndex) => (
                                        <div key={oIndex} className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-white border flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">
                                                {String.fromCharCode(65 + oIndex)}
                                            </div>
                                            <input 
                                                type="text" 
                                                value={opt || ""}
                                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                className={`w-full p-2 text-sm border rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 ${q.resposta_correta === opt && opt !== "" ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                                                placeholder={`Opção ${oIndex + 1}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleQuestionChange(qIndex, 'resposta_correta', opt)}
                                                className={`p-1.5 rounded-md transition-colors shrink-0 ${q.resposta_correta === opt && opt !== "" ? 'text-green-600 bg-green-100' : 'text-gray-300 hover:text-gray-500'}`}
                                                title="Marcar como correta"
                                            >
                                                <CheckSquare size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="mt-2">
                                    <p className="text-xs text-gray-400">
                                        Resposta Correta: <span className="font-bold text-green-600">{q.resposta_correta || "Não selecionada"}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        );
    };

    // Handler para fechar ao clicar no fundo (Backdrop)
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()} // Impede que cliques dentro do modal fechem ele
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        {isEditing ? <div className="w-2 h-6 bg-blue-500 rounded-full"/> : <div className="w-2 h-6 bg-green-500 rounded-full"/>}
                        {isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}
                    </h2>
                    <button 
                        type="button"
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body Scrollable */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    
                    {/* Campos Principais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título da Tarefa</label>
                            <input 
                                type="text"
                                value={task.titulo}
                                onChange={(e) => handleChange('titulo', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#394C97] outline-none font-bold text-gray-700"
                                placeholder="Ex: Ler o documento de Compliance"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição</label>
                            <textarea 
                                value={task.descricao}
                                onChange={(e) => handleChange('descricao', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#394C97] outline-none text-sm min-h-[80px]"
                                placeholder="Descreva o que o usuário deve fazer..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Missão Vinculada</label>
                            <select 
                                value={task.missao_id || task.mission_id || ""}
                                onChange={(e) => handleChange('missao_id', Number(e.target.value))}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#394C97] outline-none text-sm"
                            >
                                <option value="">Selecione a Missão...</option>
                                {missions.map(m => (
                                    <option key={m.id} value={m.id}>{m.titulo}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoria (Opcional)</label>
                            <select 
                                value={task.categoria_id || ""}
                                onChange={(e) => handleChange('categoria_id', Number(e.target.value))}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#394C97] outline-none text-sm"
                            >
                                <option value="">Sem Categoria</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.nome}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pontos (XP)</label>
                            <input 
                                type="number"
                                value={task.pontos}
                                onChange={(e) => handleChange('pontos', Number(e.target.value))}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#394C97] outline-none text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Tarefa</label>
                            <select 
                                value={task.tipo}
                                onChange={(e) => handleChange('tipo', e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#394C97] outline-none text-sm"
                            >
                                <option value="padrao">Padrão (Checkbox)</option>
                                <option value="administrativa">Administrativa (Upload)</option>
                                <option value="social">Social (Link)</option>
                                <option value="conhecimento">Conhecimento (Quiz)</option>
                            </select>
                        </div>
                    </div>

                    {/* Área de Quiz Condicional */}
                    {(task.tipo === 'conhecimento' || (task.quiz && Object.keys(task.quiz).length > 0 && (task.quiz.perguntas?.length > 0 || task.quiz.questions?.length > 0))) && (
                        <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                             <div className="flex items-center gap-2 mb-4 text-indigo-800">
                                <HelpCircle size={20} />
                                <h3 className="font-bold">Configuração do Quiz</h3>
                             </div>
                             {renderQuizFields()}
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                    <button 
                        type="button"
                        onClick={handleClose}
                        className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-200 rounded-xl transition-colors"
                        disabled={isLoading}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="button"
                        onClick={handleSave}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-[#FE5900] hover:bg-[#e04f00] rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center gap-2"
                        disabled={isLoading}
                    >
                        {isLoading ? <span className="animate-spin">⌛</span> : <Save size={18} />}
                        {isEditing ? 'Salvar Alterações' : 'Criar Tarefa'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default TaskQuizModal;