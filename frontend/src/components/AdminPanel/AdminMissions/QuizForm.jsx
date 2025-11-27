// src/components/AdminPanel/AdminMissions/QuizForm.jsx

import React from 'react';
import { Plus, X } from 'lucide-react';

// Este componente recebe a missão e o setter como props
const QuizForm = ({ newMission, setNewMission, isLoading }) => {
    const quiz = newMission.quiz;

    const handleUpdateQuiz = (field, value) => {
        setNewMission({
            ...newMission,
            quiz: { ...quiz, [field]: value },
        });
    };

    const handleUpdateOption = (index, value) => {
        const updatedOptions = [...quiz.options];
        updatedOptions[index] = value;
        handleUpdateQuiz("options", updatedOptions);
    };

    const handleAddOption = () => {
        if (quiz.options.length < 6) {
            handleUpdateQuiz("options", [...quiz.options, ""]);
        }
    };

    const handleRemoveOption = (index) => {
        const updatedOptions = quiz.options.filter((_, i) => i !== index);
        // Garante que o correctIndex ainda seja válido
        let newCorrectIndex = quiz.correctIndex;
        if (newCorrectIndex === index) {
            newCorrectIndex = 0; 
        } else if (newCorrectIndex > index) {
            newCorrectIndex -= 1; 
        }

        setNewMission({
            ...newMission,
            quiz: { ...updatedOptions, correctIndex: newCorrectIndex },
        });
    };

    if (!quiz) return null; // Não renderiza se o quiz não estiver ativo

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-semibold text-gray-800">Configuração do Quiz</h4>
            
            <input
                type="text"
                placeholder="Pergunta do Quiz (Ex: Qual é a capital da França?)"
                className="w-full border p-3 rounded-lg"
                value={quiz.question || ''}
                onChange={(e) => handleUpdateQuiz("question", e.target.value)}
                disabled={isLoading}
            />
            
            <div className="space-y-2">
                {quiz.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <input
                            type="radio"
                            name="correct-option"
                            checked={quiz.correctIndex === i}
                            onChange={() => handleUpdateQuiz("correctIndex", i)}
                            className="w-4 h-4 text-green-600"
                            disabled={isLoading}
                        />
                        <input
                            type="text"
                            placeholder={`Opção ${i + 1}`}
                            className={`flex-1 border p-2 rounded ${quiz.correctIndex === i ? 'border-green-400 bg-green-50' : 'border-gray-300'}`}
                            value={opt}
                            onChange={(e) => handleUpdateOption(i, e.target.value)}
                            disabled={isLoading}
                        />
                        {quiz.options.length > 2 && (
                             <button onClick={() => handleRemoveOption(i)} className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50" disabled={isLoading}>
                                 <X size={18} />
                             </button>
                        )}
                    </div>
                ))}
            </div>

            {quiz.options.length < 6 && (
                <button
                    onClick={handleAddOption}
                    className="text-sm text-green-600 hover:text-green-800 font-semibold flex items-center gap-1 disabled:opacity-50"
                    disabled={isLoading}
                >
                    <Plus size={16} /> Adicionar Opção
                </button>
            )}
        </div>
    );
};

export default QuizForm;