import { useEffect, useState } from "react";

export default function Admin() {
  const [clientes, setClientes] = useState([]);
  const [missoes, setMissoes] = useState([]);
  const [clientId, setClientId] = useState("");
  const [description, setDescription] = useState("");
  const [pointsEarned, setPointsEarned] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Carrega os dados dos arquivos JSON ao montar o componente
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
      missionId: Date.now(),
      clientId: parseInt(clientId),
      description,
      pointsEarned: parseInt(pointsEarned),
    };

    // Aqui você salvaria no backend ou atualizaria o arquivo JSON
    console.log("Missão criada:", novaMissao);

    // Opcional: atualizar a lista local de missões
    setMissoes((prev) => [...prev, novaMissao]);

    // Limpar os campos
    setClientId("");
    setDescription("");
    setPointsEarned("");
  };

  if (loading) return <p>Carregando dados...</p>;
  if (error) return <p style={{ color: "red" }}>Erro: {error}</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Criar Missão</h1>

      <label className="block mb-2">Participante:</label>
      <select
        value={clientId}
        onChange={(e) => setClientId(e.target.value)}
        className="border p-2 w-full mb-4"
      >
        <option value="">Selecione</option>
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <label className="block mb-2">Descrição da Missão:</label>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 w-full mb-4"
      />

      <label className="block mb-2">Pontos:</label>
      <input
        type="number"
        value={pointsEarned}
        onChange={(e) => setPointsEarned(e.target.value)}
        className="border p-2 w-full mb-4"
      />

      <button
        onClick={handleSubmit}
        className="bg-[#394C97] text-white px-4 py-2 rounded"
      >
        Criar Missão
      </button>
    </div>
  );
}