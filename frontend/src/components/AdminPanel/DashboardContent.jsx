import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
    Loader, 
    AlertTriangle, 
    Target, 
    CheckCircle, 
    BarChart2, 
    Users, 
    Trophy,
    LayoutDashboard,
    TrendingUp
} from 'lucide-react';
import { fetchStats } from '../../api/apiFunctions'; 

// Componente de Card Estatístico Reutilizável
const StatsCard = ({ icon: Icon, title, value, color, bgColor, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow"
    >
        <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</h2>
            <p className={`text-3xl font-bold ${color} mt-1`}>{value}</p>
        </div>
        <div className={`p-4 rounded-xl ${bgColor}`}>
            <Icon className={`w-6 h-6 ${color}`} />
        </div>
    </motion.div>
);

const DashboardContent = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchStats();
            setStats(data);
        } catch (err) {
            setError(`Falha ao carregar as estatísticas: ${err.message || 'Erro de conexão'}`);
            console.error("Erro ao carregar stats:", err);
            // Mock de fallback para desenvolvimento, se necessário
            // setStats({ totalMissions: 0, completedMissions: 0, averageCompletion: 0, totalUsers: 0, topUser: { name: '-', points: 0 } });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    // Estado de Carregamento Elegante
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <Loader size={40} className="animate-spin text-[#394C97] mb-4" /> 
                <p className="text-gray-500 font-medium">Consolidando dados do sistema...</p>
            </div>
        );
    }

    // Estado de Erro
    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-2xl flex flex-col items-center gap-3 text-center max-w-2xl mx-auto mt-10">
                    <AlertTriangle size={32} />
                    <span className="font-semibold text-lg">Erro ao carregar dashboard</span>
                    <span className="text-sm opacity-80">{error}</span>
                    <button onClick={loadStats} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
            
            {/* --- BANNER SUPERIOR --- */}
            <div className="h-64 w-full bg-[#394C97] relative rounded-b-[2.5rem] md:rounded-b-none">
                <div className="absolute top-4 right-6 text-white/60 text-xs font-medium uppercase tracking-widest hidden md:block">
                    Painel Administrativo
                </div>
                
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center pb-12 md:translate-y-2">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-5 text-white"
                    >
                        <div className="p-3.5 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 shadow-inner">
                            <LayoutDashboard className="w-8 h-8 text-[#FE5900]" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Visão Geral</h1>
                            <p className="text-blue-100/80 text-lg mt-1 font-light">Métricas e desempenho do sistema</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* --- CONTEÚDO PRINCIPAL (Sobreposto) --- */}
            <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-10">
                
                {/* 1. GRID DE ESTATÍSTICAS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard 
                        icon={Target} 
                        title="Missões Criadas" 
                        value={stats?.totalMissions ?? '-'} 
                        color="text-blue-600" 
                        bgColor="bg-blue-50"
                        delay={0.1}
                    />
                    <StatsCard 
                        icon={CheckCircle} 
                        title="Missões Concluídas" 
                        value={stats?.completedMissions ?? '-'} 
                        color="text-green-600" 
                        bgColor="bg-green-50"
                        delay={0.2}
                    />
                    <StatsCard 
                        icon={TrendingUp} 
                        title="Taxa de Conclusão" 
                        value={`${stats?.averageCompletion ?? 0}%`} 
                        color="text-yellow-600" 
                        bgColor="bg-yellow-50"
                        delay={0.3}
                    />
                    <StatsCard 
                        icon={Users} 
                        title="Usuários Ativos" 
                        value={stats?.totalUsers ?? '-'} 
                        color="text-indigo-600" 
                        bgColor="bg-indigo-50"
                        delay={0.4}
                    />
                </div>

                {/* 2. ÁREA SECUNDÁRIA (Ranking e Gráficos) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Card de Destaque (Top User) */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-1"
                    >
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white relative overflow-hidden">
                            <Trophy className="absolute -right-4 -bottom-4 w-32 h-32 text-white opacity-20 rotate-12" />
                            <h3 className="text-lg font-bold flex items-center gap-2 relative z-10">
                                <Trophy size={20} /> Top Aventureiro
                            </h3>
                            <p className="text-white/80 text-sm relative z-10">Líder do ranking atual</p>
                        </div>
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-gray-400 border-4 border-yellow-100">
                                {stats?.topUser?.name ? stats.topUser.name.charAt(0) : '?'}
                            </div>
                            <h4 className="text-xl font-bold text-gray-800">{stats?.topUser?.name ?? 'Nenhum registro'}</h4>
                            <p className="text-[#FE5900] font-extrabold text-2xl mt-2">
                                {stats?.topUser?.points ?? 0} <span className="text-sm text-gray-400 font-normal">pts</span>
                            </p>
                        </div>
                    </motion.div>

                    {/* Placeholder do Gráfico */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2 flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-[#394C97] flex items-center gap-2">
                                <BarChart2 size={20} /> Progresso Geral
                            </h3>
                            <select className="text-sm border-gray-200 border rounded-lg px-3 py-1 text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                                <option>Últimos 30 dias</option>
                                <option>Últimos 6 meses</option>
                            </select>
                        </div>
                        
                        <div className="flex-1 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 min-h-[200px] relative overflow-hidden group">
                            <BarChart2 size={48} className="mb-2 opacity-20 group-hover:scale-110 transition-transform duration-500" />
                            <p className="text-sm font-medium">Visualização de dados em desenvolvimento</p>
                            
                            {/* Efeito decorativo de fundo */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default DashboardContent;