import { useState, useEffect, useCallback } from "react";
// Importa a instância do Axios configurada
import api from "../api/api"; // Certifique-se que o caminho de importação está correto!

import { Plus, X, BarChart2, Users, Settings, Edit, Trash2, Calendar, MapPin, Image as ImageIcon, Briefcase, Zap, HelpCircle, AlertTriangle, Loader } from "lucide-react";

// --- TIPOS DE DADOS SIMPLIFICADOS (Idealmente viriam de um arquivo de types) ---
const INITIAL_MISSION_STATE = {
    title: "",
    city: "",
    points: 0,
    expirationDate: "",
    imageUrl: "",
    steps: [{ description: "", points: 0 }],
    quiz: null,
};

// --- Funções de API REAIS USANDO AXIOS ---

/**
 * Obtém dados estatísticos do backend.
 * @returns {Promise<object>}
 */
const fetchStats = async () => {
    // Endpoint presumido: /stats ou /dashboard
    const response = await api.get("/stats"); 
    return response.data;
};

/**
 * Obtém a lista de missões.
 * @returns {Promise<Mission[]>}
 */
const fetchMissions = async () => {
    // Endpoint presumido: /missions
    const response = await api.get("/missions");
    return response.data;
};

/**
 * Cria uma nova missão no backend.
 * @param {object} missionData - Dados da missão a ser criada.
 * @returns {Promise<Mission>} - A missão criada.
 */
const createMission = async (missionData) => {
    // Endpoint presumido: /missions (POST)
    const response = await api.post("/missions", missionData);
    return response.data;
};

/**
 * Atualiza uma missão no backend.
 * @param {number | string} id - ID da missão a ser atualizada.
 * @param {object} missionData - Dados da missão.
 * @returns {Promise<Mission>} - A missão atualizada.
 */
const updateMission = async (id, missionData) => {
    // Endpoint presumido: /missions/:id (PUT)
    const response = await api.put(`/missions/${id}`, missionData);
    return response.data;
};

/**
 * Exclui uma missão no backend.
 * @param {number | string} id - ID da missão a ser excluída.
 * @returns {Promise<void>}
 */
const deleteMissionApi = async (id) => {
    // Endpoint presumido: /missions/:id (DELETE)
    await api.delete(`/missions/${id}`);
};

/**
 * Obtém a lista de usuários.
 * @returns {Promise<object[]>}
 */
const fetchUsers = async () => {
    // Endpoint presumido: /users
    const response = await api.get("/users");
    return response.data;
};


// --- Componentes Reutilizáveis (Mantidos, mas garantindo que o `api` está fora) ---

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

const MissionCard = ({ mission, onEdit, onDelete }) => (
    <div className="bg-white shadow-xl p-6 rounded-xl border-l-8 border-[#394C97] flex justify-between items-start transition duration-300 hover:shadow-2xl">
        <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{mission.title}</h2>
                {mission.quiz && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-semibold">C/ QUIZ</span>}
            </div>

            <div className="flex items-center text-sm text-gray-600 gap-4 mt-1">
                <p className="flex items-center gap-1"><MapPin size={16} /> {mission.city || 'Global'}</p>
                <p className="flex items-center gap-1"><Calendar size={16} /> Expira: {mission.expirationDate || 'N/A'}</p>
                <p className="font-semibold text-green-600">{mission.points} Pontos</p>
            </div>
            
            <ul className="mt-4 space-y-1 text-sm text-gray-700 p-3 bg-gray-50 rounded">
                <p className="font-semibold mb-1">Etapas ({mission.steps.length})</p>
                {mission.steps.slice(0, 2).map((step, i) => (
                    <li key={i} className="flex items-center gap-2">
                        <span className="text-xs text-[#394C97]">✓</span> {step.description} ({step.points} pts)
                    </li>
                ))}
                {mission.steps.length > 2 && <li className="text-xs text-gray-500">e mais {mission.steps.length - 2} etapas...</li>}
            </ul>
        </div>
        
        <div className="flex gap-2 min-w-[120px] justify-end">
            <button onClick={onEdit} className="text-blue-600 hover:text-blue-800 p-2 rounded-full transition hover:bg-blue-50">
                <Edit size={20} />
            </button>
            <button onClick={onDelete} className="text-red-500 hover:text-red-700 p-2 rounded-full transition hover:bg-red-50">
                <Trash2 size={20} />
            </button>
        </div>
    </div>
);

const UserTable = ({ users }) => (
    <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    {["Nome", "Email", "Pontos", "Nível", "Status", "Ações"].map(header => (
                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{user.points}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.level === 'Platinum' ? 'bg-indigo-100 text-indigo-800' :
                                user.level === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {user.level}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.status === 'Ativo' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {user.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2">
                            <button className="text-indigo-600 hover:text-indigo-900">Ver Perfil</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const QuizForm = ({ newMission, setNewMission }) => {
    // Componente separado para organizar a complexidade do formulário de Quiz
    const quiz = newMission.quiz;

    const handleUpdateQuiz = (field, value) => {
        setNewMission({
            ...newMission,
            quiz: { ...quiz, [field]: value },
        });
    };

    const handleUpdateOption = (index, value) => {
        const updatedOptions = [...quiz.options];
        updatedOptions[index] = value;
        handleUpdateQuiz("options", updatedOptions);
    };

    const handleAddOption = () => {
        if (quiz.options.length < 6) {
            handleUpdateQuiz("options", [...quiz.options, ""]);
        }
    };

    const handleRemoveOption = (index) => {
        const updatedOptions = quiz.options.filter((_, i) => i !== index);
        // Garante que o correctIndex ainda seja válido
        let newCorrectIndex = quiz.correctIndex;
        if (newCorrectIndex === index) {
            newCorrectIndex = 0; // Reseta para a primeira opção se a correta for removida
        } else if (newCorrectIndex > index) {
            newCorrectIndex -= 1; // Ajusta o index se a opção removida estiver antes
        }

        setNewMission({
            ...newMission,
            quiz: { ...quiz, options: updatedOptions, correctIndex: newCorrectIndex },
        });
    };

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-semibold text-gray-800">Configuração do Quiz</h4>
            <input
                type="text"
                placeholder="Pergunta do Quiz (Ex: Qual é a capital da França?)"
                className="w-full border p-3 rounded-lg"
                value={quiz.question}
                onChange={(e) => handleUpdateQuiz("question", e.target.value)}
            />
            
            <div className="space-y-2">
                {quiz.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <input
                            type="radio"
                            name="correct-option"
                            checked={quiz.correctIndex === i}
                            onChange={() => handleUpdateQuiz("correctIndex", i)}
                            className="w-4 h-4 text-green-600"
                        />
                        <input
                            type="text"
                            placeholder={`Opção ${i + 1}`}
                            className={`flex-1 border p-2 rounded ${quiz.correctIndex === i ? 'border-green-400 bg-green-50' : 'border-gray-300'}`}
                            value={opt}
                            onChange={(e) => handleUpdateOption(i, e.target.value)}
                        />
                        {quiz.options.length > 2 && (
                             <button onClick={() => handleRemoveOption(i)} className="text-red-500 hover:text-red-700 p-1">
                                 <X size={18} />
                             </button>
                        )}
                    </div>
                ))}
            </div>

            {quiz.options.length < 6 && (
                <button
                    onClick={handleAddOption}
                    className="text-sm text-green-600 hover:text-green-800 font-semibold flex items-center gap-1"
                >
                    <Plus size={16} /> Adicionar Opção
                </button>
            )}
        </div>
    );
};

const MissionModal = ({ newMission, setNewMission, handleAddStep, handleRemoveStep, handleToggleQuiz, handleSaveMission, handleModalClose, isEditing, isLoading }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-8 rounded-xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-[#394C97]">
                {isEditing ? "Editar Missão" : "Criar Nova Missão"}
            </h2>

            <button onClick={handleModalClose} disabled={isLoading} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 disabled:opacity-50">
                <X size={24} />
            </button>

            <div className="space-y-6">
                {/* INFORMAÇÕES BÁSICAS */}
                <h3 className="text-lg font-semibold border-b pb-2 text-gray-700 flex items-center gap-2"><Settings size={18}/> Detalhes Principais</h3>
                <input
                    type="text"
                    placeholder="Nome da Missão (Ex: O Segredo da Torre Eiffel)"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={newMission.title}
                    onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
                    disabled={isLoading}
                />
                <div className="grid grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="Cidade (Ex: Paris)"
                        className="border border-gray-300 p-3 rounded-lg"
                        value={newMission.city}
                        onChange={(e) => setNewMission({ ...newMission, city: e.target.value })}
                        disabled={isLoading}
                    />
                    <input
                        type="number"
                        placeholder="Pontos Totais"
                        className="border border-gray-300 p-3 rounded-lg"
                        value={newMission.points}
                        onChange={(e) => setNewMission({ ...newMission, points: Number(e.target.value) })}
                        disabled={isLoading}
                    />
                    <input
                        type="date"
                        placeholder="Data de Expiração"
                        className="border border-gray-300 p-3 rounded-lg"
                        value={newMission.expirationDate}
                        onChange={(e) => setNewMission({ ...newMission, expirationDate: e.target.value })}
                        disabled={isLoading}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <ImageIcon size={20} className="text-gray-500"/>
                    <input
                        type="text"
                        placeholder="URL da Imagem de Capa"
                        className="flex-1 border border-gray-300 p-3 rounded-lg"
                        value={newMission.imageUrl}
                        onChange={(e) => setNewMission({ ...newMission, imageUrl: e.target.value })}
                        disabled={isLoading}
                    />
                </div>

                {/* ETAPAS DA MISSÃO */}
                <h3 className="text-lg font-semibold border-b pb-2 pt-4 text-gray-700 flex items-center gap-2"><Briefcase size={18}/> Etapas e Requisitos</h3>
                <div className="space-y-3">
                    {newMission.steps.map((step, i) => (
                        <div key={i} className="flex gap-2 items-center bg-gray-50 p-3 rounded-lg border">
                            <input
                                type="text"
                                placeholder={`Etapa ${i + 1}: Descrição`}
                                className="flex-1 border p-2 rounded"
                                value={step.description}
                                onChange={(e) => {
                                    const updated = [...newMission.steps];
                                    updated[i].description = e.target.value;
                                    setNewMission({ ...newMission, steps: updated });
                                }}
                                disabled={isLoading}
                            />
                            <input
                                type="number"
                                placeholder="Pontos"
                                className="w-24 border p-2 rounded"
                                value={step.points}
                                onChange={(e) => {
                                    const updated = [...newMission.steps];
                                    updated[i].points = Number(e.target.value);
                                    setNewMission({ ...newMission, steps: updated });
                                }}
                                disabled={isLoading}
                            />
                            {newMission.steps.length > 1 && (
                                <button onClick={() => handleRemoveStep(i)} disabled={isLoading} className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50">
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={handleAddStep}
                        disabled={isLoading}
                        className="text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 mt-2 disabled:opacity-50"
                    >
                        <Plus size={16} /> Adicionar Etapa
                    </button>
                </div>

                {/* QUIZ */}
                <div className="border p-4 rounded-lg bg-blue-50">
                    <label className="flex items-center gap-3 font-semibold text-blue-800">
                        <input type="checkbox" checked={!!newMission.quiz} onChange={handleToggleQuiz} className="w-4 h-4 text-blue-600" disabled={isLoading}/>
                        Incluir Etapa de Quiz
                    </label>
                </div>

                {newMission.quiz && (
                    <QuizForm newMission={newMission} setNewMission={setNewMission} />
                )}
            </div>

            {/* Ações do Modal */}
            <div className="mt-8 flex justify-end gap-4 border-t pt-4">
                <button
                    onClick={handleModalClose}
                    disabled={isLoading}
                    className="text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button 
                    onClick={handleSaveMission} 
                    disabled={isLoading}
                    className="bg-[#394C97] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#2f3f7a] shadow-md transition disabled:opacity-50 flex items-center gap-2"
                >
                    {isLoading ? <Loader size={20} className="animate-spin" /> : null}
                    {isEditing ? "Salvar Alterações" : "Criar Missão"}
                </button>
            </div>
        </div>
    </div>
);


// --- Componente de Conteúdo: Dashboard (Implementando fetch REAL) ---

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

    // A estrutura dos dados é baseada na expectativa do backend
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
                    [Simulação de um componente de Gráfico de Linha aqui (Ex: Recharts ou Chart.js)]
                </div>
            </div>
        </div>
    );
};

// --- Componente de Conteúdo: Missões (Implementando CRUD REAL) ---

const MissionsContent = () => {
    // ESTADOS DE DADOS
    const [missions, setMissions] = useState([]);
    
    // ESTADOS DE FLUXO (Carregamento, Erro, Modal)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // ESTADOS DE CRIAÇÃO/EDIÇÃO
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newMission, setNewMission] = useState(INITIAL_MISSION_STATE);

    // FUNÇÃO DE CARREGAMENTO (READ - GET)
    const loadMissions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchMissions();
            setMissions(data);
        } catch (err) {
            setError(`Falha ao carregar a lista de missões: ${err.message || 'Erro de conexão'}`);
            console.error("Erro ao carregar missões:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMissions();
    }, [loadMissions]);

    // FUNÇÕES DE AÇÃO
    const handleModalOpen = (missionToEdit = null) => {
        if (missionToEdit) {
            setIsEditing(true);
            setEditingId(missionToEdit.id);
            // Garante que o estado seja deep copied para não modificar o objeto original no array
            setNewMission(JSON.parse(JSON.stringify(missionToEdit))); 
            setShowModal(true);
        } else {
            setIsEditing(false);
            setEditingId(null);
            setNewMission(INITIAL_MISSION_STATE);
            setShowModal(true);
        }
        setError(null);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setIsEditing(false);
    };

    // ... (handleAddStep, handleRemoveStep, handleToggleQuiz - Lógica local mantida) ...
     const handleAddStep = () => {
        setNewMission((prev) => ({
            ...prev,
            steps: [...prev.steps, { description: "", points: 0 }],
        }));
    };

    const handleRemoveStep = (index) => {
        setNewMission((prev) => ({
            ...prev,
            steps: prev.steps.filter((_, i) => i !== index),
        }));
    };

    const handleToggleQuiz = () => {
        if (newMission.quiz) {
            setNewMission((prev) => ({ ...prev, quiz: null }));
        } else {
            setNewMission((prev) => ({
                ...prev,
                quiz: { question: "", options: ["", "", "", ""], correctIndex: 0 },
            }));
        }
    };
    // ...

    // FUNÇÃO DE SALVAR (CREATE/UPDATE - POST/PUT)
    const handleSaveMission = async () => {
        // Validação básica (adicionar validações mais robustas aqui)
        if (!newMission.title || newMission.points <= 0 || newMission.steps.length === 0) {
            alert("Preencha o Título, Pontos e pelo menos uma Etapa.");
            return;
        }

        setIsSaving(true);
        try {
            if (isEditing) {
                // Atualizar missão existente (PUT)
                // O backend deve retornar a missão atualizada
                const updated = await updateMission(editingId, newMission);
                setMissions(missions.map(m => m.id === editingId ? updated : m));
            } else {
                // Criar nova missão (POST)
                // O backend deve retornar a nova missão (incluindo o novo ID)
                const created = await createMission(newMission);
                setMissions([...missions, created]);
            }
            handleModalClose();
        } catch (err) {
            // Tratamento de erro específico do Axios
            const errorMsg = err.response?.data?.message || err.message;
            alert(`Falha ao salvar a missão: ${errorMsg}`);
            console.error("Erro ao salvar missão:", err);
        } finally {
            setIsSaving(false);
        }
    };

    // FUNÇÃO DE EXCLUIR (DELETE)
    const handleDeleteMission = async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir esta missão? Esta ação é irreversível.")) {
            return;
        }

        try {
            // Chamada de API para exclusão
            await deleteMissionApi(id);
            // Atualiza o estado local após sucesso
            setMissions(missions.filter(m => m.id !== id));
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            alert(`Falha ao excluir a missão: ${errorMsg}`);
            console.error("Erro ao deletar missão:", err);
        }
    };

    if (loading) {
        return <div className="text-center p-10"><Loader size={30} className="animate-spin mx-auto text-[#394C97]" /> <p className="mt-2 text-gray-500">Carregando missões...</p></div>;
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center gap-3" role="alert">
                <AlertTriangle size={20} />
                <span className="block sm:inline">{error}</span>
                <button onClick={loadMissions} className="ml-4 underline font-semibold">Tentar Novamente</button>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">🚀 Gestão de Missões</h2>
            <button
                onClick={() => handleModalOpen()}
                className="bg-[#FE5900] text-white px-6 py-3 rounded-xl shadow-lg hover:bg-[#d94d00] transition flex items-center gap-2 mb-8 font-semibold"
            >
                <Plus size={20} />
                Criar Nova Missão
            </button>
            
            <div className="grid gap-6">
                {missions.length === 0 ? (
                    <p className="text-gray-500 p-4 bg-white rounded-lg shadow">Nenhuma missão criada ainda.</p>
                ) : (
                    missions.map((mission) => (
                        <MissionCard 
                            key={mission.id} 
                            mission={mission} 
                            onEdit={() => handleModalOpen(mission)} 
                            onDelete={() => handleDeleteMission(mission.id)} 
                        />
                    ))
                )}
            </div>

            {/* Modal de Missão */}
            {showModal && (
                <MissionModal 
                    newMission={newMission}
                    setNewMission={setNewMission}
                    handleAddStep={handleAddStep}
                    handleRemoveStep={handleRemoveStep}
                    handleToggleQuiz={handleToggleQuiz}
                    handleSaveMission={handleSaveMission}
                    handleModalClose={handleModalClose}
                    isEditing={isEditing}
                    isLoading={isSaving}
                />
            )}
        </div>
    );
};

// --- Componente de Conteúdo: Usuários (Implementando fetch REAL) ---

const UsersContent = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchUsers();
            setUsers(data);
        } catch (err) {
            setError(`Falha ao carregar a lista de usuários: ${err.message || 'Erro de conexão'}`);
            console.error("Erro ao carregar usuários:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);


    if (loading) {
        return <div className="text-center p-10"><Loader size={30} className="animate-spin mx-auto text-[#394C97]" /> <p className="mt-2 text-gray-500">Carregando usuários...</p></div>;
    }

    if (error) {
         return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center gap-3" role="alert">
                <AlertTriangle size={20} />
                <span className="block sm:inline">{error}</span>
                <button onClick={loadUsers} className="ml-4 underline font-semibold">Tentar Novamente</button>
            </div>
        );
    }
    
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">👥 Gestão de Usuários Icarir</h2>
            <UserTable users={users} />
        </div>
    );
};


// --- Componente Principal (Mantido) ---

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState("dashboard");

    const tabs = [
        { id: "dashboard", label: "Dashboard", icon: BarChart2, content: <DashboardContent /> },
        { id: "missions", label: "Missões Ativas", icon: Zap, content: <MissionsContent /> },
        { id: "users", label: "Gestão de Usuários", icon: Users, content: <UsersContent /> },
        // Abas adicionais
        { id: "tasks", label: "Tarefas", icon: Briefcase, content: <p className="text-gray-600">Gerencie tarefas vinculadas às missões.</p> },
        { id: "quizzes", label: "Quizzes", icon: HelpCircle, content: <p className="text-gray-600">Crie quizzes interativos.</p> },
        { id: "settings", label: "Configurações", icon: Settings, content: <p className="text-gray-600">Ajuste preferências do sistema.</p> },
    ];

    const currentTab = tabs.find(tab => tab.id === activeTab);

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-xl p-6 border-r border-gray-200">
                <h1 className="text-3xl font-extrabold text-[#394C97] mb-8">Icarir Admin</h1>
                <nav className="space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center gap-3 ${
                                activeTab === tab.id
                                    ? "bg-[#394C97] text-white font-semibold shadow-md"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-[#FE5900]"
                            }`}
                        >
                            <tab.icon size={20} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Conteúdo principal */}
            <main className="flex-1 p-10 max-w-full overflow-x-hidden pt-[90px]">
                <header className="mb-8 border-b pb-4">
                    <h1 className="text-4xl font-extrabold text-gray-900">{currentTab?.label || 'Painel'}</h1>
                </header>
                <div className="max-w-7xl mx-auto">
                    {currentTab ? currentTab.content : <p className="text-gray-500">Selecione uma opção no menu lateral.</p>}
                </div>
            </main>
        </div>
    );
}