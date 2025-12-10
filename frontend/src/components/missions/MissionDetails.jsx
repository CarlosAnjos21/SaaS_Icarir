import React, { useState, useEffect, useCallback } from 'react';
import {
    ArrowLeft,
    Calendar,
    Award,
    Trophy,
    User,
    CheckCircle,
    Lock,
    PlayCircle,
    Loader,
    MapPin,
    AlertCircle,
    LogOut // Ícone para sair
} from 'lucide-react';
import api from '../../api/api'; 
import TaskDetailsModal from './TaskDetailsModal'; 

const TaskItem = ({ task, onClick, isLocked, isCompleted }) => (
    <div 
        onClick={() => !isLocked && onClick(task)}
        className={`relative bg-white p-4 rounded-xl border transition-all flex items-center justify-between group 
            ${isLocked ? 'opacity-70 cursor-not-allowed border-gray-100 bg-gray-50' : 'cursor-pointer hover:border-blue-300 hover:shadow-md border-gray-100'}
            ${isCompleted ? 'border-l-4 border-l-green-500' : ''}
        `}
    >
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${isCompleted ? 'bg-green-100 text-green-600' : (isLocked ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600')}`}>
                {isCompleted ? <CheckCircle className="w-5 h-5" /> : (isLocked ? <Lock className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />)}
            </div>
            <div>
                <h4 className={`font-bold transition-colors ${isLocked ? 'text-gray-500' : 'text-gray-800 group-hover:text-[#394C97]'}`}>
                    {task.titulo}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                    {task.categoria?.nome || 'Geral'} • <span className="font-semibold text-orange-500">{task.pontos} XP</span>
                </p>
            </div>
        </div>
        {isCompleted && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">Concluída</span>}
    </div>
);

const MissionRanking = ({ rankingData }) => {
    if (!rankingData || rankingData.length === 0) return null;
    const maxPoints = Math.max(...rankingData.map(item => item.points));

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex items-center text-lg font-bold text-gray-900 mb-4 border-b pb-3">
                <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                Ranking da Missão
            </div>
            <div className="space-y-3">
                {rankingData.map((item, index) => {
                    const progressWidth = maxPoints > 0 ? Math.round((item.points / maxPoints) * 100) : 0;
                    const isCurrentUser = item.isCurrentUser;
                    
                    return (
                        <div key={item.id} className={`flex items-center p-3 rounded-lg ${isCurrentUser ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'}`}>
                            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mr-3 ${index === 0 ? 'bg-yellow-400 text-white shadow-sm' : 'bg-gray-200 text-gray-600'}`}>
                                {item.rank || index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className={`font-semibold truncate text-sm ${isCurrentUser ? 'text-blue-700' : 'text-gray-700'}`}>
                                    {isCurrentUser && <span className="text-[10px] bg-blue-200 text-blue-800 px-1 rounded mr-1">Você</span>}
                                    {item.name}
                                </p>
                                <p className="text-xs text-gray-500">{item.points} pts</p>
                            </div>
                            <div className="w-24 ml-4 hidden sm:block">
                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div className={`h-full ${isCurrentUser ? 'bg-blue-500' : 'bg-green-500'}`} style={{ width: `${progressWidth}%` }} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default function MissionDetails({ mission: initialMissionData, onBack }) {
    const [fullMissionData, setFullMissionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [leaving, setLeaving] = useState(false); // Estado para loading do sair
    const [selectedTask, setSelectedTask] = useState(null);
    const [activeTab, setActiveTab] = useState('Todas');
    const [error, setError] = useState(null);

    const fetchFullDetails = useCallback(async () => {
        if (!initialMissionData?.id) return;
        setLoading(prev => !fullMissionData ? true : prev);
        try {
            const res = await api.get(`/missions/${initialMissionData.id}/full`);
            setFullMissionData(res.data);
            setError(null);
        } catch (err) {
            console.error("Erro ao carregar detalhes:", err);
            if (!fullMissionData) {
                setError("Não foi possível verificar sua inscrição. Verifique sua conexão.");
            }
        } finally {
            setLoading(false);
        }
    }, [initialMissionData, fullMissionData]);

    useEffect(() => {
        fetchFullDetails();
    }, []);

    const handleJoin = async () => {
        if (!window.confirm("Deseja iniciar esta missão?")) return;
        setJoining(true);
        try {
            await api.post(`/missions/${initialMissionData.id}/join`);
            setFullMissionData(prev => ({
                ...(prev || initialMissionData),
                isJoined: true,
                userProgress: prev?.userProgress || { totalPoints: 0, completedTasksCount: 0, tasksStatus: {} },
                ranking: prev?.ranking ? [...prev.ranking] : [] 
            }));
            fetchFullDetails(); 
        } catch (err) {
            const msg = err.response?.data?.error || "Erro ao se inscrever.";
            if (err.response?.status === 409) {
                 setFullMissionData(prev => ({ ...prev, isJoined: true }));
                 fetchFullDetails();
            } else {
                alert(msg);
            }
        } finally {
            setJoining(false);
        }
    };

    // NOVA FUNÇÃO: SAIR DA MISSÃO
    const handleLeave = async () => {
        if (!window.confirm("Tem certeza que deseja sair desta missão? Seu progresso será perdido.")) return;
        
        setLeaving(true);
        try {
            await api.delete(`/missions/${initialMissionData.id}/join`);
            
            // Atualização Otimista: Remove status de inscrito
            setFullMissionData(prev => ({
                ...prev,
                isJoined: false,
                userProgress: { totalPoints: 0, completedTasksCount: 0, tasksStatus: {} }
            }));
            
            // Opcional: Voltar para a lista ou recarregar
            fetchFullDetails();
        } catch (err) {
            const msg = err.response?.data?.error || "Erro ao sair da missão.";
            alert(msg);
        } finally {
            setLeaving(false);
        }
    };

    const handleTaskClick = (task) => {
        const currentData = fullMissionData || initialMissionData;
        if (!currentData.isJoined) return;
        setSelectedTask(task);
    };

    if (loading && !fullMissionData && !initialMissionData) return <div className="p-20 text-center"><Loader className="animate-spin mx-auto text-[#394C97] mb-2" /> Carregando missão...</div>;
    
    if (error && !fullMissionData) return <div className="p-10 text-center text-red-500"><AlertCircle className="mx-auto mb-2"/>{error}<br/><button onClick={onBack} className="mt-4 underline">Voltar</button></div>;

    const mission = fullMissionData || initialMissionData;
    const { 
        title, descricao, deadline, destino, tarefas = [], isJoined, userProgress, ranking, foto_url, pontos 
    } = mission;

    const tasksStatus = userProgress?.tasksStatus || {};
    const myTotalPoints = userProgress?.totalPoints || 0;
    const completedCount = userProgress?.completedTasksCount || 0;
    const totalTasks = tarefas.length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    const categories = ['Todas', ...new Set(tarefas.map(t => t.categoria?.nome || 'Geral'))];
    const filteredTasks = activeTab === 'Todas' ? tarefas : tarefas.filter(t => (t.categoria?.nome || 'Geral') === activeTab);

    return (
        <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-gray-50 pb-24">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="h-48 w-full bg-gray-200 relative">
                        {foto_url ? (
                            <img src={foto_url} alt={title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-900 to-blue-800 text-white/20">
                                <MapPin size={64} />
                            </div>
                        )}
                        <button onClick={onBack} className="absolute top-4 left-4 bg-white/90 backdrop-blur hover:bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2">
                            <ArrowLeft size={16} /> Voltar
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{title}</h1>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md"><MapPin size={14} /> {destino || 'Global'}</span>
                                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md"><Calendar size={14} /> {deadline || 'Sem prazo'}</span>
                                    <span className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-1 rounded-md font-bold border border-orange-100"><Award size={14} /> {pontos || 0} XP Totais</span>
                                </div>
                                <p className="mt-4 text-gray-600 leading-relaxed max-w-2xl">
                                    {descricao || "Complete as tarefas abaixo para ganhar pontos e subir no ranking."}
                                </p>
                            </div>

                            <div className="flex flex-col items-end gap-2 min-w-[200px]">
                                {!isJoined ? (
                                    <button 
                                        onClick={handleJoin} 
                                        disabled={joining}
                                        className="w-full bg-[#FE5900] text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 hover:shadow-orange-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {joining ? <Loader className="animate-spin w-5 h-5"/> : <PlayCircle className="w-5 h-5 fill-current" />}
                                        Iniciar Missão
                                    </button>
                                ) : (
                                    <div className="flex flex-col gap-2 w-full">
                                        <div className="w-full bg-green-50 text-green-700 px-6 py-3 rounded-xl font-bold border border-green-200 flex items-center justify-center gap-2">
                                            <CheckCircle className="w-5 h-5" /> Você está participando
                                        </div>
                                        <button 
                                            onClick={handleLeave}
                                            disabled={leaving}
                                            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                                        >
                                            {leaving ? <Loader className="animate-spin w-3 h-3"/> : <LogOut className="w-3 h-3" />}
                                            Sair da Missão
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {isJoined && (
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between gap-4 animate-fade-in">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Trophy size={20} /></div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Seus Pontos</p>
                                        <p className="text-xl font-black text-gray-800">{myTotalPoints}</p>
                                    </div>
                                </div>
                                <div className="flex-1 max-w-sm">
                                    <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1.5">
                                        <span>Progresso</span>
                                        <span>{Math.round(progressPercentage)}% ({completedCount}/{totalTasks})</span>
                                    </div>
                                    <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-blue-500 to-[#394C97] transition-all duration-1000 ease-out" style={{ width: `${progressPercentage}%` }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveTab(cat)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === cat ? 'bg-[#394C97] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <div className="space-y-3">
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map(task => {
                                    const status = tasksStatus[task.id];
                                    return <TaskItem key={task.id} task={task} isLocked={!isJoined} isCompleted={status?.concluida} onClick={handleTaskClick} />;
                                })
                            ) : (
                                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400"><p>Nenhuma tarefa encontrada.</p></div>
                            )}
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <MissionRanking rankingData={ranking} />
                        {!isJoined && (
                            <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 text-center">
                                <p className="text-sm text-orange-800 font-medium mb-3">Junte-se à missão para competir no ranking e ganhar prêmios exclusivos!</p>
                                <button onClick={handleJoin} className="text-xs font-bold text-orange-600 hover:text-orange-800 underline">Inscrever-se agora</button>
                            </div>
                        )}
                    </div>
                </div>
                {selectedTask && isJoined && (
                    <TaskDetailsModal task={selectedTask} status={tasksStatus[selectedTask.id]} onClose={() => setSelectedTask(null)} onComplete={() => { fetchFullDetails(); setSelectedTask(null); }} />
                )}
            </div>
        </div>
    );
}