import { useState } from "react";
import Navbar from "../components/Navbar";
import FeedbackBar from "../components/Feedbacks/FeedbackBar";

// --- DADOS MOCKADOS ---
const MOCK_RANKING_DATA = [
  { id: 1, name: "Roberto Silva", points: 5200, initials: "RS", department: "Comercial", variation: 1, avatar: "https://i.pravatar.cc/150?img=11" },
  { id: 2, name: "Mariana Costa", points: 4850, initials: "MC", department: "Marketing", variation: 2, avatar: "https://i.pravatar.cc/150?img=5" },
  { id: 3, name: "Julia Mendes", points: 4600, initials: "JM", department: "Vendas", variation: -1, avatar: "https://i.pravatar.cc/150?img=9" },
  { id: 4, name: "Fernanda Oliveira", points: 4100, initials: "FO", department: "Marketing", variation: 2, avatar: "https://i.pravatar.cc/150?img=1" },
  { id: 5, name: "Lucas Santos", points: 3950, initials: "LS", department: "Vendas", variation: -1, avatar: "https://i.pravatar.cc/150?img=3" },
  { id: 6, name: "Patricia Lima", points: 3800, initials: "PL", department: "Operações", variation: 0, avatar: null },
  { id: 7, name: "Ricardo Alves", points: 3650, initials: "RA", department: "TI", variation: 4, avatar: "https://i.pravatar.cc/150?img=13" },
  { id: 8, name: "Sofia Martins", points: 3500, initials: "SM", department: "RH", variation: -2, avatar: "https://i.pravatar.cc/150?img=20" },
  { id: 9, name: "Bruno Costa", points: 3350, initials: "BC", department: "Financeiro", variation: 0, avatar: "https://i.pravatar.cc/150?img=33" },
  { id: 10, name: "Amanda Souza", points: 3200, initials: "AS", department: "Jurídico", variation: 1, avatar: "https://i.pravatar.cc/150?img=41" },
  { id: 11, name: "Diego Pereira", points: 3000, initials: "DP", department: "TI", variation: -3, avatar: null },
  { id: 12, name: "Carlos Anjos", points: 2850, initials: "CA", department: "Desenvolvimento", variation: 2, avatar: null },
  { id: 13, name: "Beatriz Silva", points: 2500, initials: "BS", department: "Atendimento", variation: 0, avatar: "https://i.pravatar.cc/150?img=44" },
];

const VariationTag = ({ value }) => {
  const val = value || 0;
  if (val === 0) return <span className="text-gray-400 font-bold">-</span>;
  const isPositive = val > 0;
  const bgColor = isPositive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600";
  const arrow = isPositive ? "▲" : "▼";

  return (
    <div className={`flex items-center justify-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${bgColor} w-16`}>
      <span>{arrow} {Math.abs(val)}</span>
    </div>
  );
};

export default function Ranking() {
  const [searchTerm, setSearchTerm] = useState("");

  const currentUser = {
    name: "Você (Carlos_Anjos21)",
    points: 2850,
    rank: 12,
    initials: "CA",
    department: "Desenvolvimento - Nível 4"
  };

  // 1. Ordena TODOS os dados por pontos (Essa é a verdade absoluta do ranking)
  const sortedGlobal = [...MOCK_RANKING_DATA].sort((a, b) => b.points - a.points);

  // 2. Extrai o Top 3 FIXO (Não muda com a busca)
  const [firstPlace, secondPlace, thirdPlace] = sortedGlobal;

  // 3. Pega o resto da lista (do 4º em diante)
  const restOfListOriginal = sortedGlobal.slice(3);

  // 4. Aplica o filtro APENAS na lista de baixo
  const listData = restOfListOriginal.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função auxiliar para descobrir a posição REAL do usuário no ranking global
  const getRealRank = (userId) => {
    return sortedGlobal.findIndex(u => u.id === userId) + 1;
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24 text-gray-800 font-sans pt-[50px]">
      <Navbar />

      <section className="pt-8 px-4 max-w-4xl mx-auto">
        
        {/* Cabeçalho e Busca */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-[#002B5B] mb-2">
            Líderes da Temporada
          </h2>
          <p className="text-gray-500 text-sm mb-6">O ranking é atualizado diariamente</p>
          
          <input
            type="text"
            placeholder="Buscar na lista de participantes..."
            className="px-4 py-2 border border-gray-300 rounded-full w-full max-w-sm mx-auto block shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* --- PÓDIO (TOP 3 FIXO - NÃO MUDA COM A BUSCA) --- */}
        <div className="flex justify-center items-end gap-3 md:gap-8 mb-16">
            
            {/* 2º LUGAR */}
            <div className="flex flex-col items-center">
                <div className="relative mb-2">
                    {secondPlace.avatar ? (
                    <img src={secondPlace.avatar} alt={secondPlace.name} className="w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-gray-300 object-cover" />
                    ) : (
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-gray-300 bg-gray-200 flex items-center justify-center font-bold text-gray-600">{secondPlace.initials}</div>
                    )}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-400 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">#2</div>
                </div>
                <h3 className="font-bold text-gray-800 text-xs md:text-sm text-center max-w-[80px] truncate">{secondPlace.name}</h3>
                <p className="text-blue-900 font-extrabold mb-2 text-sm">{secondPlace.points}</p>
                <div className="w-20 md:w-32 h-28 md:h-32 bg-gradient-to-b from-gray-200 to-gray-300 rounded-t-lg shadow-sm"></div>
            </div>

            {/* 1º LUGAR */}
            <div className="flex flex-col items-center z-10 -mt-6 md:-mt-10">
                <div className="relative mb-2">
                    {firstPlace.avatar ? (
                    <img src={firstPlace.avatar} alt={firstPlace.name} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-yellow-400 object-cover" />
                    ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-yellow-400 bg-yellow-100 flex items-center justify-center font-bold text-yellow-700 text-xl">{firstPlace.initials}</div>
                    )}
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full border-2 border-white shadow-sm">#1</div>
                </div>
                <h3 className="font-bold text-gray-800 text-sm text-center max-w-[100px] truncate">{firstPlace.name}</h3>
                <p className="text-yellow-600 font-extrabold text-lg mb-2">{firstPlace.points}</p>
                <div className="w-24 md:w-40 h-36 md:h-44 bg-gradient-to-b from-yellow-200 via-yellow-300 to-yellow-400 rounded-t-lg shadow-md relative overflow-hidden">
                    <div className="absolute inset-0 bg-white opacity-20 bg-gradient-to-tr from-transparent via-white to-transparent transform rotate-45 translate-y-full animate-pulse"></div>
                </div>
            </div>

            {/* 3º LUGAR */}
            <div className="flex flex-col items-center">
                <div className="relative mb-2">
                    {thirdPlace.avatar ? (
                    <img src={thirdPlace.avatar} alt={thirdPlace.name} className="w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-orange-300 object-cover" />
                    ) : (
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-orange-300 bg-orange-100 flex items-center justify-center font-bold text-orange-700">{thirdPlace.initials}</div>
                    )}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">#3</div>
                </div>
                <h3 className="font-bold text-gray-800 text-xs md:text-sm text-center max-w-[80px] truncate">{thirdPlace.name}</h3>
                <p className="text-blue-900 font-extrabold mb-2 text-sm">{thirdPlace.points}</p>
                <div className="w-20 md:w-32 h-20 md:h-24 bg-gradient-to-b from-orange-200 to-orange-300 rounded-t-lg shadow-sm"></div>
            </div>

        </div>

        {/* --- LISTA DO 4º EM DIANTE (FILTRÁVEL) --- */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-12 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">
            <div className="col-span-2 md:col-span-1 text-center">Pos</div>
            <div className="col-span-7 md:col-span-7 text-left">Participante</div>
            <div className="col-span-3 md:col-span-2 text-right">Pontos</div>
        {/* <div className="col-span-2 text-center hidden md:block">Var</div> */}
          </div>

          <div className="space-y-2">
            {listData.length > 0 ? (
                listData.map((user) => (
                <div key={user.id} className="grid grid-cols-12 items-center bg-white border border-gray-100 hover:border-blue-100 hover:shadow-md hover:bg-blue-50/30 rounded-lg p-3 transition-all">
                    
                    {/* Posição Real (Calculada com base na lista global, não no índice filtrado) */}
                    <div className="col-span-2 md:col-span-1 text-center font-bold text-gray-500">
                      {getRealRank(user.id)}º
                    </div>
                    
                    <div className="col-span-7 md:col-span-7 flex items-center gap-3">
                        {user.avatar ? (
                           <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                        ) : (
                           <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                             {user.initials}
                           </div>
                        )}
                        <div className="overflow-hidden">
                            <h4 className="font-bold text-gray-800 text-sm md:text-base truncate">{user.name}</h4>
                            <p className="text-[10px] md:text-xs text-gray-400 uppercase truncate">{user.department}</p>
                        </div>
                    </div>

                    <div className="col-span-3 md:col-span-4 text-right font-extrabold text-gray-800 text-sm md:text-base">
                        {user.points}
                    </div>
                    
                {/* <div className="col-span-2 hidden md:flex justify-center">
                        <VariationTag value={user.variation} />
                    </div> */}
                </div>
                ))
            ) : (
                <p className="text-center text-gray-400 py-4">Nenhum participante encontrado na lista.</p>
            )}
          </div>
        </div>

      </section>

      {/* --- FOOTER FIXO --- */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] py-3 px-4 md:px-8 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-900 text-white font-bold text-sm w-10 h-10 flex flex-col items-center justify-center rounded-lg leading-tight shadow-md">
              <span className="text-[8px] uppercase opacity-80">Rank</span>
              <span>{currentUser.rank}</span>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm">{currentUser.name}</h4>
              <p className="text-xs text-gray-500">{currentUser.department}</p>
            </div>
          </div>
          <div className="text-right">
             <div className="text-xl md:text-2xl font-extrabold text-blue-900 leading-none">
              {currentUser.points} <span className="text-xs font-normal text-gray-400">pts</span>
            </div>
            <div className="text-[10px] text-gray-400 mt-1 hidden sm:block">Faltam 650 pts para o próximo nível</div>
          </div>
        </div>
      </div>

      <FeedbackBar />
    </div>
  );
}