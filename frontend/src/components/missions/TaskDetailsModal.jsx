import React from 'react';
// Certifique-se de importar o React para usar as funções básicas
import { Trello, ListChecks, Share2, UploadCloud } from 'lucide-react';

const TaskDetailsModal = ({ task, onClose }) => {
    if (!task) return null;

    const isQuiz = task.category === 'Conhecimento' && task.name.includes('Quiz');
    const isUpload = task.category === 'Administrativas' && task.name.includes('Envio: Documento');
    const isLinkedIn = task.category === 'Engajamento' && task.name.includes('LinkedIn');

    const headerColor = isQuiz ? 'bg-amber-500' : isUpload ? 'bg-purple-500' : isLinkedIn ? 'bg-red-500' : 'bg-gray-500';

    // ❗ CORREÇÃO AQUI: Renomeado para começar com letra maiúscula para ser usado como componente JSX
    const IconComponent = isQuiz ? ListChecks : isUpload ? Trello : isLinkedIn ? Share2 : Trello;

    return (
        // Modal Overlay
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>

            {/* Modal Content */}
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative"
                onClick={e => e.stopPropagation()}
            >

                {/* Cabeçalho */}
                <div className={`flex justify-between items-center p-4 text-white ${headerColor}`}>
                    <div className="flex items-center">
                        <span className="text-lg font-semibold flex items-center">
                            {/* ❗ USO CORRIGIDO: Usando IconComponent com letra maiúscula */}
                            <IconComponent className="w-5 h-5 mr-2" />
                            {task.category}: {task.name}
                        </span>
                    </div>
                    <span className="text-xl font-extrabold px-3 py-1 bg-white bg-opacity-30 rounded-full">
                        {task.points} pts
                    </span>
                </div>

                {/* Corpo do Conteúdo ... (restante do código permanece o mesmo) */}
                <div className="p-6 space-y-6">

                    {isQuiz && (
                        <div>
                            <h3 className="font-bold text-gray-700 mb-2">Pergunta de Conhecimento:</h3>
                            <div className="p-4 border rounded-lg bg-yellow-50/50">
                                <p className="text-lg font-semibold">Qual é o principal pilar estratégico da análise de mercado do Q4?</p>
                                <p className="text-sm mt-2 text-gray-500">Pontuação: 0 / Questão 1 de 3</p>
                            </div>
                            <button className="w-full mt-4 py-3 rounded-lg font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors">
                                Selecione uma Opção
                            </button>
                        </div>
                    )}

                    {isUpload && (
                        <div>
                            <h3 className="font-bold text-gray-700 mb-2">Instrução:</h3>
                            <p className="text-gray-600 mb-4">
                                Fazer o upload do rascunho final do documento de escopo da missão. O arquivo deve estar no formato PDF e ter um nome claro, como "Escopo_Q4_SeuNome.pdf".
                            </p>
                            <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center text-purple-600 hover:bg-purple-50 cursor-pointer transition-colors">
                                <UploadCloud className="w-8 h-8 mx-auto mb-2" />
                                <p className="font-semibold">Clique ou arraste para enviar o arquivo</p>
                                <p className="text-xs mt-1 text-gray-500">Formatos suportados: PDF, DOCX (Máx. 5MB)</p>
                            </div>
                            <button className="w-full mt-4 py-3 rounded-lg font-bold text-white bg-purple-500 hover:bg-purple-600 transition-colors">
                                Finalizar Tarefa
                            </button>
                        </div>
                    )}

                    {isLinkedIn && (
                        <div>
                            <h3 className="font-bold text-gray-700 mb-2">Ação Requerida:</h3>
                            <ul className="list-disc list-inside space-y-1 text-gray-600 mb-4 pl-4">
                                <li>Acessar o link de postagem pré-definido.</li>
                                <li>Publicar o resumo da missão no seu perfil profissional.</li>
                                <li>Colar o link da sua postagem abaixo para validação.</li>
                            </ul>

                            <label className="font-bold text-gray-700 mb-1 block">Link da Postagem (URL):</label>
                            <input
                                type="text"
                                placeholder="Ex: https://linkedin.com/in/carlos-anjos/post/12345"
                                className="w-full p-2 border rounded-lg focus:ring-red-500 focus:border-red-500"
                            />

                            <button className="w-full mt-4 py-3 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 transition-colors">
                                Enviar para Validação
                            </button>
                            <p className="text-xs text-center text-gray-500 mt-2">A validação pode levar até 24h.</p>
                        </div>
                    )}

                    {/* Conteúdo Padrão */}
                    {!isQuiz && !isUpload && !isLinkedIn && (
                        <div>
                            <h3 className="font-bold text-gray-700 mb-2">Instrução:</h3>
                            <p className="text-gray-600">{task.description}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskDetailsModal;