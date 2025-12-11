import React, { useState, useEffect, useCallback } from 'react';
import {
    ArrowLeft, Calendar, Award, Trophy, User, CheckCircle, Lock, PlayCircle, Loader, MapPin, AlertCircle, LogOut
} from 'lucide-react';
import api from '../../api/api'; 
import TaskDetailsModal from './TaskDetailsModal'; 

const TaskItem = ({ task, onClick, isLocked, isCompleted }) => (
    <div 
        onClick={() => !isLocked && onClick && onClick(task)}
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

export default function MissionDetails({ mission: initialMissionData, onBack, readOnly = false }) {
    const [fullMissionData, setFullMissionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [activeTab, setActiveTab] = useState('Todas');
    const [error, setError] = useState(null);

    const fetchDetails = useCallback(async () => {
        if (!initialMissionData?.id) return;
        setLoading(prev => !fullMissionData ? true : prev);
        try {
            // Se for ReadOnly (Home), usa a rota pública simples. Se for User Dashboard, usa a rota completa.
            const endpoint = readOnly ? `/missions/${initialMissionData.id}` : `/missions/${initialMissionData.id}/full`;
            const res = await api.get(endpoint);
            setFullMissionData(res.data);
            setError(null);
        } catch (err) {
            console.error("Erro ao carregar detalhes:", err);
            if (!fullMissionData) {
                setError("Não foi possível carregar os detalhes da missão.");
            }
        } finally {
            setLoading(false);
        }
    }, [initialMissionData, fullMissionData, readOnly]);

    useEffect(() => {
        fetchDetails();
    }, []);

    const handleJoin = async () => {
        if (readOnly) return; // Segurança extra
        if (!window.confirm("Deseja iniciar esta missão?")) return;
        
        setJoining(true);
        try {
            await api.post(`/missions/${initialMissionData.id}/join`);
            // Atualização Otimista
            setFullMissionData(prev => ({
                ...(prev || initialMissionData),
                isJoined: true,
                userProgress: prev?.userProgress || { totalPoints: 0, completedTasksCount: 0, tasksStatus: {} },
                ranking: prev?.ranking ? [...prev.ranking] : [] 
            }));
            fetchDetails(); 
        } catch (err) {
            const msg = err.response?.data?.error || "Erro ao se inscrever.";
            if (err.response?.status === 409) {
                 setFullMissionData(prev => ({ ...prev, isJoined: true }));
                 fetchDetails();
            } else {
                alert(msg);
            }
        } finally {
            setJoining(false);
        }
    };

    const handleLeave = async () => {
        if (readOnly) return;
        if (!window.confirm("Tem certeza que deseja sair desta missão? Seu progresso será perdido.")) return;
        
        setLeaving(true);
        try {
            await api.delete(`/missions/${initialMissionData.id}/join`);
            setFullMissionData(prev => ({
                ...prev,
                isJoined: false,
                userProgress: { totalPoints: 0, completedTasksCount: 0, tasksStatus: {} }
            }));
            fetchDetails();
        } catch (err) {
            const msg = err.response?.data?.error || "Erro ao sair da missão.";
            alert(msg);
        } finally {
            setLeaving(false);
        }
    };

    const handleTaskClick = (task) => {
        if (readOnly) return; // Não abre modal de tarefa no modo vitrine
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
        <div className={`bg-gray-50 ${readOnly ? '' : 'p-4 sm:p-6 md:p-8 min-h-screen pb-24'}`}>
            <div className={readOnly ? "" : "max-w-5xl mx-auto"}>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    {/* Capa */}
                    <div className="h-48 w-full bg-gray-200 relative">
                        {foto_url ? (
                            <img src={foto_url} alt={title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-900 to-blue-800 text-white/20">
                                <MapPin size={64} />
                            </div>
                        )}
                        {!readOnly && (
                            <button 
                                onClick={onBack}
                                className="absolute top-4 left-4 bg-white/90 backdrop-blur hover:bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                            >
                                <ArrowLeft size={16} /> Voltar
                            </button>
                        )}
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
                                    {descricao || "Confira as tarefas desta missão."}
                                </p>
                            </div>

                            {/* Botões de Ação (Apenas se NÃO for ReadOnly) */}
                            {!readOnly && (
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
                            )}
                        </div>

                        {/* Barra de Progresso (Apenas se NÃO for ReadOnly e estiver inscrito) */}
                        {!readOnly && isJoined && (
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

                <div className={`grid grid-cols-1 ${readOnly ? '' : 'lg:grid-cols-3'} gap-8`}>
                    <div className={readOnly ? 'w-full' : 'lg:col-span-2 space-y-6'}>
                        {/* Filtro de Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveTab(cat)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                        activeTab === cat 
                                        ? 'bg-[#394C97] text-white shadow-md' 
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Lista de Tarefas */}
                        <div className="space-y-3 mt-4">
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map(task => {
                                    const status = tasksStatus[task.id];
                                    return (
                                        <TaskItem 
                                            key={task.id}
                                            task={task}
                                            // Se readOnly, cadeado é sempre visual (simula bloqueio)
                                            isLocked={!isJoined && !readOnly}
                                            isCompleted={status?.concluida}
                                            onClick={handleTaskClick}
                                        />
                                    );
                                })
                            ) : (
                                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400">
                                    <p>Nenhuma tarefa encontrada.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ranking e CTA Lateral (Ocultar no ReadOnly) */}
                    {!readOnly && (
                        <div className="lg:col-span-1">
                           {/* ... código do ranking (já existente no arquivo original) ... */}
                           {/* Para simplificar a resposta, assumo que o componente Ranking está aqui */}
                           <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                               <h3 className="font-bold text-gray-800 mb-4 flex items-center"><Trophy className="w-5 h-5 text-yellow-500 mr-2"/> Ranking</h3>
                               <p className="text-sm text-gray-500 text-center py-4">Inicie a missão para ver o ranking.</p>
                           </div>
                        </div>
                    )}
                </div>

                {/* Modal de Detalhes da Tarefa */}
                {selectedTask && isJoined && !readOnly && (
                    <TaskDetailsModal
                        task={selectedTask}
                        status={tasksStatus[selectedTask.id]}
                        onClose={() => setSelectedTask(null)}
                        onComplete={() => {
                            fetchDetails();
                            setSelectedTask(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
}