// src/components/AdminPanel/AdminMissions/MissionListAndCRUD.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Plus, AlertTriangle, Loader } from "lucide-react";

// Importa as funções de API para Missões
import { fetchMissions, createMission, updateMission, deleteMissionApi, createTask, updateTask, deleteTask } from '../../../api/apiFunctions'; 

// Importa os componentes desmembrados (certifique-se que estão no mesmo diretório)
import MissionModal from './MissionModal';
import MissionCard from './MissionCard';


// Estado inicial para o formulário de missão
    // Inclui tanto chaves esperadas pelo backend (pt_BR) quanto aliases usados no modal (inglês)
const INITIAL_MISSION_STATE = {
    // Portuguese/back-end keys
    titulo: "",
    descricao: "",
    destino: "",
    data_inicio: "",
    data_fim: "",
    preco: 0.00,
    vagas_disponiveis: 0,
    ativa: true,
    missao_anterior_id: null,
    foto_url: "",
    // aliases em inglês usados pelo modal (UI)
    title: "",
    city: "",
    points: 0,
    expirationDate: "",
    imageUrl: "",
    // Additional optional UI state
    steps: [{ description: "", points: 0 }],
    quiz: null,
};

// Normaliza o objeto de missão vindo da API para o formato usado pelos componentes
function normalizeMission(m) {
    if (!m) return {
        id: null,
        title: '',
        city: '',
        points: 0,
        expirationDate: '',
        steps: [],
        quiz: null,
        // keep original for debugging
        _raw: m,
    };

    // Detecta lista de tarefas (tarefas / steps) e mapeia para estrutura simples
    let steps = [];
    if (Array.isArray(m.steps) && m.steps.length > 0) {
        steps = m.steps.map(s => ({ id: s.id, description: s.description || s.descricao || s.titulo || '', points: s.points || s.pontos || 0 }));
    } else if (Array.isArray(m.tarefas) && m.tarefas.length > 0) {
        steps = m.tarefas.map(t => ({ id: t.id, description: t.descricao || t.titulo || '', points: t.pontos || t.points || 0 }));
    }

    // Calcular pontos totais a partir das tarefas (se houver)
    const totalPoints = steps.reduce((sum, s) => sum + (Number(s.points) || 0), 0);

    return {
        id: m.id,
        // aliases para UI
        title: m.titulo || m.title || '',
        city: m.destino || m.city || '',
        // points: soma das tarefas se disponível, caso contrário tentar campos fallback
        points: totalPoints || Number(m.points || m.pontos || 0),
        // preço e vagas separados
        preco: m.preco != null ? m.preco : null,
        vagas_disponiveis: m.vagas_disponiveis != null ? m.vagas_disponiveis : null,
        expirationDate: m.data_fim ? String(m.data_fim).slice(0,10) : (m.expirationDate || ''),
        steps: steps.length ? steps : (m.steps || []),
        quiz: m.quiz || null,
        // preserva a flag 'ativa' vinda do backend (soft-delete usa `ativa: false`)
        ativa: (m.ativa === undefined || m.ativa === null) ? true : Boolean(m.ativa),
        // keep original payload for reference
        _raw: m,
    };
}

// Sincroniza as etapas (steps) com o backend: cria novas tarefas ou atualiza existentes
async function syncTasksForMission(missionId, steps) {
    if (!Array.isArray(steps)) return [];
    const results = [];
    for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        try {
            if (s.id) {
                const payload = {
                    missao_id: missionId,
                    // envie tanto 'titulo' (título curto) quanto 'descricao' (texto longo)
                    // Gera um título curto a partir da descrição (limite curto para não duplicar exatamente)
                    titulo: s.titulo || s.title || (s.description ? (String(s.description).length > 30 ? String(s.description).slice(0,30) + '...' : String(s.description)) : `Etapa ${i+1}`),
                    descricao: s.description ?? s.descricao ?? null,
                    pontos: s.points != null ? s.points : s.pontos || 0,
                    ordem: i,
                };
                console.log('syncTasksForMission - update payload for task', s.id, payload);
                const res = await updateTask(s.id, payload);
                // adminTaskController responde { message, task }
                const taskObj = res?.task || res;
                results.push(taskObj);
            } else {
                const payload = {
                    missao_id: missionId,
                    // Gera um título curto a partir da descrição (limite curto para não duplicar exatamente)
                    titulo: s.titulo || s.title || (s.description ? (String(s.description).length > 30 ? String(s.description).slice(0,30) + '...' : String(s.description)) : `Etapa ${i+1}`),
                    descricao: s.description ?? s.descricao ?? null,
                    pontos: s.points != null ? s.points : s.pontos || 0,
                    ordem: i,
                };
                console.log('syncTasksForMission - create payload for task', payload);
                const res = await createTask(payload);
                const taskObj = res?.task || res;
                results.push(taskObj);
            }
        } catch (err) {
            console.error('Falha ao sincronizar etapa:', s, err);
        }
    }
    // map to normalized steps (id, description, points)
    return results.map(t => ({ id: t.id, description: t.titulo || t.descricao || '', points: t.pontos }));
}


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
            // Normalizar cada missão para o formato esperado pelos componentes UI
            // Filtrar missões desativadas (soft-delete) para não aparecer na listagem
            const normalized = (data || []).map(normalizeMission).filter(m => m.ativa !== false);
            setMissions(normalized);
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
            // Normaliza o objeto vindo da API para incluir aliases usados pelo modal
            const m = JSON.parse(JSON.stringify(missionToEdit));
            const normalized = {
                ...INITIAL_MISSION_STATE,
                ...m,
                // aliases
                title: m.titulo || m.title || "",
                city: m.destino || m.city || "",
                points: m.pontos || m.points || 0,
                expirationDate: m.data_fim ? String(m.data_fim).slice(0,10) : (m.expirationDate || ""),
                imageUrl: m.foto_url || m.imageUrl || "",
            };
            setNewMission(normalized);
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

    // --- Helpers para Steps / Quiz usados pelo modal ---
    const handleAddStep = () => {
        setNewMission((prev) => ({ ...prev, steps: [...(prev.steps || []), { description: '', points: 0 }] }));
    };

    const handleRemoveStep = (index) => {
        setNewMission((prev) => ({ ...prev, steps: prev.steps.filter((_, i) => i !== index) }));
    };

    const handleToggleQuiz = () => {
        setNewMission((prev) => ({ ...prev, quiz: prev.quiz ? null : { titulo: '', perguntas: [] } }));
    };


    // --- FUNÇÕES DE API (CREATE/UPDATE/DELETE) ---

    const handleSaveMission = async () => {
        // Validação básica
        if (!(newMission.titulo || newMission.title) || !(newMission.destino || newMission.city)) {
            alert("Preencha Título e Destino da Missão.");
            return;
        }
        // Backend exige `data_inicio` e `data_fim`. Se o modal não fornecer data_inicio,
        // usamos data atual como início (melhor seria adicionar input de data de início no modal).
        const todayIso = new Date().toISOString().slice(0,10);
        const startDate = newMission.data_inicio || newMission.startDate || todayIso;
        const endDate = newMission.data_fim || newMission.expirationDate || null;
        if (!endDate) {
            alert('Preencha a data de término (Data Fim) da missão.');
            return;
        }

        setIsSaving(true);
        try {
            // Construir payload compatível com backend (apenas campos esperados)
            const payload = {
                titulo: newMission.titulo || newMission.title,
                descricao: newMission.descricao || "",
                destino: newMission.destino || newMission.city,
                data_inicio: startDate,
                data_fim: endDate,
                preco: newMission.preco != null ? newMission.preco : newMission.points || 0,
                vagas_disponiveis: newMission.vagas_disponiveis != null ? newMission.vagas_disponiveis : newMission.slots || 0,
                ativa: newMission.ativa != null ? newMission.ativa : true,
                missao_anterior_id: newMission.missao_anterior_id || null,
                // nota: `foto_url` não existe no modelo Prisma `Missao`, omitir campo
            };

            // Debug: mostrar payload enviado para o servidor
            console.log('Criando/Atualizando missão - payload:', payload);

            if (isEditing) {
                // Atualizar missão existente (PUT)
                const updated = await updateMission(editingId, payload);
                const norm = normalizeMission(updated);
                // updated é o objeto mission retornado pelo backend
                // Detectar etapas removidas (existiam antes mas não estão mais no newMission.steps)
                const originalMission = missions.find(m => m.id === editingId);
                const originalStepIds = (originalMission?.steps || []).filter(s => s.id).map(s => s.id);
                const currentStepIds = (newMission.steps || []).filter(s => s.id).map(s => s.id);
                const toDeleteIds = originalStepIds.filter(id => !currentStepIds.includes(id));

                // Sincronizar tasks/etapas (criar/atualizar)
                const synced = await syncTasksForMission(norm.id || editingId, newMission.steps || []);

                // Apagar (soft) as etapas removidas
                if (toDeleteIds.length > 0) {
                    try {
                        await Promise.all(toDeleteIds.map(id => deleteTask(id)));
                    } catch (err) {
                        console.error('Falha ao deletar etapas removidas:', err);
                    }
                }

                // Recalcula pontos totais a partir das tarefas sincronizadas
                const totalPointsUpdated = (synced || []).reduce((s, it) => s + (Number(it.points) || 0), 0);
                const final = { ...norm, steps: synced, points: totalPointsUpdated };
                setMissions(missions.map(m => m.id === editingId ? final : m));
            } else {
                // Criar nova missão (POST)
                const created = await createMission(payload);
                const norm = normalizeMission(created);
                // created é o objeto mission retornado pelo backend
                const synced = await syncTasksForMission(created.id, newMission.steps || []);
                // Recalcula pontos totais a partir das tarefas sincronizadas
                const totalPointsCreated = (synced || []).reduce((s, it) => s + (Number(it.points) || 0), 0);
                const final = { ...norm, steps: synced, points: totalPointsCreated };
                setMissions([...missions, final]);
            }
            handleModalClose();
        } catch (err) {
            const serverData = err.response?.data;
            const errorMsg = serverData?.error || serverData?.message || err.message || 'Erro desconhecido';
            // Mostrar detalhes do servidor no console e em alerta para diagnosticar 400
            console.error("Erro ao salvar missão - resposta do servidor:", serverData || err);
            alert(`Falha ao salvar a missão: ${errorMsg}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteMission = async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir esta missão? Esta ação é irreversível.")) {
            return;
        }

        try {
            const res = await deleteMissionApi(id);
            console.log('deleteMissionApi response:', res);
            // se responder com a missão desativada, atualizamos a lista
            if (res && res.mission && res.mission.id) {
                setMissions(missions.map(m => m.id === id ? { ...m, ativa: false } : m).filter(m => m.id !== id));
            } else {
                // fallback: remover pelo id
                setMissions(missions.filter(m => m.id !== id));
            }
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
                    handleAddStep={handleAddStep}
                    handleRemoveStep={handleRemoveStep}
                    handleToggleQuiz={handleToggleQuiz}
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