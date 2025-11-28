// src/components/AdminPanel/DashboardContent.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Loader, AlertTriangle, Settings, BarChart2, Users } from 'lucide-react';
// Importe a função de API
import { fetchStats } from '../../api/apiFunctions'; 

// Componente auxiliar (mantenha-o neste arquivo ou mova para uma pasta Shared)
const StatsCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center gap-4">
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{value}</p>
        </div>
    </div>
);


const DashboardContent = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // CHAMADA REAL DE API
            const data = await fetchStats();
            setStats(data);
        } catch (err) {
            setError(`Falha ao carregar as estatísticas: ${err.message || 'Erro de conexão'}`);
            console.error("Erro ao carregar stats:", err);
            // Simulação de dados em caso de falha (apenas para DEV)
            // setStats({ totalMissions: 42, completedMissions: 35, averageCompletion: 83, totalUsers: 150, topUser: { name: 'João Silva', points: 1500 } });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    if (loading) {
        return <div className="text-center p-10"><Loader size={30} className="animate-spin mx-auto text-[#394C97]" /> <p className="mt-2 text-gray-500">Carregando dados...</p></div>;
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center gap-3" role="alert">
                <AlertTriangle size={20} />
                <span className="block sm:inline">{error}</span>
                <button onClick={loadStats} className="ml-4 underline font-semibold">Tentar Novamente</button>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">📊 Visão Geral do Sistema</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard icon={Settings} title="Missões Criadas" value={stats?.totalMissions ?? 'N/A'} color="text-blue-600" />
                <StatsCard icon={BarChart2} title="Missões Concluídas" value={stats?.completedMissions ?? 'N/A'} color="text-green-600" />
                <StatsCard icon={BarChart2} title="Taxa Média de Conclusão" value={`${stats?.averageCompletion ?? 'N/A'}%`} color="text-yellow-600" />
                <StatsCard icon={Users} title="Usuários Ativos" value={stats?.totalUsers ?? 'N/A'} color="text-indigo-600" />

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 col-span-full mt-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">🏅 Ranking de Pontos</h3>
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                        <p className="text-lg font-medium text-gray-700">Top Aventureiro:</p>
                        <p className="text-xl font-extrabold text-yellow-700">{stats?.topUser?.name ?? 'N/A'}</p>
                        <p className="text-lg font-bold text-gray-900">{stats?.topUser?.points ?? 'N/A'} pts</p>
                    </div>
                </div>
            </div>

            <div className="mt-10">
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Gráfico de Progresso (Exemplo)</h3>
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-64 flex items-center justify-center text-gray-400">
                    [Espaço para Gráfico de Dados Reais]
                </div>
            </div>
        </div>
    );
};

export default DashboardContent;