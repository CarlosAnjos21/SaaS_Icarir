// src/components/AdminPanel/AdminMissions/MissionModal.jsx

import React, { useState, useEffect } from 'react';
import { X, Settings, Image as ImageIcon, Briefcase, Loader } from 'lucide-react';
import QuizForm from './QuizForm'; // Importa o subcomponente
import MissionTasksTab from './MissionTasksTab'; // Importa o novo componente de tarefas

// ... (Defina INITIAL_MISSION_STATE em um arquivo de constantes ou no MissionsContent)

const MissionModal = ({ newMission, setNewMission, handleAddStep, handleRemoveStep, handleToggleQuiz, handleSaveMission, handleModalClose, isEditing, isLoading, activeTab = 'details', setActiveTab }) => {
    
    // Se setActiveTab não for passado, usamos estado local
    const [localTab, setLocalTab] = useState(activeTab);
    const tab = setActiveTab ? activeTab : localTab;
    const setTab = setActiveTab ? setActiveTab : setLocalTab;
    
    // Sincroniza localTab quando activeTab muda (quando passado via prop)
    useEffect(() => {
        if (setActiveTab) {
            setLocalTab(activeTab);
        }
    }, [activeTab, setActiveTab]);
    
    // Função local para manipulação de step
    const handleStepChange = (index, field, value) => {
        const updatedSteps = [...newMission.steps];
        if (field === 'points') {
            updatedSteps[index][field] = Number(value);
        } else {
            updatedSteps[index][field] = value;
        }
        setNewMission({ ...newMission, steps: updatedSteps });
    };

    // Handlers para tarefas (apenas remoção na UI)
    const handleDeleteTask = (index) => {
        const updatedSteps = (newMission.steps || []).filter((_, i) => i !== index);
        setNewMission({ ...newMission, steps: updatedSteps });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-[#394C97]">
                    {tab === 'tasks' ? (
                        <>
                            <Briefcase size={24} className="inline mr-2" />
                            Tarefas: {newMission.title || 'Nova Missão'}
                        </>
                    ) : (
                        <>
                            {isEditing ? "Editar Missão" : "Criar Nova Missão"}
                        </>
                    )}
                </h2>

                <button onClick={handleModalClose} disabled={isLoading} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 disabled:opacity-50">
                    <X size={24} />
                </button>

                {/* ABAS - Só mostra quando não está na aba de tarefas */}
                {activeTab !== 'tasks' && (
                    <div className="flex gap-2 border-b mb-6">
                        <button
                            onClick={() => setTab('details')}
                            className={`px-4 py-2 font-semibold transition ${
                                tab === 'details'
                                    ? 'text-[#394C97] border-b-2 border-[#394C97]'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            <Settings size={18} className="inline mr-1" /> Detalhes
                        </button>
                        {isEditing && (
                            <button
                                onClick={() => setTab('tasks')}
                                className={`px-4 py-2 font-semibold transition ${
                                    tab === 'tasks'
                                        ? 'text-[#394C97] border-b-2 border-[#394C97]'
                                        : 'text-gray-600 hover:text-gray-800'
                                }`}
                            >
                                <Briefcase size={18} className="inline mr-1" /> Tarefas ({(newMission.steps || []).length})
                            </button>
                        )}
                    </div>
                )}

                <div className="space-y-6">
                    {/* ABA DETALHES */}
                    {tab === 'details' && (
                        <>
                            <h3 className="text-lg font-semibold border-b pb-2 text-gray-700 flex items-center gap-2"><Settings size={18}/> Detalhes Principais</h3>
                            <div>
                                <label className="text-xs text-gray-600 font-medium mb-1 block">Nome da Missão *</label>
                                <input
                                    type="text"
                                    placeholder="Ex: O Segredo da Torre Eiffel"
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    value={newMission.title}
                                    onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 font-medium mb-1 block">Descrição da Missão</label>
                                <textarea
                                    placeholder="Ex: Descubra os segredos históricos da Torre Eiffel e complete as tarefas culturais..."
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    rows="3"
                                    value={newMission.descricao || ''}
                                    onChange={(e) => setNewMission({ ...newMission, descricao: e.target.value })}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs text-gray-600 font-medium mb-1 block">Cidade/Destino</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Paris"
                                        className="w-full border border-gray-300 p-3 rounded-lg"
                                        value={newMission.city}
                                        onChange={(e) => setNewMission({ ...newMission, city: e.target.value })}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 font-medium mb-1 block">Pontos Totais</label>
                                    <input
                                        type="number"
                                        placeholder="Ex: 500"
                                        className="w-full border border-gray-300 p-3 rounded-lg"
                                        value={newMission.points}
                                        onChange={(e) => setNewMission({ ...newMission, points: Number(e.target.value) })}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 font-medium mb-1 block">Data de Término *</label>
                                    <input
                                        type="date"
                                        className="w-full border border-gray-300 p-3 rounded-lg"
                                        value={newMission.expirationDate}
                                        onChange={(e) => setNewMission({ ...newMission, expirationDate: e.target.value })}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-1">Preço da Missão (R$)</label>
                                    <div className="flex items-center">
                                        <span className="mr-2 text-gray-600">R$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="ex: 1500.50"
                                            className="flex-1 border border-gray-300 p-3 rounded-lg"
                                            value={newMission.preco ?? ''}
                                            onChange={(e) => setNewMission({ ...newMission, preco: e.target.value === '' ? null : Number(e.target.value) })}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <small className="text-xs text-gray-500 mt-1">Valor em reais. Use ponto para decimais.</small>
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-1">Vagas Disponíveis</label>
                                    <input
                                        type="number"
                                        placeholder="ex: 20"
                                        className="border border-gray-300 p-3 rounded-lg"
                                        value={newMission.vagas_disponiveis ?? ''}
                                        onChange={(e) => setNewMission({ ...newMission, vagas_disponiveis: e.target.value === '' ? null : parseInt(e.target.value, 10) })}
                                        disabled={isLoading}
                                    />
                                    <small className="text-xs text-gray-500 mt-1">Número total de vagas para a missão.</small>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <ImageIcon size={20} className="text-gray-500"/>
                                <input
                                    type="text"
                                    placeholder="URL da Imagem de Capa"
                                    className="flex-1 border border-gray-300 p-3 rounded-lg"
                                    value={newMission.imageUrl}
                                    onChange={(e) => setNewMission({ ...newMission, imageUrl: e.target.value })}
                                    disabled={isLoading}
                                />
                            </div>
                        </>
                    )}

                    {/* ABA TAREFAS */}
                    {tab === 'tasks' && (
                        <MissionTasksTab 
                            tasks={newMission.steps || []}
                            onDeleteTask={handleDeleteTask}
                            isLoading={isLoading}
                        />
                    )}
                </div>

                {/* Ações do Modal */}
                <div className="mt-8 flex justify-end gap-4 border-t pt-4">
                    <button
                        onClick={handleModalClose}
                        disabled={isLoading}
                        className="text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSaveMission} 
                        disabled={isLoading}
                        className="bg-[#394C97] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#2f3f7a] shadow-md transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? <Loader size={20} className="animate-spin" /> : null}
                        {isEditing ? "Salvar Alterações" : "Criar Missão"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MissionModal;