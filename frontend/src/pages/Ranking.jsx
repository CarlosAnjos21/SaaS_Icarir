import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/api";

export default function Ranking() {
  const [rankingData, setRankingData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadRanking() {
      try {
        const res = await api.get("/ranking");
        setRankingData(res.data);
        setFilteredData(res.data);
      } catch (err) {
        setError("Erro ao carregar ranking");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadRanking();
  }, []);

  useEffect(() => {
    const termo = searchTerm.toLowerCase();
    const filtrado = rankingData.filter((user) =>
      user.name.toLowerCase().includes(termo)
    );
    setFilteredData(filtrado);
  }, [searchTerm, rankingData]);

  const sortedRanking = [...filteredData].sort((a, b) => b.points - a.points);
  const podium = sortedRanking.slice(0, 3);

  const medalStyles = [
    { label: "🥇", color: "from-yellow-400 to-yellow-600" },
    { label: "🥈", color: "from-gray-300 to-gray-500" },
    { label: "🥉", color: "from-[#E39B5E] to-[#A64B00]" },
  ];

  if (loading)
    return <p className="text-center mt-20">Carregando ranking...</p>;
  if (error) return <p className="text-center mt-20 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-[#FEF7EC] text-[#262626]">
      <Navbar />

      <section className="pt-[160px] px-6 pb-12 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#394C97] mb-6 text-center">
          Ranking de Participantes
        </h1>

        <input
          type="text"
          placeholder="Buscar por nome..."
          className="mb-10 px-4 py-2 border rounded w-full max-w-md mx-auto block"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

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

        {/* Lista completa de usuários */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <ul>
            {sortedRanking.map((user, index) => (
              <li
                key={user.id}
                className="flex justify-between items-center px-6 py-4 border-b border-[#262626]/10 hover:bg-[#FEF7EC] transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#394C97] text-white flex items-center justify-center font-bold">
                    {user.initials}
                  </div>
                  <span className="text-lg group-hover:underline">
                    {index + 1}. {user.name}
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
          <span className="font-medium">
            {new Date().toLocaleString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </p>
      </section>
    </div>
  );
}
