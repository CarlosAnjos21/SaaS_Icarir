import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function CareerPanel() {
  const careerStats = {
    missionsCompleted: 18,
    totalPoints: 540,
    tripsMade: 5,
    badgesEarned: ["Explorador", "Veterano", "Conquistador"],
    timeline: [
      { date: "03 de Novembro (Segunda)", event: "Missão 'Desafio da Serra' concluída" },
      { date: "06 de Novembro (Quinta)", event: "Viagem registrada: Maranguape - Guaramiranga" },
      { date: "09 de Novembro (Domingo)", event: "Conquista desbloqueada: 'Veterano'" },
    ],
  };

  const missionsByDay = {
    labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
    datasets: [
      {
        label: "Missões Concluídas",
        data: [3, 4, 2, 5, 3, 1, 0],
        backgroundColor: "#394C97",
      },
    ],
  };

  const pointsByMonth = {
    labels: ["Agosto", "Setembro", "Outubro", "Novembro"],
    datasets: [
      {
        label: "Pontos Acumulados",
        data: [120, 160, 180, 80],
        borderColor: "#394C97",
        backgroundColor: "rgba(57,76,151,0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const tripsByDestination = {
    labels: ["Guaramiranga", "Fortaleza", "Jericoacoara", "Canoa Quebrada"],
    datasets: [
      {
        label: "Viagens",
        data: [2, 1, 1, 1],
        backgroundColor: ["#394C97", "#FF8C00", "#4CAF50", "#E91E63"],
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto pt-24 px-4 space-y-12">
      <h1 className="text-3xl font-bold text-[#394C97] mb-6">Painel de Carreira</h1>

      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-700">Missões Concluídas</h2>
          <p className="text-3xl font-bold text-[#394C97] mt-2">{careerStats.missionsCompleted}</p>
        </div>
        <div className="bg-white shadow rounded p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-700">Pontos Totais</h2>
          <p className="text-3xl font-bold text-[#394C97] mt-2">{careerStats.totalPoints}</p>
        </div>
        <div className="bg-white shadow rounded p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-700">Viagens Realizadas</h2>
          <p className="text-3xl font-bold text-[#394C97] mt-2">{careerStats.tripsMade}</p>
        </div>
      </div>

      {/* Badges */}
      <div>
        <h2 className="text-xl font-semibold text-[#394C97] mb-2">Conquistas</h2>
        <div className="flex gap-3 flex-wrap">
          {careerStats.badgesEarned.map((badge, index) => (
            <span
              key={index}
              className="bg-[#394C97] text-white px-3 py-1 rounded-full text-sm"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Linha do tempo */}
      <div>
        <h2 className="text-xl font-semibold text-[#394C97] mb-2">Linha do Tempo</h2>
        <ul className="border-l-2 border-[#394C97] pl-4 space-y-4">
          {careerStats.timeline.map((item, index) => (
            <li key={index} className="relative">
              <span className="absolute -left-2 top-1 w-3 h-3 bg-[#394C97] rounded-full"></span>
              <p className="text-gray-700">
                <strong>{item.date}:</strong> {item.event}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Missões por Dia da Semana
          </h2>
          <Bar data={missionsByDay} />
        </div>

        <div className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Pontos Acumulados por Mês
          </h2>
          <Line data={pointsByMonth} />
        </div>

        <div className="bg-white shadow rounded p-6 col-span-1 md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Viagens por Destino
          </h2>
          <Pie data={tripsByDestination} />
        </div>
      </div>
    </div>
  );
}