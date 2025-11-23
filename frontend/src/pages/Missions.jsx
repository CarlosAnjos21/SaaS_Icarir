import { useState, useEffect } from "react";
import MissionCard from "../components/missions/MissionCard";
import MissionDetailsModal from "../components/missions/MissionDetailsModal";

export default function Missions() {
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  // Estado para controlar a aba selecionada: 'active' ou 'completed'
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    // MOCK ATUALIZADO para se parecer com o design.
    // Adicionado: category, deadline, totalTasks, completedTasks, status e progress.
    const mockMissions = [
      {
        id: 1,
        title: "Análise de Mercado",
        category: "Estratégia",
        status: "Em Andamento", // Usado para determinar se é 'Ativa'
        progress: 60, // Progresso em porcentagem
        deadline: "25/11/2025",
        totalTasks: 5,
        completedTasks: 3,
        description: "Realizar uma análise aprofundada do mercado.",
        steps: [
          { id: 1, text: "Pesquisa de concorrentes", completed: true },
          { id: 2, text: "Identificação de público-alvo", completed: true },
          { id: 3, text: "Análise SWOT", completed: true },
          { id: 4, text: "Definir estratégia de preços", completed: false },
          { id: 5, text: "Relatório final", completed: false }
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
        description: "Capacitação em novas tecnologias.",
        steps: [
          { id: 1, text: "Módulo 1: Fundamentos", completed: true },
          { id: 2, text: "Módulo 2: Avançado", completed: false },
          { id: 3, text: "Projeto prático", completed: false },
          { id: 4, text: "Avaliação final", completed: false },
          { id: 5, text: "Certificação", completed: false }
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
        description: "Melhorar o ranking de busca do site.",
        steps: [
          // Exemplo de passos para SEO
          { id: 1, text: "Auditoria de conteúdo", completed: true },
          { id: 2, text: "Otimização de meta tags", completed: true },
          // ... mais passos
        ]
      },
      {
        id: 4,
        title: "Missão Concluída (Exemplo)",
        category: "Administrativo",
        status: "Concluída", // Marcada como Concluída
        progress: 100,
        deadline: "10/10/2025",
        totalTasks: 4,
        completedTasks: 4,
        description: "Missão de exemplo que já foi finalizada.",
        steps: [
          { id: 1, text: "Passo A", completed: true },
          { id: 2, text: "Passo B", completed: true },
        ]
      },
    ];

    setMissions(mockMissions);
  }, []);

  // Filtra as missões com base na aba selecionada
  const filteredMissions = missions.filter(mission => {
    if (activeTab === 'active') {
      // Uma missão é considerada 'ativa' se o progresso for < 100
      return mission.progress < 100;
    } else if (activeTab === 'completed') {
      // Uma missão é considerada 'concluída' se o progresso for 100
      return mission.progress === 100;
    }
    return true; // Retorna todas se houver um erro no activeTab
  });

  const handleOpenMission = (mission) => {
    setSelectedMission(mission);
  };

  const handleCloseModal = () => {
    setSelectedMission(null);
  };

  const handleCompleteStep = (stepId) => {
    setMissions((prev) =>
      prev.map((mission) =>
        mission.id === selectedMission.id
          ? {
              ...mission,
              steps: mission.steps.map((s) =>
                s.id === stepId ? { ...s, completed: true } : s
              ),
              // Lógica de atualização de progresso/tarefas concluídas
              completedTasks: mission.completedTasks + 1,
              progress: Math.round(((mission.completedTasks + 1) / mission.totalTasks) * 100)
            }
          : mission
      )
    );

    // Atualiza também a missão selecionada para que o modal reflita a mudança imediatamente
    setSelectedMission((prev) => {
      const newCompletedTasks = prev.completedTasks + 1;
      const newProgress = Math.round((newCompletedTasks / prev.totalTasks) * 100);
      
      return {
        ...prev,
        completedTasks: newCompletedTasks,
        progress: newProgress,
        steps: prev.steps.map((s) =>
          s.id === stepId ? { ...s, completed: true } : s
        )
      }
    });
  };

  // Funções auxiliares para classes de abas
  const getTabClasses = (tabName) => {
    return activeTab === tabName
      ? 'border-b-2 border-blue-600 text-blue-600 font-semibold pb-1 cursor-pointer' // Aba ativa
      : 'text-gray-500 hover:text-gray-700 pb-1 cursor-pointer'; // Aba inativa
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Minhas Missões</h1>
      
      {/* Container das Abas (abas 'Missões Ativas' e 'Missões Concluídas') */}
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
              onClick={() => handleOpenMission(mission)}
              // O MissionCard precisará ser atualizado para exibir todos os dados do mock
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

      {/* Modal de Detalhes da Missão */}
      {selectedMission && (
        <MissionDetailsModal
          mission={selectedMission}
          onClose={handleCloseModal}
          onCompleteStep={handleCompleteStep}
          // O MissionDetailsModal precisará exibir o progresso e o botão de completar
        />
      )}
    </div>
  );
}