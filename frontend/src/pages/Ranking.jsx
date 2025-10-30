import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function Ranking() {
  const [clientes, setClientes] = useState([]);
  const [missoes, setMissoes] = useState([]);
  const [completacoes, setCompletacoes] = useState([]);
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [clientsRes, missionsRes, completionsRes] = await Promise.all([
          fetch("/data/clients.json"),
          fetch("/data/missions.json"),
          fetch("/data/completions.json"),
        ]);

        const [clientsData, missionsData, completionsData] = await Promise.all([
          clientsRes.json(),
          missionsRes.json(),
          completionsRes.json(),
        ]);

        const storedClients = JSON.parse(localStorage.getItem("clients") || "[]");
        const allClients = [...clientsData, ...storedClients];
        setClientes(allClients);
        setMissoes(missionsData);
        setCompletacoes(completionsData);

        const ranking = allClients.map((client) => {
          const completedMissions = completionsData.filter(
            (c) => c.clientId === client.id
          );
          const totalPoints = completedMissions.reduce((sum, c) => {
            const mission = missionsData.find((m) => m.id === c.missionId);
            return sum + (mission?.points || 0);
          }, 0);

          return { ...client, points: totalPoints };
        });

        setRankingData(ranking);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const podium = [...rankingData].sort((a, b) => b.points - a.points).slice(0, 3);
  const others = [...rankingData].sort((a, b) => b.points - a.points).slice(3);

  const medalStyles = [
    { label: "🥇", color: "from-yellow-400 to-yellow-600" },
    { label: "🥈", color: "from-gray-300 to-gray-500" },
    { label: "🥉", color: "from-[#E39B5E] to-[#A64B00]" },
  ];

  if (loading) return <p className="text-center mt-20">Carregando ranking...</p>;
  if (error) return <p className="text-center mt-20 text-red-600">Erro: {error}</p>;

  return (
    <div className="min-h-screen bg-[#FEF7EC] text-[#262626]">
      <Navbar />

      <section className="pt-[160px] px-6 pb-12 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#394C97] mb-10 text-center">
          Ranking de Participantes
        </h1>

        {/* Pódio */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {podium.map((user, index) => (
            <div
              key={user.id}
              className={`rounded-xl shadow-lg p-6 text-center bg-gradient-to-br ${medalStyles[index].color} text-black transform hover:scale-[1.03] transition`}
            >
              <div className="text-5xl mb-2">{medalStyles[index].label}</div>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white text-[#394C97] flex items-center justify-center text-xl font-bold shadow-md">
                {user.initials}
              </div>
              <h2 className="text-lg font-semibold">{user.name}</h2>
              <p className="mt-2 text-xl font-bold">{user.points} EXP</p>
            </div>
          ))}
        </div>

        {/* Lista dos demais participantes */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <ul>
            {others.map((user, index) => (
              <li
                key={user.id}
                className="flex justify-between items-center px-6 py-4 border-b border-[#262626]/10 hover:bg-[#FEF7EC] transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#394C97] text-white flex items-center justify-center font-bold">
                    {user.initials}
                  </div>
                  <span className="text-lg group-hover:underline">
                    {index + 4}. {user.name}
                  </span>
                </div>
                <span className="text-lg font-semibold text-[#FE5900]">
                  {user.points} EXP
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-center text-sm text-[#262626]/60">
          Atualizado em{" "}
          <span className="font-medium">28 de out. de 2025, 20:55 UTC</span>
        </p>
      </section>
    </div>
  );
}
