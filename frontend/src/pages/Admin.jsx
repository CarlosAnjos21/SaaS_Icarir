import { useEffect, useState } from "react";

export default function Admin() {
  const [clientes, setClientes] = useState([]);
  const [missoes, setMissoes] = useState([]);
  const [description, setDescription] = useState("");
  const [pointsEarned, setPointsEarned] = useState("");
  const [steps, setSteps] = useState([{ id: 1, title: "" }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [clientsRes, missionsRes] = await Promise.all([
          fetch("/data/clients.json"),
          fetch("/data/missions.json"),
        ]);

        if (!clientsRes.ok || !missionsRes.ok) {
          throw new Error("Falha ao carregar os arquivos JSON.");
        }

        const [clientsData, missionsData] = await Promise.all([
          clientsRes.json(),
          missionsRes.json(),
        ]);

        setClientes(clientsData);
        setMissoes(missionsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSubmit = () => {
    const novaMissao = {
      id: Date.now(),
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

    console.log("Missão criada:", novaMissao);
    setMissoes((prev) => [...prev, novaMissao]);

    setDescription("");
    setPointsEarned("");
    setSteps([{ id: 1, title: "" }]);
  };

  const handleStepChange = (index, value) => {
    const updated = [...steps];
    updated[index].title = value;
    setSteps(updated);
  };

  const addStep = () => {
    setSteps((prev) => [...prev, { id: prev.length + 1, title: "" }]);
  };

  if (loading) return <p className="text-center mt-20 text-[#394C97]">Carregando dados...</p>;
  if (error) return <p className="text-center mt-20 text-red-600">Erro: {error}</p>;

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
      </div>
    </div>
  );
}