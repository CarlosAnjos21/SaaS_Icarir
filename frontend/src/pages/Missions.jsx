import { useState, useEffect } from "react";
import MissionCard from "../components/missions/MissionCard";
// ❗ CORREÇÃO 1: Renomeando o import para refletir o nome MissionDetails
import MissionDetails from "../components/missions/MissionDetails";

export default function Missions() {
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    // -------------------------------------------------------------
    // ATENÇÃO: Renomeado 'steps' para 'tasks' para corresponder
    // ao componente MissionDetails.jsx
    // -------------------------------------------------------------
    const mockMissions = [
      {
        id: 1,
        title: "Análise de Mercado Q4",
        category: "Estratégia",
        status: "Em Andamento",
        progress: 38,
        deadline: "25/11/2025",
        totalTasks: 8,
        completedTasks: 3,
        accumulatedPoints: 275,
        description: "Esta missão é focada na consolidação dos resultados e planejamento estratégico do último trimestre do ano fiscal (Q4). Inclui tarefas de conhecimento, administrativas e de engajamento da equipe.",
        // ❗ CORREÇÃO 2: Renomeado 'steps' para 'tasks'
        tasks: [ 
          { id: 1, name: "Quiz: Fundamentos de Q4", pontos: 250, completed: false, category: 'Conhecimento' },
          { id: 2, name: "Flashcards: Termos Técnicos", pontos: 150, completed: false, category: 'Conhecimento' },
          { id: 3, name: "Envio: Documento de Escopo", pontos: 100, completed: true, category: 'Administrativas' },
          { id: 4, name: "Preencher Formulário de Feedback", pontos: 50, completed: false, category: 'Administrativas' },
          { id: 5, name: "Postagem no LinkedIn", pontos: 100, completed: true, category: 'Engajamento' },
          { id: 6, name: "Comentar 3 Posts da Equipe", pontos: 75, completed: true, category: 'Engajamento' },
          { id: 7, name: "Reunião de Alinhamento", pontos: 0, completed: false, category: 'Administrativas' },
          { id: 8, name: "Validação de Dados", pontos: 0, completed: false, category: 'Conhecimento' },
        ]
      },
      {
        id: 2,
        title: "Treinamento de Equipe",
        category: "Desenvolvimento",
        status: "Em Andamento",
        progress: 20,
        deadline: "05/12/2025",
        totalTasks: 5,
        completedTasks: 1,
        accumulatedPoints: 50,
        description: "Capacitação em novas tecnologias.",
        tasks: [
          { id: 9, name: "Módulo 1: Fundamentos", pontos: 50, completed: true, category: 'Conhecimento' },
          { id: 10, name: "Módulo 2: Avançado", pontos: 100, completed: false, category: 'Conhecimento' },
          { id: 11, name: "Projeto prático", pontos: 200, completed: false, category: 'Administrativas' },
          { id: 12, name: "Avaliação final", pontos: 100, completed: false, category: 'Conhecimento' },
          { id: 13, name: "Certificação", pontos: 50, completed: false, category: 'Administrativas' }
        ]
      },
      {
        id: 3,
        title: "Otimização de SEO",
        category: "Marketing",
        status: "Em Andamento",
        progress: 85,
        deadline: "30/11/2025",
        totalTasks: 20,
        completedTasks: 17,
        accumulatedPoints: 420,
        description: "Melhorar o ranking de busca do site.",
        tasks: [
          { id: 14, name: "Auditoria de conteúdo", pontos: 50, completed: true, category: 'Conhecimento' },
          { id: 15, name: "Otimização de meta tags", pontos: 70, completed: true, category: 'Administrativas' },
        ]
      },
      {
        id: 4,
        title: "Missão Concluída (Exemplo)",
        category: "Administrativo",
        status: "Concluída",
        progress: 100,
        deadline: "10/10/2025",
        totalTasks: 4,
        completedTasks: 4,
        accumulatedPoints: 300,
        description: "Missão de exemplo que já foi finalizada.",
        tasks: [
          { id: 16, name: "Passo A", pontos: 150, completed: true, category: 'Administrativas' },
          { id: 17, name: "Passo B", pontos: 150, completed: true, category: 'Administrativas' },
        ]
      },
    ];

    setMissions(mockMissions);
  }, []);

  const filteredMissions = missions.filter(mission => {
    if (activeTab === 'active') {
      return mission.progress < 100;
    } else if (activeTab === 'completed') {
      return mission.progress === 100;
    }
    return true;
  });

  const handleOpenMission = (mission) => {
    // Ação: Define qual missão será exibida em tela cheia
    setSelectedMission(mission);
  };

  const handleBackToMissions = () => {
    // Ação: Retorna para a lista de cards
    setSelectedMission(null);
  };

  const handleCompleteStep = (stepId) => {
    // 1. Atualiza o estado global 'missions'
    setMissions((prev) =>
      prev.map((mission) => {
        if (mission.id !== selectedMission.id) return mission;
        
        let newCompletedTasks = mission.completedTasks;
        let newAccumulatedPoints = mission.accumulatedPoints;
        
        // ❗ Ajuste: Mapeia 'tasks' (antes 'steps')
        const newTasks = mission.tasks.map((s) => { 
          if (s.id === stepId && !s.completed) {
            newCompletedTasks += 1;
            newAccumulatedPoints += s.pontos || 0;
            // ❗ Ajuste: No MissionDetails, a propriedade é 'status', mas o componente pai usa 'completed'.
            // Manteremos 'completed' aqui, mas o MissionDetails precisará de uma pequena adaptação ou teremos que mudar o objeto.
            return { ...s, completed: true }; 
          }
          return s;
        });
        
        const newProgress = Math.round((newCompletedTasks / mission.totalTasks) * 100);
        
        return {
          ...mission,
          tasks: newTasks, // ❗ Ajuste
          completedTasks: newCompletedTasks,
          accumulatedPoints: newAccumulatedPoints,
          progress: newProgress,
          status: newProgress === 100 ? 'Concluída' : 'Em Andamento'
        };
      })
    );

    // 2. Atualiza o estado 'selectedMission' para refletir a mudança imediata na tela de detalhes
    setSelectedMission((prev) => {
      if (!prev) return null;
      
      let newCompletedTasks = prev.completedTasks;
      let newAccumulatedPoints = prev.accumulatedPoints;

      // ❗ Ajuste: Mapeia 'tasks' (antes 'steps')
      const newTasks = prev.tasks.map((s) => {
        if (s.id === stepId && !s.completed) {
            newCompletedTasks += 1;
            newAccumulatedPoints += s.pontos || 0;
            return { ...s, completed: true };
        }
        return s;
      });

      const newProgress = Math.round((newCompletedTasks / prev.totalTasks) * 100);

      return {
        ...prev,
        tasks: newTasks, // ❗ Ajuste
        completedTasks: newCompletedTasks,
        accumulatedPoints: newAccumulatedPoints,
        progress: newProgress,
        status: newProgress === 100 ? 'Concluída' : 'Em Andamento'
      };
    });
  };

  const getTabClasses = (tabName) => {
    return activeTab === tabName
      ? 'border-b-2 border-blue-600 text-blue-600 font-semibold pb-1 cursor-pointer'
      : 'text-gray-500 hover:text-gray-700 pb-1 cursor-pointer';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      
      {/* ❗ CORREÇÃO 3: Renderização Condicional */}
      {selectedMission ? (
        
        // ➡️ TELA DE DETALHES (substitui a lista de cards)
        <MissionDetails
          mission={selectedMission}
          onBack={handleBackToMissions} // Botão Voltar
          // Se MissionDetails tiver um botão de conclusão, use:
          // onCompleteStep={handleCompleteStep} 
        />
        
      ) : (
        
        // ⬅️ TELA DA LISTA DE CARDS (oculta quando selectedMission existe)
        <>
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Minhas Missões</h1>
          
          {/* Container das Abas */}
          <div className="flex space-x-4 border-b border-gray-200 mb-6">
            <div
              className={getTabClasses('active')}
              onClick={() => setActiveTab('active')}
            >
              Missões Ativas
            </div>
            <div
              className={getTabClasses('completed')}
              onClick={() => setActiveTab('completed')}
            >
              Missões Concluídas
            </div>
          </div>

          {/* Exibição dos Cards de Missão */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredMissions.length > 0 ? (
              filteredMissions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  onClick={() => handleOpenMission(mission)} // Clique abre a tela de detalhes
                />
              ))
            ) : (
              <p className="col-span-3 text-gray-500 italic">
                {activeTab === 'active' 
                  ? 'Nenhuma missão ativa no momento.' 
                  : 'Nenhuma missão concluída.'
                }
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}