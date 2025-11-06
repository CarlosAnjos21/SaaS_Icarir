import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function Admin() {
  const [missoes, setMissoes] = useState([]);
  const [description, setDescription] = useState("");
  const [pointsEarned, setPointsEarned] = useState("");
  const [steps, setSteps] = useState([{ id: 1, title: "" }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Redireciona se não estiver logado
  if (!token) return <Navigate to="/login" replace />;

  useEffect (() => {
    async function loadMissions() {
      try {
        const res = await fetch("http://localhost:3001/api/missions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Erro ao carregar missões do backend.");
        }

        const data = await res.json();
        setMissoes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadMissions();
  }, [token]);

  const handleSubmit = async () => {
    const novaMissao = {
      title: description,
      points: parseInt(pointsEarned),
      description,
      rewards: ["🎖 XP", "🏅 Medalha"],
      steps: steps.map((step, index) => ({
        id: index + 1,
        title: step.title,
        completedBy: [],
      })),
    };

    try {
      const res = await fetch("http://localhost:3001/api/missions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(novaMissao),
      });

      if (!res.ok) {
        throw new Error("Erro ao criar missão.");
      }

      const created = await res.json();
      setMissoes((prev) => [...prev, created]);
      setDescription("");
      setPointsEarned("");
      setSteps([{ id: 1, title: "" }]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStepChange = (index, value) => {
    const updated = [...steps];
    updated[index].title = value;
    setSteps(updated);
  };

  const addStep = () => {
    setSteps((prev) => [...prev, { id: prev.length + 1, title: "" }]);
  };

  if (loading)
    return (
      <p className="text-center mt-20 text-[#394C97]">Carregando dados...</p>
    );
  if (error)
    return <p className="text-center mt-20 text-red-600">Erro: {error}</p>;

  return (
    <div className="min-h-screen bg-[#FEF7EC] text-[#394C97] px-6 py-12">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Criar Missão</h1>

        <label className="block mb-2 font-semibold">Descrição da Missão:</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
          placeholder="Ex: Explorar o laboratório secreto"
        />

        <label className="block mb-2 font-semibold">Pontos:</label>
        <input
          type="number"
          value={pointsEarned}
          onChange={(e) => setPointsEarned(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
          placeholder="Ex: 100"
        />

        <label className="block mb-2 font-semibold">Etapas da Missão:</label>
        <div className="space-y-3 mb-6">
          {steps.map((step, index) => (
            <input
              key={step.id}
              type="text"
              value={step.title}
              onChange={(e) => handleStepChange(index, e.target.value)}
              className="border p-2 w-full rounded"
              placeholder={`Etapa ${index + 1}`}
            />
          ))}
          <button
            type="button"
            onClick={addStep}
            className="text-sm text-[#FE5900] hover:underline"
          >
            + Adicionar Etapa
          </button>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-[#FE5900] text-white font-semibold rounded-lg hover:bg-orange-600 transition"
        >
          Criar Missão
        </button>

        {missoes.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4 text-center">
              Missões Criadas
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-[#FEF7EC] text-[#394C97]">
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Título</th>
                    <th className="py-2 px-4 border-b text-left">Pontos</th>
                    <th className="py-2 px-4 border-b text-left">Etapas</th>
                  </tr>
                </thead>
                <tbody>
                  {missoes.map((missao) => (
                    <tr key={missao.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{missao.title}</td>
                      <td className="py-2 px-4 border-b">{missao.points}</td>
                      <td className="py-2 px-4 border-b">
                        {missao.steps?.length || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}