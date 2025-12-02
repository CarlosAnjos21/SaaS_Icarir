// src/pages/Missions.jsx (Atualizado para API real)

import { useState, useEffect, useCallback } from "react";
import { Loader, AlertTriangle } from "lucide-react"; 
import MissionCard from "../components/missions/MissionCard";
import MissionDetails from "../components/missions/MissionDetails";

// ❗ Importar a função de API e a função de normalização
// (Ajuste o caminho se necessário)
import { fetchMissions } from '../../src/api/apiFunctions'; 

// ===================================================================
// FUNÇÃO DE NORMALIZAÇÃO (GARANTE COMPATIBILIDADE DE DADOS)
// Copiada do componente AdminPanel para consistência.
// ===================================================================
function normalizeMission(m) {
    if (!m) return { id: null, title: '', category: '', status: '', progress: 0, deadline: '', totalTasks: 0, completedTasks: 0, accumulatedPoints: 0, description: '', tasks: [], ativa: false };

    const title = m.titulo || m.title || '';
    const description = m.descricao || m.description || '';
    // Formato de data de API (YYYY-MM-DD) para UI (DD/MM/YYYY)
    const deadline = m.data_fim ? new Date(m.data_fim).toLocaleDateString('pt-BR') : (m.deadline || '');
    const isActive = (m.ativa === undefined || m.ativa === null) ? true : Boolean(m.ativa);
    
    // Processa tarefas (tasks) - A API retorna em 'tarefas'
    let tasks = [];
    // Prioriza 'tarefas' (nome do backend) ou usa 'steps' (se vier do AdminPanel)
    const rawTasks = m.tarefas || m.steps || [];

    if (Array.isArray(rawTasks) && rawTasks.length > 0) {
        tasks = rawTasks.map(t => ({ 
            id: t.id, 
            name: t.titulo || t.descricao || t.description || '', 
            description: t.descricao || t.description || 'Detalhes da tarefa não disponíveis.',
            points: t.pontos || t.points || 0,
            // Assumimos que 'concluida' ou 'completed' indica o status real
            completed: t.concluida || t.completed || false, 
            status: (t.concluida || t.completed) ? 'CONCLUÍDA' : 'PENDENTE',
            category: t.category || 'Geral' // Se o backend não fornecer, use 'Geral'
        }));
    }

    // Calcula métricas
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const accumulatedPoints = tasks.filter(t => t.completed).reduce((sum, t) => sum + (Number(t.points) || 0), 0);
    const status = progress === 100 ? 'Concluída' : 'Em Andamento';

    return {
        id: m.id,
        title,
        description,
        deadline,
        totalTasks,
        completedTasks,
        accumulatedPoints,
        progress,
        status,
        tasks,
        category: m.destino || 'Geral', // Usando 'destino' do backend
        ativa: isActive
    };
}


export default function Missions() {
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  // FUNÇÃO DE CARREGAMENTO (READ - GET)
  const loadMissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMissions();
      
      const normalized = (data || [])
        .map(normalizeMission)
        // Filtra missões desativadas e sem título (dados ruins)
        .filter(m => m.ativa === true && m.title); 
        
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
  
  const filteredMissions = missions.filter(mission => {
    if (activeTab === 'active') {
      return mission.progress < 100;
    } else if (activeTab === 'completed') {
      return mission.progress === 100;
    }
    return true;
  });

  const handleOpenMission = (mission) => {
    setSelectedMission(mission);
  };

  const handleBackToMissions = () => {
    setSelectedMission(null);
  };
  
  // A função handleCompleteStep deve ser implementada para chamar a API
  // para marcar a tarefa como concluída no backend.
  const handleCompleteStep = (taskId) => {
    console.log(`Tentativa de concluir a tarefa ID: ${taskId}. (Chamar API: updateTask)`);
    // ❗ NOTA: Para uma implementação completa, você usaria updateTask(taskId, { concluida: true })
    // e recarregaria a lista (loadMissions) ou atualizaria o estado local.
  };


  const getTabClasses = (tabName) => {
    return activeTab === tabName
      ? 'border-b-2 border-blue-600 text-blue-600 font-semibold pb-1 cursor-pointer'
      : 'text-gray-500 hover:text-gray-700 pb-1 cursor-pointer';
  };

  // ------------------------------------------------------------------
  // RENDERIZAÇÃO DE ESTADOS (Carregamento / Erro)
  // ------------------------------------------------------------------
  if (loading) {
    return <div className="text-center p-10"><Loader size={30} className="animate-spin mx-auto text-blue-600" /> <p className="mt-2 text-gray-500">Carregando missões...</p></div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center gap-3 max-w-4xl mx-auto mt-10" role="alert">
        <AlertTriangle size={20} />
        <span className="block sm:inline">{error}</span>
        <button onClick={loadMissions} className="ml-4 underline font-semibold">Tentar Novamente</button>
      </div>
    );
  }
  // ------------------------------------------------------------------

  return (
    <div className="p-6 max-w-4xl mx-auto">
      
      {selectedMission ? (
        
        // ➡️ TELA DE DETALHES (Passa os dados reais)
        <MissionDetails
          mission={selectedMission}
          onBack={handleBackToMissions}
          onCompleteStep={handleCompleteStep}
        />
        
      ) : (
        
        // ⬅️ TELA DA LISTA DE CARDS
        <>
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Minhas Missões</h1>
          
          <div className="flex space-x-4 border-b border-gray-200 mb-6">
            <div className={getTabClasses('active')} onClick={() => setActiveTab('active')}>Missões Ativas</div>
            <div className={getTabClasses('completed')} onClick={() => setActiveTab('completed')}>Missões Concluídas</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMissions.length > 0 ? (
              filteredMissions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission} // Passa o objeto normalizado
                  onClick={() => handleOpenMission(mission)} 
                />
              ))
            ) : (
              <p className="col-span-3 text-gray-500 italic p-4 bg-white rounded-lg shadow">
                {activeTab === 'active' ? 'Nenhuma missão ativa no momento.' : 'Nenhuma missão concluída.'}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}