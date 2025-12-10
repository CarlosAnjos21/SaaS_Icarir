import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion"; 
import { Loader, AlertTriangle, Target, CheckCircle, List, Flag } from "lucide-react"; 
import MissionCard from "../components/missions/MissionCard";
import MissionDetails from "../components/missions/MissionDetails";

// Importação da API
import { fetchMissions } from '../api/apiFunctions'; 

// ===================================================================
// FUNÇÃO DE NORMALIZAÇÃO
// ===================================================================
function normalizeMission(m) {
    if (!m) return { id: null, title: '', category: '', status: '', progress: 0, deadline: '', totalTasks: 0, completedTasks: 0, accumulatedPoints: 0, description: '', tasks: [], ativa: false };

    const title = m.titulo || m.title || '';
    const description = m.descricao || m.description || '';
    const deadline = m.data_fim ? new Date(m.data_fim).toLocaleDateString('pt-BR') : (m.deadline || '');
    const isActive = (m.ativa === undefined || m.ativa === null) ? true : Boolean(m.ativa);
    
    // Mapeamento da Imagem (NOVO)
    const image = m.foto_url || m.imageUrl || null;

    let tasks = [];
    const rawTasks = m.tarefas || m.steps || [];

    if (Array.isArray(rawTasks) && rawTasks.length > 0) {
        tasks = rawTasks.map(t => ({ 
            id: t.id, 
            name: t.titulo || t.descricao || t.description || '', 
            description: t.descricao || t.description || 'Detalhes da tarefa não disponíveis.',
            points: t.pontos || t.points || 0,
            completed: t.concluida || t.completed || false, 
            status: (t.concluida || t.completed) ? 'CONCLUÍDA' : 'PENDENTE',
            category: t.category || 'Geral'
        }));
    }

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
        category: m.destino || 'Geral', // Usando destino como categoria/local
        ativa: isActive,
        image, // Passando a imagem para o objeto final
        isJoined: m.isJoined // Importante para saber se o usuário já participa
    };
}

export default function Missions() {
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  const loadMissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMissions();
      const normalized = (data || [])
        .map(normalizeMission)
        .filter(m => m.ativa === true && m.title); 
      setMissions(normalized);
    } catch (err) {
      // Se for erro 401/403, sugere relogin
      const msg = err.response?.status === 403 || err.response?.status === 401 
        ? "Sessão expirada. Por favor, faça login novamente."
        : err.message || 'Erro de conexão';
        
      setError(msg);
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

  const handleOpenMission = (mission) => setSelectedMission(mission);
  const handleBackToMissions = () => setSelectedMission(null);
  
  const handleCompleteStep = (taskId) => {
    console.log(`Tentativa de concluir a tarefa ID: ${taskId}.`);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Loader size={40} className="animate-spin text-[#394C97] mb-4" /> 
            <p className="text-gray-500 font-medium">Sincronizando missões...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-2xl flex flex-col items-center gap-3 text-center">
          <AlertTriangle size={32} />
          <span className="font-semibold text-lg">Não foi possível carregar</span>
          <span className="text-sm opacity-80">{error}</span>
          <button onClick={loadMissions} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            Tentar Novamente
          </button>
        </div>
      );
    }

    if (selectedMission) {
       return (
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
         >
            <MissionDetails
                mission={selectedMission}
                onBack={handleBackToMissions}
                onCompleteStep={handleCompleteStep}
            />
         </motion.div>
       );
    }

    return (
      <>
        {/* ABAS DE NAVEGAÇÃO */}
        <div className="flex justify-center mb-8">
            <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 inline-flex">
                <button 
                    onClick={() => setActiveTab('active')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === 'active' 
                        ? 'bg-[#394C97] text-white shadow-md' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    <Target size={16} />
                    Missões Ativas
                </button>
                <button 
                    onClick={() => setActiveTab('completed')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === 'completed' 
                        ? 'bg-[#394C97] text-white shadow-md' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    <CheckCircle size={16} />
                    Concluídas
                </button>
            </div>
        </div>

        {/* LISTA DE MISSÕES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMissions.length > 0 ? (
                filteredMissions.map((mission, index) => (
                    <motion.div
                        key={mission.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <MissionCard
                            mission={mission}
                            onClick={() => handleOpenMission(mission)} 
                        />
                    </motion.div>
                ))
            ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="p-4 bg-gray-50 rounded-full mb-3">
                        {activeTab === 'active' ? <List size={30} className="text-gray-400"/> : <Flag size={30} className="text-gray-400"/>}
                    </div>
                    <p className="text-gray-500 font-medium">
                        {activeTab === 'active' ? 'Nenhuma missão ativa no momento.' : 'Nenhuma missão concluída ainda.'}
                    </p>
                </div>
            )}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* --- BANNER SUPERIOR --- */}
      <div className="h-64 w-full bg-[#394C97] relative">
        <div className="absolute top-4 right-4 text-white/80 text-sm font-medium">
          Central de Operações
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center pb-12 md:translate-y-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 text-white"
          >
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Target className="w-10 h-10 text-[#FE5900]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Suas Missões</h1>
              <p className="text-blue-100 text-lg mt-1">Complete objetivos para subir de nível</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- CONTEÚDO PRINCIPAL (Sobreposto) --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-20 relative z-10">
         {renderContent()}
      </div>

    </div>
  );
}