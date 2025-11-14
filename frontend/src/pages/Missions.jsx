import { useState, useEffect } from "react";
import FeedbackBar from "../components/Feedbacks/FeedbackBar";
import api from "../api/api";

export default function Missions() {
  const [missoes, setMissoes] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [activeTab, setActiveTab] = useState("ativas");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMissions() {
      try {
        const res = await api.get("/admin/missions");

        const missions = res.data;

        const missionsWithProgress = missions.map((mission) => ({
          ...mission,
          steps: mission.steps.map((step) => ({
            ...step,
            completedBy: [], // Inicialmente vazio
          })),
        }));

        setMissoes(missionsWithProgress);
        setSelectedMission(missionsWithProgress[0] || null);
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Não autorizado. Verifique suas credenciais.");
        } else {
          setError("Erro ao carregar missões.");
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchMissions();
  }, []);

  const handleCompleteStep = async (stepId) => {
    try {
      const updatedMissions = missoes.map((mission) => {
        if (mission.id === selectedMission.id) {
          const updatedSteps = mission.steps.map((step) => {
            if (step.id === stepId && !step.completedBy.includes("admin")) {
              return {
                ...step,
                completedBy: [...step.completedBy, "admin"],
              };
            }
            return step;
          });
          return { ...mission, steps: updatedSteps };
        }
        return mission;
      });

      setMissoes(updatedMissions);
      const updatedSelected = updatedMissions.find(
        (m) => m.id === selectedMission.id
      );
      setSelectedMission(updatedSelected);
    } catch (err) {
      console.error("Erro ao concluir etapa:", err);
    }
  };

  const isMissionComplete = (mission) =>
    Array.isArray(mission.steps) &&
    mission.steps.length > 0 &&
    mission.steps.every(
      (step) =>
        Array.isArray(step.completedBy) && step.completedBy.includes("admin")
    );

  const activeMissions = missoes.filter((m) => !isMissionComplete(m));
  const completedMissions = missoes.filter((m) => isMissionComplete(m));
  const missionsToShow =
    activeTab === "ativas" ? activeMissions : completedMissions;

  if (loading)
    return (
      <p className="text-center mt-20 text-[#394C97]">Carregando dados...</p>
    );
  if (error)
    return <p className="text-center mt-20 text-red-600">Erro: {error}</p>;

  return (
    <div className="min-h-screen bg-[#FEF7EC] pt-[200px] px-6 pb-12 relative">
      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-8 flex gap-6 justify-center">
        <button
          onClick={() => setActiveTab("ativas")}
          className={`px-4 py-2 rounded-full font-semibold transition ${
            activeTab === "ativas"
              ? "bg-[#FE5900] text-white"
              : "bg-white text-[#394C97] border"
          }`}
        >
          Missões Ativas
        </button>
        <button
          onClick={() => setActiveTab("concluidas")}
          className={`px-4 py-2 rounded-full font-semibold transition ${
            activeTab === "concluidas"
              ? "bg-[#FE5900] text-white"
              : "bg-white text-[#394C97] border"
          }`}
        >
          Missões Concluídas
        </button>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Lista de Missões */}
        <div className="w-full md:w-1/3 bg-white rounded-xl shadow-md p-6 space-y-6">
          <h2 className="text-2xl font-bold text-[#394C97] mb-2">Missões</h2>
          {missionsToShow.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhuma missão nesta aba.</p>
          ) : (
            missionsToShow.map((mission) => (
              <button
                key={mission.id}
                onClick={() => setSelectedMission(mission)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition relative overflow-hidden ${
                  selectedMission?.id === mission.id
                    ? "bg-blue-100 border-[#394C97] shadow-md ring-2 ring-[#394C97]/30 animate-pulse"
                    : "bg-gray-50 hover:bg-[#FEF7EC]"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#394C97]">
                    {mission.title}
                  </span>
                  <span className="text-sm text-[#FE5900] font-bold">
                    ⭐ {mission.points}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Detalhes da Missão */}
        {selectedMission && (
          <div className="w-full md:w-2/3 bg-white rounded-xl shadow-md p-8">
            <h3 className="text-3xl font-bold text-[#394C97] mb-6 flex items-center gap-2">
              <span className="animate-bounce">🚀</span> {selectedMission.title}
            </h3>
            <p className="text-lg text-gray-700 mb-6">
              {selectedMission.description}
            </p>

            <div className="mb-4">
              <h4 className="font-semibold text-[#394C97] mb-2">Recompensas</h4>
              <div className="flex gap-4 text-2xl">
                {selectedMission.rewards.map((reward, index) => (
                  <span key={index}>{reward}</span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-[#394C97] mb-2">
                Etapas da Missão
              </h4>
              <ul className="space-y-2">
                {selectedMission.steps.map((step) => {
                  const isDone = step.completedBy.includes("admin");
                  return (
                    <li
                      key={step.id}
                      className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded border"
                    >
                      <span>{step.title}</span>
                      {isDone ? (
                        <span className="text-green-600 font-semibold">
                          ✅ Concluído
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCompleteStep(step.id)}
                          className="px-3 py-1 bg-[#FE5900] text-white rounded hover:bg-orange-600"
                        >
                          Realizar
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {isMissionComplete(selectedMission) && (
              <p className="mt-4 text-green-600 font-semibold text-lg">
                🎉 Missão concluída!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Barra de Feedback flutuante */}
      <FeedbackBar />
    </div>
  );
}
