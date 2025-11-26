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

import { Trophy, Zap, Plane, Calendar, MapPin, CheckCircle } from 'lucide-react';

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

const PRIMARY_COLOR = '#394C97';
const ACCENT_COLOR = '#FF8C00';

// ===================================================================
// DADOS MOCKADOS
// ===================================================================

const careerStats = {
  missionsCompleted: 18,
  totalPoints: 540,
  tripsMade: 5,
  badgesEarned: ["Explorador", "Veterano", "Conquistador"],
  timeline: [
    { date: "03 de Novembro", event: "Missão 'Desafio da Serra' concluída" },
    { date: "06 de Novembro", event: "Viagem registrada: Maranguape - Guaramiranga" },
    { date: "09 de Novembro", event: "Conquista desbloqueada: 'Veterano'" },
  ],
};

// ===================================================================
// DADOS DOS GRÁFICOS (COM OPÇÕES PADRÃO MELHORADAS)
// ===================================================================

const missionsByDay = {
  labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
  datasets: [
    {
      label: "Missões Concluídas",
      data: [3, 4, 2, 5, 3, 1, 0],
      backgroundColor: PRIMARY_COLOR,
      borderRadius: 5,
      hoverBackgroundColor: ACCENT_COLOR, // Feedback visual ao passar o mouse
    },
  ],
};

const pointsByMonth = {
  labels: ["Agosto", "Setembro", "Outubro", "Novembro"],
  datasets: [
    {
      label: "Pontos Acumulados",
      data: [120, 160, 180, 80],
      borderColor: PRIMARY_COLOR,
      backgroundColor: 'rgba(57, 76, 151, 0.2)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: PRIMARY_COLOR,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: ACCENT_COLOR,
      pointHoverBorderColor: PRIMARY_COLOR,
      pointRadius: 5,
      pointHoverRadius: 7,
    },
  ],
};

const tripsByDestination = {
  labels: ["Guaramiranga", "Fortaleza", "Jericoacoara", "Canoa Quebrada"],
  datasets: [
    {
      label: "Viagens",
      data: [2, 1, 1, 1],
      backgroundColor: [PRIMARY_COLOR, ACCENT_COLOR, "#4CAF50", "#E91E63"],
      hoverOffset: 8, // Aumenta o destaque ao passar o mouse
      borderWidth: 2, // Adiciona uma pequena borda para separar as fatias
      borderColor: '#ffffff', // Borda branca para fatias
    },
  ],
};

// ===================================================================
// OPÇÕES DOS GRÁFICOS (Para profissionalismo e transparência)
// ===================================================================

const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false, // Permite que o gráfico se ajuste melhor ao container
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        font: {
          size: 14,
          family: 'Inter, sans-serif' // Usando uma fonte mais comum e moderna
        },
        color: '#4A5568', // Cor mais escura para a legenda
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0,0,0,0.7)',
      titleColor: '#fff',
      bodyColor: '#fff',
      titleFont: { size: 14, weight: 'bold' },
      bodyFont: { size: 12 },
      padding: 10,
      caretSize: 8,
      borderRadius: 4,
    },
  },
  scales: {
    x: {
      grid: {
        display: false, // Remove as linhas de grade do eixo X
        drawBorder: false, // Remove a borda do eixo X
      },
      ticks: {
        color: '#6B7280', // Cor dos rótulos do eixo X
        font: { family: 'Inter, sans-serif' }
      }
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.05)', // Linhas de grade mais claras e transparentes no eixo Y
        drawBorder: false, // Remove a borda do eixo Y
      },
      ticks: {
        beginAtZero: true,
        color: '#6B7280', // Cor dos rótulos do eixo Y
        font: { family: 'Inter, sans-serif' }
      }
    }
  }
};

// Opções específicas para cada tipo de gráfico
const barChartOptions = {
  ...commonChartOptions,
  scales: {
    x: {
      ...commonChartOptions.scales.x,
      grid: {
        display: false // Barras geralmente não precisam de grid X
      }
    },
    y: {
      ...commonChartOptions.scales.y,
      beginAtZero: true,
      max: 6, // Exemplo: define um máximo para o eixo Y
      ticks: {
        stepSize: 1 // Força steps de 1 em 1
      }
    }
  }
};

const lineChartOptions = {
  ...commonChartOptions,
  scales: {
    x: {
      ...commonChartOptions.scales.x,
    },
    y: {
      ...commonChartOptions.scales.y,
      beginAtZero: true,
    }
  }
};

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'right', // Legenda à direita para gráficos de pizza
      labels: {
        font: {
          size: 14,
          family: 'Inter, sans-serif'
        },
        color: '#4A5568',
      },
    },
    tooltip: {
      ...commonChartOptions.plugins.tooltip // Usa as mesmas configurações de tooltip
    },
  },
  layout: {
    padding: 20 // Adiciona um pouco de padding ao gráfico
  },
  elements: {
    arc: {
      borderWidth: 2,
      borderColor: '#ffffff', // Borda branca para separar as fatias
    }
  }
};


// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

export default function CareerPanel() {
  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen pt-[90px]">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-10 border-b pb-2">
        🏆 Painel de Carreira
      </h1>

      {/* ------------------ ESTATÍSTICAS PRINCIPAIS ------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard
          title="Missões Concluídas"
          value={careerStats.missionsCompleted}
          icon={CheckCircle}
          color="text-green-600"
        />
        <StatCard
          title="Pontos Totais"
          value={careerStats.totalPoints}
          icon={Zap}
          color="text-yellow-600"
        />
        <StatCard
          title="Viagens Registradas"
          value={careerStats.tripsMade}
          icon={Plane}
          color="text-blue-600"
        />
      </div>

      <hr className="my-10" />

      {/* ------------------ CONQUISTAS E LINHA DO TEMPO (2 COLUNAS) ------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-1 bg-white shadow-xl rounded-xl p-6">
          <h2 className="text-2xl font-bold flex items-center text-gray-800 mb-4">
            <Trophy className="w-6 h-6 mr-2 text-orange-500" />
            Suas Conquistas
          </h2>
          <div className="flex gap-3 flex-wrap">
            {careerStats.badgesEarned.map((badge, index) => (
              <span
                key={index}
                className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-md hover:bg-orange-600 transition"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white shadow-xl rounded-xl p-6">
          <h2 className="text-2xl font-bold flex items-center text-gray-800 mb-4">
            <Calendar className="w-6 h-6 mr-2 text-indigo-500" />
            Últimas Atividades
          </h2>
          <ul className="border-l-4 border-indigo-200 pl-6 space-y-6">
            {careerStats.timeline.map((item, index) => (
              <li key={index} className="relative">
                <span className="absolute -left-8 top-0 w-4 h-4 bg-indigo-500 rounded-full border-4 border-white"></span>
                <p className="text-gray-900 font-semibold">
                  {item.event}
                </p>
                <p className="text-sm text-gray-500">{item.date}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <hr className="my-10" />

      {/* ------------------ GRÁFICOS ------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Missões por Dia da Semana (Barra) */}
        <ChartCard title="Frequência de Missões">
          <Bar data={missionsByDay} options={barChartOptions} /> {/* Passando as opções */}
        </ChartCard>

        {/* Pontos Acumulados por Mês (Linha) */}
        <ChartCard title="Evolução de Pontuação">
          <Line data={pointsByMonth} options={lineChartOptions} /> {/* Passando as opções */}
        </ChartCard>

        {/* Viagens por Destino (Pizza/Doughnut) */}
        <ChartCard title="Distribuição de Viagens" className="lg:col-span-1">
          <Pie data={tripsByDestination} options={pieChartOptions} /> {/* Passando as opções */}
        </ChartCard>
      </div>
    </div>
  );
}

// ===================================================================
// COMPONENTES AUXILIARES (Mantidos)
// ===================================================================

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition duration-300">
    <div className="flex justify-between items-center">
      <div className="text-left">
        <h2 className="text-lg font-medium text-gray-500">{title}</h2>
        <p className={`text-4xl font-extrabold ${color} mt-1`}>{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color.replace('text-', 'bg-')} bg-opacity-10`}>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>

    </div>
  </div>
);

const ChartCard = ({ title, children, className = '' }) => (
  <div className={`bg-white shadow-xl rounded-xl p-6 h-80 flex flex-col ${className}`}> {/* Adicionado h-80 e flex-col */}
    <h2 className="text-xl font-bold flex items-center text-gray-800 mb-6 border-b pb-2">
      {title}
    </h2>
    <div className="flex-grow flex items-center justify-center"> {/* Centraliza e permite crescimento */}
      {children}
    </div>
  </div>
);