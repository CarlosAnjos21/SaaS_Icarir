// src/components/AdminPanel/AdminMissions/MissionListAndCRUD.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Plus, AlertTriangle, Loader } from "lucide-react";

// Importa as funções de API para Missões
import { fetchMissions, createMission, updateMission, deleteMissionApi } from '../../../api/apiFunctions'; 

// Importa os componentes desmembrados (certifique-se que estão no mesmo diretório)
import MissionModal from './MissionModal';
import MissionCard from './MissionCard';


// Estado inicial para o formulário de missão
// Baseado na tabela MISSOES
const INITIAL_MISSION_STATE = {
    titulo: "",
    descricao: "",
    destino: "", // Corresponde ao seu campo 'destino'
    data_inicio: "",
    data_fim: "",
    preco: 0.00,
    vagas_disponiveis: 0,
    ativa: true,
    missao_anterior_id: null, 
};


const MissionListAndCRUD = () => {
    // ESTADOS DE DADOS
    const [missions, setMissions] = useState([]);
    
    // ESTADOS DE FLUXO
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // ESTADOS DE CRIAÇÃO/EDIÇÃO
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newMission, setNewMission] = useState(INITIAL_MISSION_STATE);

    // FUNÇÃO DE CARREGAMENTO (READ - GET)
    const loadMissions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchMissions();
            // A API deve retornar objetos com campos em snake_case (titulo, destino, etc.)
            setMissions(data); 
        } catch (err) {
            setError(`Falha ao carregar a lista de missões: ${err.message || 'Erro de conexão'}`);
            console.error("Erro ao carregar missões:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMissions();
    }, [loadMissions]);

    // --- FUNÇÕES DE CONTROLE DO MODAL ---
    
    const handleModalOpen = (missionToEdit = null) => {
        if (missionToEdit) {
            setIsEditing(true);
            setEditingId(missionToEdit.id);
            // Copia o objeto para o estado de edição
            setNewMission(JSON.parse(JSON.stringify(missionToEdit))); 
        } else {
            setIsEditing(false);
            setEditingId(null);
            setNewMission(INITIAL_MISSION_STATE);
        }
        setShowModal(true);
        setError(null);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setIsEditing(false);
        setNewMission(INITIAL_MISSION_STATE);
    };


    // --- FUNÇÕES DE API (CREATE/UPDATE/DELETE) ---

    const handleSaveMission = async () => {
        // Validação básica
        if (!newMission.titulo || !newMission.destino) {
            alert("Preencha Título e Destino da Missão.");
            return;
        }

        setIsSaving(true);
        try {
            if (isEditing) {
                // Atualizar missão existente (PUT)
                const updated = await updateMission(editingId, newMission);
                setMissions(missions.map(m => m.id === editingId ? updated : m));
            } else {
                // Criar nova missão (POST)
                const created = await createMission(newMission);
                setMissions([...missions, created]);
            }
            handleModalClose();
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            alert(`Falha ao salvar a missão: ${errorMsg}`);
            console.error("Erro ao salvar missão:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteMission = async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir esta missão? Esta ação é irreversível.")) {
            return;
        }

        try {
            await deleteMissionApi(id);
            setMissions(missions.filter(m => m.id !== id));
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            alert(`Falha ao excluir a missão: ${errorMsg}`);
            console.error("Erro ao deletar missão:", err);
        }
    };


    // --- RENDERIZAÇÃO ---

    if (loading) {
        return <div className="text-center p-10"><Loader size={30} className="animate-spin mx-auto text-[#394C97]" /> <p className="mt-2 text-gray-500">Carregando missões...</p></div>;
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center gap-3" role="alert">
                <AlertTriangle size={20} />
                <span className="block sm:inline">{error}</span>
                <button onClick={loadMissions} className="ml-4 underline font-semibold">Tentar Novamente</button>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-end mb-8">
                <button
                    onClick={() => handleModalOpen()}
                    className="bg-[#FE5900] text-white px-6 py-3 rounded-xl shadow-lg hover:bg-[#d94d00] transition flex items-center gap-2 font-semibold"
                >
                    <Plus size={20} />
                    Criar Nova Missão
                </button>
            </div>
            
            <div className="grid gap-6">
                {missions.length === 0 ? (
                    <p className="text-gray-500 p-4 bg-white rounded-lg shadow">Nenhuma missão criada ainda.</p>
                ) : (
                    missions.map((mission) => (
                        <MissionCard 
                            key={mission.id} 
                            mission={mission} 
                            onEdit={() => handleModalOpen(mission)} 
                            onDelete={() => handleDeleteMission(mission.id)} 
                        />
                    ))
                )}
            </div>

            {/* Modal de Missão */}
            {showModal && (
                <MissionModal 
                    newMission={newMission}
                    setNewMission={setNewMission}
                    // Os handlers de Step/Quiz foram removidos daqui, pois a gestão de Tarefas/Quizzes é feita em TasksQuizzesContent
                    handleSaveMission={handleSaveMission}
                    handleModalClose={handleModalClose}
                    isEditing={isEditing}
                    isLoading={isSaving}
                />
            )}
        </div>
    );
};

export default MissionListAndCRUD;