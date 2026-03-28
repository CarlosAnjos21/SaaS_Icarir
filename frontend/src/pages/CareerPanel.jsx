import React, { useEffect, useState } from "react";
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
  Filler,
} from "chart.js";

import { motion } from "framer-motion";
import { Trophy, Zap, Plane, Calendar, CheckCircle } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);

const PRIMARY_COLOR = "#394C97";
const ACCENT_COLOR = "#FE5900";

export default function CareerPanel() {
  const [careerStats, setCareerStats] = useState({
    missionsCompleted: 0,
    totalPoints: 0,
    tripsMade: 0,
    badgesEarned: [],
    timeline: [],
  });

  const [missionsByDay, setMissionsByDay] = useState({});
  const [pointsByMonth, setPointsByMonth] = useState({});
  const [tripsByDestination, setTripsByDestination] = useState({});

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:3001/api/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        // Stats
        setCareerStats({
          missionsCompleted: data.stats?.missionsCompleted || 0,
          totalPoints: data.stats?.totalPoints || 0,
          tripsMade: data.stats?.tripsMade || 0,
          badgesEarned: data.badges || [],
          timeline: data.timeline || [],
        });

        // Missões por dia
        setMissionsByDay({
          labels: data.missionsByDay?.labels || [],
          datasets: [
            {
              label: "Missões",
              data: data.missionsByDay?.data || [],
              backgroundColor: PRIMARY_COLOR,
            },
          ],
        });

        // Pontos por mês
        setPointsByMonth({
          labels: data.pointsByMonth?.labels || [],
          datasets: [
            {
              label: "Pontos",
              data: data.pointsByMonth?.data || [],
              borderColor: PRIMARY_COLOR,
              backgroundColor: PRIMARY_COLOR,
              fill: true,
              tension: 0.4,
            },
          ],
        });

        // Destinos
        setTripsByDestination({
          labels: data.destinations?.labels || [],
          datasets: [
            {
              data: data.destinations?.data || [],
              backgroundColor: [
                "#394C97",
                "#FE5900",
                "#10B981",
                "#6366F1",
                "#F59E0B",
              ],
            },
          ],
        });
      } catch (error) {
        console.error("Erro dashboard:", error);
      }
    }

    fetchDashboard();
  }, []);

  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 p-6">
        <StatCard
          title="Missões Concluídas"
          value={careerStats.missionsCompleted}
          icon={CheckCircle}
        />

        <StatCard
          title="Pontos Totais"
          value={careerStats.totalPoints}
          icon={Zap}
        />

        <StatCard title="Viagens" value={careerStats.tripsMade} icon={Plane} />
      </div>

      {/* Charts */}

      <div className="grid grid-cols-3 gap-6 p-6">
        <ChartCard title="Missões por Dia">
          <Bar data={missionsByDay} options={commonChartOptions} />
        </ChartCard>

        <ChartCard title="Evolução de Pontos">
          <Line data={pointsByMonth} options={commonChartOptions} />
        </ChartCard>

        <ChartCard title="Destinos">
          <Pie data={tripsByDestination} options={pieChartOptions} />
        </ChartCard>
      </div>
    </div>
  );
}

// COMPONENTES

const StatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white p-6 rounded-xl shadow">
    <div className="flex justify-between">
      <div>
        <h3 className="text-gray-500">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <Icon className="w-8 h-8 text-[#394C97]" />
    </div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow h-80">
    <h3 className="mb-4 font-bold text-[#394C97]">{title}</h3>
    {children}
  </div>
);
