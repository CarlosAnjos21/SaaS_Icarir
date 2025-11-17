import { useState } from "react";

export default function AdminPage() {
  const [missions, setMissions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState("missões");

  const [newMission, setNewMission] = useState({
    title: "",
    steps: [{ description: "", points: 0 }],
    quiz: null,
  });

  const handleAddStep = () => {
    setNewMission((prev) => ({
      ...prev,
      steps: [...prev.steps, { description: "", points: 0 }],
    }));
  };

  const handleQuizToggle = () => {
    setShowQuiz(!showQuiz);
    if (!showQuiz) {
      setNewMission((prev) => ({
        ...prev,
        quiz: {
          question: "",
          options: ["", "", "", ""],
          correctIndex: 0,
        },
      }));
    } else {
      setNewMission((prev) => ({ ...prev, quiz: null }));
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto pt-[100px]">
      <h1 className="text-3xl font-bold text-[#394C97] mb-6">
        Administração de Missões
      </h1>

      {/* Abas de Navegação */}
      <div className="flex gap-4 border-b mb-6">
        {["missões", "criar", "estatísticas"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-4 font-medium capitalize ${
              activeTab === tab
                ? "border-b-2 border-[#394C97] text-[#394C97]"
                : "text-gray-500 hover:text-[#394C97]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Conteúdo da Aba Ativa */}
      {activeTab === "missões" && (
        <div className="grid gap-4">
          {missions.length === 0 ? (
            <p className="text-gray-500">Nenhuma missão criada ainda.</p>
          ) : (
            missions.map((mission, index) => (
              <div key={index} className="bg-white shadow p-4 rounded border">
                <h2 className="text-xl font-semibold">{mission.title}</h2>
                <ul className="mt-2 text-sm text-gray-700">
                  {mission.steps.map((step, i) => (
                    <li key={i}>
                      Etapa {i + 1}: {step.description} ({step.points} pts)
                    </li>
                  ))}
                </ul>
                {mission.quiz && (
                  <div className="mt-2 text-sm text-blue-600">
                    Quiz: {mission.quiz.question}
                  </div>
                )}
                <div className="mt-4 flex gap-3">
                  <button className="text-blue-600 hover:underline">Editar</button>
                  <button className="text-red-500 hover:underline">Excluir</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "criar" && (
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-orange text-white px-4 py-2 rounded hover:bg-orange-600 transition"
        >
          Abrir Criador de Missão
        </button>
      )}

      {activeTab === "estatísticas" && (
        <div className="text-gray-600">
          <p>📊 Em breve: painel com estatísticas das missões e desempenho dos usuários.</p>
        </div>
      )}

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-xl shadow-xl relative">
            <h2 className="text-xl font-bold mb-4">Nova Missão</h2>

            <input
              type="text"
              placeholder="Nome da missão"
              className="w-full border p-2 mb-4"
              value={newMission.title}
              onChange={(e) =>
                setNewMission({ ...newMission, title: e.target.value })
              }
            />

            <div className="space-y-3 mb-4">
              {newMission.steps.map((step, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={`Etapa ${i + 1}`}
                    className="flex-1 border p-2"
                    value={step.description}
                    onChange={(e) => {
                      const updated = [...newMission.steps];
                      updated[i].description = e.target.value;
                      setNewMission({ ...newMission, steps: updated });
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Pontos"
                    className="w-24 border p-2"
                    value={step.points}
                    onChange={(e) => {
                      const updated = [...newMission.steps];
                      updated[i].points = Number(e.target.value);
                      setNewMission({ ...newMission, steps: updated });
                    }}
                  />
                </div>
              ))}
              <button
                onClick={handleAddStep}
                className="text-sm text-blue-600 hover:underline"
              >
                + Adicionar Etapa
              </button>
            </div>

            {/* Quiz Toggle */}
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={showQuiz} onChange={handleQuizToggle} />
                Incluir Quiz
              </label>
            </div>

            {/* Quiz Form */}
            {showQuiz && newMission.quiz && (
              <div className="space-y-3 border-t pt-4">
                <input
                  type="text"
                  placeholder="Pergunta do Quiz"
                  className="w-full border p-2"
                  value={newMission.quiz.question}
                  onChange={(e) =>
                    setNewMission({
                      ...newMission,
                      quiz: { ...newMission.quiz, question: e.target.value },
                    })
                  }
                />
                {newMission.quiz.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct"
                      checked={newMission.quiz.correctIndex === i}
                      onChange={() =>
                        setNewMission({
                          ...newMission,
                          quiz: { ...newMission.quiz, correctIndex: i },
                        })
                      }
                    />
                    <input
                      type="text"
                      placeholder={`Opção ${i + 1}`}
                      className="flex-1 border p-2"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...newMission.quiz.options];
                        updated[i] = e.target.value;
                        setNewMission({
                          ...newMission,
                          quiz: { ...newMission.quiz, options: updated },
                        });
                      }}
                    />
                  </div>
                ))}
                {newMission.quiz.options.length < 5 && (
                  <button
                    onClick={() =>
                      setNewMission({
                        ...newMission,
                        quiz: {
                          ...newMission.quiz,
                          options: [...newMission.quiz.options, ""],
                        },
                      })
                    }
                    className="text-sm text-blue-600 hover:underline"
                  >
                    + Adicionar Opção
                  </button>
                )}
              </div>
            )}

            {/* Ações */}
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-600 hover:underline"
              >
                Cancelar
              </button>
              <button className="bg-[#394C97] text-white px-4 py-2 rounded hover:bg-[#2f3f7a]">
                Salvar Missão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}