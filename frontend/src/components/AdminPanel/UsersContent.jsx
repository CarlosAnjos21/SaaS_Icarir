// src/components/AdminPanel/UsersContent.jsx (Código Completo Corrigido)

import React, { useState, useEffect, useCallback } from 'react';
import { Users, AlertTriangle, Loader, Edit, Trash2, Plus } from 'lucide-react';
// Importa todas as funções de API
import { fetchUsers, createUser, updateUser, deleteUserApi } from '../../api/apiFunctions'; 
import UserModal from './UserModal'; // Importa o Modal

// Função auxiliar para determinar a cor do Role/Função
const getRoleStyle = (role) => {
    switch (role) {
        case 'admin':
            return 'bg-red-200 text-red-900';
        case 'validador':
            return 'bg-yellow-100 text-yellow-800';
        case 'participante':
        default:
            return 'bg-indigo-100 text-indigo-800';
    }
};


// Estado inicial para o formulário de usuário (Ajustado para o DB Schema)
const INITIAL_USER_STATE = {
    nome: "",           // <-- Mapeia para a coluna 'nome'
    email: "",
    senha: "",          // <-- Mapeia para a coluna 'senha'
    pontos: 0,          // <-- Mapeia para a coluna 'pontos'
    role: "participante", // <-- Mapeia para a coluna 'role'
    ativo: true,        // <-- Mapeia para a coluna 'ativo'
};


// Componente auxiliar para a Tabela de Usuários (AJUSTADO)
const UserTable = ({ users, onEdit, onDelete, isLoading }) => (
    <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    {/* NOVOS HEADERS */}
                    {["Nome", "Email", "Função/Role", "Pontos", "Status", "Criado em", "Ações"].map(header => (
                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                        
                        {/* 1. NOME (usando user.nome) */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nome}</td>
                        
                        {/* 2. EMAIL (usando user.email) */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                        
                        {/* 3. FUNÇÃO/ROLE (usando user.role) */}
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold capitalize rounded-full ${getRoleStyle(user.role)}`}>
                                {user.role}
                            </span>
                        </td>
                        
                        {/* 4. PONTOS (usando user.pontos) */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{user.pontos}</td>
                        
                        {/* 5. STATUS (usando user.ativo) */}
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {user.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                        </td>
                        
                        {/* 6. DATA CRIAÇÃO (usando user.data_criacao) */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                            {user.data_criacao ? new Date(user.data_criacao).toLocaleDateString() : 'N/A'}
                        </td>

                        {/* 7. AÇÕES */}
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
            // Assegura que data_criacao é um campo válido para a tabela
            const validUsers = data.map(user => ({
                ...user,
                data_criacao: user.data_criacao || user.dataCriacao, // Adiciona fallback para flexibilidade
            }));
            setUsers(validUsers);
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
            // Copia o objeto para evitar mutação direta. 
            setCurrentUser({ 
                ...userToEdit, 
                senha: "", // Nunca pré-popule a senha ao editar
                // Garante que 'pontos' é numérico
                pontos: Number(userToEdit.pontos) 
            }); 
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
        // Validação básica (usando 'nome' e 'senha')
        if (!currentUser.nome || !currentUser.email || (!isEditing && !currentUser.senha)) {
            alert("Preencha Nome, Email e Senha (para novos usuários).");
            return;
        }

        setIsSaving(true);
        try {
            let response;
            if (isEditing) {
                // Atualizar usuário existente (PUT)
                response = await updateUser(currentUser.id, currentUser);
                // NOTA: O backend deve retornar { message: "...", user: {...} } ou apenas {...}
                const userToUpdate = response.user || response;
                setUsers(users.map(u => u.id === currentUser.id ? userToUpdate : u));
            } else {
                // Criar novo usuário (POST)
                response = await createUser(currentUser); 
                
                // 🛑 CORREÇÃO PRINCIPAL: Extrair o objeto 'user' da resposta do backend.
                const newUser = response.user || response; // Tenta extrair 'user', ou usa a resposta completa

                if (newUser && newUser.id) {
                    setUsers([...users, newUser]);
                } else {
                    throw new Error("Resposta da API de criação inválida.");
                }
            }
            handleModalClose();
        } catch (err) {
            // Tratamento de erro aprimorado
            const errorData = err.response?.data;
            const errorMsg = errorData?.error || errorData?.message || err.message;
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
            const errorData = err.response?.data;
            const errorMsg = errorData?.error || errorData?.message || err.message;
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