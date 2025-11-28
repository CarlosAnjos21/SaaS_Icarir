// src/components/AdminPanel/UsersContent.jsx (Atualizado)

import React, { useState, useEffect, useCallback } from 'react';
import { Users, AlertTriangle, Loader, Edit, Trash2, Plus } from 'lucide-react';
// Importa todas as funções de API
import { fetchUsers, createUser, updateUser, deleteUserApi } from '../../api/apiFunctions'; 
import UserModal from './UserModal'; // Importa o Modal

// Estado inicial para o formulário de usuário
const INITIAL_USER_STATE = {
    name: "",
    email: "",
    password: "", // Senha só é necessária na criação
    points: 0,
    level: "Bronze",
    status: "Ativo",
};


// Componente auxiliar para a Tabela de Usuários (Melhorado com botões de ação)
const UserTable = ({ users, onEdit, onDelete, isLoading }) => (
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
                            {/* Lógica de cores baseada no nível do usuário */}
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
                            <button onClick={() => onEdit(user)} disabled={isLoading} className="text-blue-600 hover:text-blue-900 p-1 disabled:opacity-50">
                                <Edit size={18} />
                            </button>
                            <button onClick={() => onDelete(user.id)} disabled={isLoading} className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50">
                                <Trash2 size={18} />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


const UsersContent = () => {
    // ESTADOS DE DADOS
    const [users, setUsers] = useState([]);
    
    // ESTADOS DE FLUXO
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // ESTADOS DE CRIAÇÃO/EDIÇÃO
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState(INITIAL_USER_STATE);


    // --- FUNÇÕES DE CARREGAMENTO (READ - GET) ---

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

    
    // --- FUNÇÕES DE CONTROLE DO MODAL ---

    const handleModalOpen = (userToEdit = null) => {
        if (userToEdit) {
            setIsEditing(true);
            // Copia o objeto para evitar mutação direta
            setCurrentUser({ ...userToEdit, password: "" }); 
        } else {
            setIsEditing(false);
            setCurrentUser(INITIAL_USER_STATE);
        }
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setIsEditing(false);
        setCurrentUser(INITIAL_USER_STATE);
        setError(null);
    };


    // --- FUNÇÕES DE API (CREATE/UPDATE/DELETE) ---

    const handleSaveUser = async () => {
        // Validação básica
        if (!currentUser.name || !currentUser.email || (!isEditing && !currentUser.password)) {
            alert("Preencha Nome, Email e Senha (para novos usuários).");
            return;
        }

        setIsSaving(true);
        try {
            if (isEditing) {
                // Atualizar usuário existente (PUT)
                const updated = await updateUser(currentUser.id, currentUser);
                setUsers(users.map(u => u.id === currentUser.id ? updated : u));
            } else {
                // Criar novo usuário (POST)
                const created = await createUser(currentUser);
                setUsers([...users, created]);
            }
            handleModalClose();
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            setError(`Falha ao salvar usuário: ${errorMsg}`);
            console.error("Erro ao salvar usuário:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir este usuário? Esta ação é irreversível.")) {
            return;
        }

        setIsSaving(true);
        try {
            await deleteUserApi(id);
            setUsers(users.filter(u => u.id !== id));
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            setError(`Falha ao excluir usuário: ${errorMsg}`);
            console.error("Erro ao deletar usuário:", err);
        } finally {
            setIsSaving(false);
        }
    };

    // --- RENDERIZAÇÃO ---
    
    if (loading) {
        return <div className="text-center p-10"><Loader size={30} className="animate-spin mx-auto text-[#394C97]" /> <p className="mt-2 text-gray-500">Carregando usuários...</p></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">👥 Gestão de Usuários</h2>
                <button
                    onClick={() => handleModalOpen()}
                    className="bg-[#FE5900] text-white px-4 py-2 rounded-xl shadow-lg hover:bg-[#d94d00] transition flex items-center gap-2 font-semibold disabled:opacity-50"
                    disabled={isSaving}
                >
                    <Plus size={20} />
                    Novo Usuário
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center gap-3 mb-4" role="alert">
                    <AlertTriangle size={20} />
                    <span className="block sm:inline">{error}</span>
                    <button onClick={loadUsers} className="ml-4 underline font-semibold">Recarregar Lista</button>
                </div>
            )}
            
            <UserTable 
                users={users} 
                onEdit={handleModalOpen} 
                onDelete={handleDeleteUser} 
                isLoading={isSaving}
            />

            {/* Modal de Usuário */}
            {showModal && (
                <UserModal 
                    user={currentUser}
                    setUser={setCurrentUser}
                    handleSave={handleSaveUser}
                    handleClose={handleModalClose}
                    isEditing={isEditing}
                    isLoading={isSaving}
                />
            )}
        </div>
    );
};

export default UsersContent;