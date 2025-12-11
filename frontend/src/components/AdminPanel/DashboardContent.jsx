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
    TrendingUp,
    RefreshCw
} from 'lucide-react';
import { fetchStats } from '../../api/apiFunctions'; 

// Componente de Card Estatístico
const StatsCard = ({ icon: Icon, title, value, color, bgColor, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow group"
    >
        <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</h2>
            <p className={`text-3xl font-black ${color} tracking-tight`}>{value}</p>
        </div>
        <div className={`p-4 rounded-xl ${bgColor} group-hover:scale-110 transition-transform duration-300`}>
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
            setError(`Falha ao carregar dados: ${err.message || 'Erro de conexão'}`);
            console.error("Erro no Dashboard:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <Loader size={40} className="animate-spin text-[#394C97] mb-4" /> 
                <p className="text-gray-500 font-medium">Consolidando métricas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-2xl flex flex-col items-center gap-3 text-center max-w-2xl mx-auto mt-10">
                    <AlertTriangle size={32} />
                    <span className="font-semibold text-lg">Erro ao carregar dashboard</span>
                    <span className="text-sm opacity-80">{error}</span>
                    <button onClick={loadStats} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2">
                        <RefreshCw size={16} /> Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
            
            {/* --- BANNER SUPERIOR (Padronizado com as outras telas) --- */}
            <div className="h-64 w-full bg-[#394C97] relative rounded-b-[2.5rem] md:rounded-b-none overflow-hidden">
                {/* Elementos Decorativos */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#FE5900] opacity-10 rounded-full translate-y-1/4 -translate-x-1/4 blur-2xl"></div>

                <div className="max-w-7xl mx-auto px-6 h-full flex items-center pb-10 md:translate-y-2 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-6 text-white"
                    >
                        <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl ring-1 ring-white/20">
                            <LayoutDashboard className="w-8 h-8 text-[#FE5900]" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Visão Geral</h1>
                            <p className="text-blue-100/90 text-lg mt-1 font-light">Métricas vitais e desempenho do sistema</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* --- CONTEÚDO PRINCIPAL (Sobreposto) --- */}
            <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
                
                {/* 1. GRID DE ESTATÍSTICAS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard 
                        icon={Target} 
                        title="Missões Criadas" 
                        value={stats?.totalMissions ?? 0} 
                        color="text-blue-600" 
                        bgColor="bg-blue-50"
                        delay={0.1}
                    />
                    <StatsCard 
                        icon={CheckCircle} 
                        title="Missões Concluídas" 
                        value={stats?.completedMissions ?? 0} 
                        color="text-emerald-600" 
                        bgColor="bg-emerald-50"
                        delay={0.2}
                    />
                    <StatsCard 
                        icon={TrendingUp} 
                        title="Taxa de Conclusão" 
                        value={`${stats?.averageCompletion ?? 0}%`} 
                        color="text-amber-500" 
                        bgColor="bg-amber-50"
                        delay={0.3}
                    />
                    <StatsCard 
                        icon={Users} 
                        title="Usuários Ativos" 
                        value={stats?.totalUsers ?? 0} 
                        color="text-indigo-600" 
                        bgColor="bg-indigo-50"
                        delay={0.4}
                    />
                </div>

                {/* 2. ÁREA SECUNDÁRIA */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* TOP USER */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-1 flex flex-col"
                    >
                        <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-6 text-white relative overflow-hidden">
                            <Trophy className="absolute -right-6 -bottom-6 w-40 h-40 text-white opacity-10 rotate-12" />
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Trophy size={18} /> Top Aventureiro
                                </h3>
                                <p className="text-white/80 text-xs mt-1 uppercase tracking-wide font-medium">Líder do Ranking</p>
                            </div>
                        </div>
                        
                        <div className="p-8 text-center flex-1 flex flex-col justify-center items-center">
                            <div className="w-24 h-24 bg-gray-50 rounded-full mb-4 flex items-center justify-center text-3xl font-bold text-gray-300 border-4 border-amber-100 shadow-inner relative">
                                {stats?.topUser?.name ? stats.topUser.name.charAt(0).toUpperCase() : '?'}
                                <div className="absolute bottom-0 right-0 bg-[#FE5900] w-8 h-8 rounded-full flex items-center justify-center border-2 border-white text-white text-xs font-bold shadow-sm">1º</div>
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 line-clamp-1">{stats?.topUser?.name || 'Nenhum usuário'}</h4>
                            <div className="mt-3 inline-flex items-baseline gap-1">
                                <span className="text-3xl font-black text-[#394C97]">{stats?.topUser?.points || 0}</span>
                                <span className="text-sm text-gray-400 font-medium">pts</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* GRÁFICO (Placeholder) */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:col-span-2 flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-bold text-[#394C97] flex items-center gap-2">
                                <BarChart2 size={20} /> Análise de Progresso
                            </h3>
                            <div className="flex gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                <span className="w-3 h-3 rounded-full bg-gray-200"></span>
                            </div>
                        </div>
                        
                        <div className="flex-1 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 min-h-[220px] relative overflow-hidden group hover:border-blue-200 transition-colors">
                            <BarChart2 size={64} className="mb-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500 text-[#394C97]" />
                            <p className="text-sm font-semibold uppercase tracking-wider opacity-60">Dados em desenvolvimento</p>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default DashboardContent;