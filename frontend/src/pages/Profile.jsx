import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { useNavigate } from "react-router-dom";
import {
    Cog6ToothIcon,
    PencilSquareIcon,
    UserCircleIcon,
    ArrowUpOnSquareIcon
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";

// ⚠️ PLACEHOLDER: Mantenha o seu Contexto de Autenticação/Usuário real aqui
const useAuth = () => ({ 
    // Simula o contexto para fins de token e ID
    user: { id: 1, token: localStorage.getItem('token') || 'fake-token' }, 
    setUser: () => {} 
});

// ⚠️ PLACEHOLDER: Mantenha sua instância Axios configurada para sua API
const api = axios.create({
    baseURL: 'http://localhost:5000/api' 
});

// Função auxiliar para descrição personalizada (do código antigo, adaptada)
const getDescricaoPersonalizada = (name) => {
    if (name.includes("Carlos")) return "IT Student - Full Stack Dev";
    if (name.includes("Ana")) return "UX/UI Designer passionate about innovation";
    if (name.includes("João")) return "Data and AI Specialist";
    return "Membro da comunidade Atlântico Avanti";
};

// Função auxiliar para formatar a data de exibição
const formatDate = (dateString) => {
    if (!dateString) return 'Não informado';
    try {
        return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
    } catch (e) {
        return dateString; 
    }
};

// Função auxiliar para iniciais (do código antigo)
const getInitials = (name) =>
    name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase();


// --- COMPONENTE PRINCIPAL ---
export default function Profile() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    // 🛑 ESTADO UNIFICADO: Mapeia todos os campos do backend
    const [form, setForm] = useState({
        nome: '',
        email: '',
        foto_url: '', 
        curiosidades: '', 
        linkedin_url: '',
        website: '',
        interesses: '',
        data_nascimento: '', 
        telefone: '',
        pontos: 0, // Adicionado para manter a UX de pontos/nível
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);


    // --- LÓGICA DE BUSCA INICIAL (GET /users/me) ---
    const fetchUser = async () => {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        
        if (!token) {
            navigate("/register");
            setIsLoading(false);
            return;
        }

        try {
            const res = await api.get('/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const data = res.data;
            const nome = data.nome || 'Usuário Avanti';
            
            const profileData = {
                nome: nome,
                email: data.email || '',
                foto_url: data.foto_url || '',
                // Curiosidades/Description usa a descrição do backend, mas cai na personalizada se vazia
                curiosidades: data.curiosidades || getDescricaoPersonalizada(nome),
                linkedin_url: data.linkedin_url || '',
                website: data.website || '',
                interesses: data.interesses || '',
                telefone: data.telefone || '',
                data_nascimento: data.data_nascimento || '',
                pontos: data.pontos || 1200, // Assumindo que pontos vem do backend ou tem default
            };
            
            setForm(profileData);
            setUser(prev => ({ ...prev, ...profileData }));
        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            // navigate("/register"); // Descomente se erro de auth for fatal
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [user.id, navigate]);

    // Função para atualizar o estado do formulário (adaptada para a nova estrutura)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // --- LÓGICA DE SALVAMENTO (PUT /users/me) ---
    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        
        try {
            const token = user.token || localStorage.getItem('token');
            // O payload de atualização deve conter *todos* os campos que queremos salvar,
            // que estão mapeados no estado 'form'
            const updatePayload = {
                ...form,
                curiosidades: form.curiosidades, // Renomeado de description para curiosidades
                nome: form.nome,
                email: form.email,
                foto_url: form.foto_url,
            }; 
            delete updatePayload.pontos; // Remove campos que não devem ser enviados (ex: pontos, id)

            const res = await api.put('/users/me', updatePayload, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const updatedProfileData = res.data;
            
            // Re-enriquece os dados retornados com os pontos locais (se o backend não retornar)
            setForm(prev => ({ 
                ...prev, 
                ...updatedProfileData,
                // Mantém os pontos se o backend não os devolver no PUT
                pontos: prev.pontos 
            })); 
            
            setIsEditing(false);
            alert('Perfil atualizado com sucesso! ✅');
        } catch (error) {
            console.error('Erro ao salvar perfil:', error.response?.data?.error || error.message);
            alert(`Erro ao salvar: ${error.response?.data?.error || 'Verifique o console.'} ❌`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/logout");
    };
    
    // --- DROPZONE (Para Foto de Perfil) ---
    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setForm((prev) => ({ ...prev, foto_url: reader.result })); // Atualiza foto_url com a Base64
            };
            reader.readAsDataURL(file);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': ['.jpeg', '.png', '.jpg'] } });

    // --- UX de Progresso (do código antigo) ---
    const getLevel = (points) => Math.floor((points || 0) / 1000);
    const getProgress = (points) => ((points || 0) % 1000) / 10;
    
    // --- JSX ---
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-[#394C97] font-semibold">Carregando perfil... ⏳</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen bg-gradient-to-br from-[#FEF7EC] to-[#394C97] flex flex-col items-center pt-[50px] px-4"
        >
            <div className="w-full max-w-4xl bg-white/30 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-white/40 pt-[100px]">
                
                {/* 1. AVATAR (com Dropzone) */}
                <div className="flex justify-start -mt-12 mb-6 px-6">
                    <div
                        {...getRootProps()}
                        className={`w-32 h-32 ml-[80px] rounded-full overflow-hidden border-2 border-white shadow-lg bg-[#FEF7EC] flex items-center justify-center cursor-pointer transition duration-300 ${
                            isEditing ? (isDragActive ? "border-[#FE5900]" : "border-blue-500") : "border-white"
                        }`}
                    >
                        <input {...getInputProps()} disabled={!isEditing} />
                        {form.foto_url ? (
                            <>
                                <img
                                    src={form.foto_url}
                                    alt="Profile"
                                    className="w-full h-full object-cover rounded-full"
                                />
                                {isEditing && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 hover:opacity-100 transition duration-300">
                                        <ArrowUpOnSquareIcon className="h-6 w-6" />
                                    </div>
                                )}
                            </>
                        ) : (
                            <UserCircleIcon className="h-28 w-28 text-[#394C97]" />
                        )}
                    </div>
                </div>

                {/* 2. NOME, DESCRIÇÃO E DETALHES */}
                <div className="px-6 pb-8 text-left">
                    <div className="text-left mb-4 ml-[80px]">
                        <h1 className="text-2xl font-bold text-[#394C97] mb-1">
                            {form.nome || 'Nome não definido'}
                        </h1>
                        <p className="text-sm text-[#FE5900] font-semibold">{form.curiosidades}</p>
                    </div>

                    {/* Formulário de edição */}
                    {isEditing ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4 text-left max-w-lg ml-[80px]"
                        >
                            {/* Nome e Email */}
                            <input type="text" placeholder="Nome" name="nome" value={form.nome} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                            <input type="email" placeholder="Email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                            
                            {/* Curiosidades/Descrição */}
                            <textarea placeholder="Biografia/Curiosidades" name="curiosidades" value={form.curiosidades} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg h-24 resize-none" />
                            
                            {/* Links e Contato */}
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="LinkedIn URL" name="linkedin_url" value={form.linkedin_url} onChange={handleChange} className="px-4 py-2 border rounded-lg" />
                                <input type="text" placeholder="Website" name="website" value={form.website} onChange={handleChange} className="px-4 py-2 border rounded-lg" />
                                <input type="text" placeholder="Telefone" name="telefone" value={form.telefone} onChange={handleChange} className="px-4 py-2 border rounded-lg" />
                                <input type="date" placeholder="Data de Nasc." name="data_nascimento" value={form.data_nascimento} onChange={handleChange} className="px-4 py-2 border rounded-lg" />
                            </div>
                            <input type="text" placeholder="Interesses" name="interesses" value={form.interesses} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />

                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full py-2 bg-[#394C97] text-white rounded-lg hover:bg-[#FE5900] transition hover:shadow-md disabled:bg-gray-400"
                            >
                                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </motion.div>
                    ) : (
                        // Visualização dos dados
                        <div className="text-sm text-gray-700 ml-[80px] space-y-2 max-w-lg text-left">
                            <p><strong>Email:</strong> {form.email}</p>
                            <p><strong>Telefone:</strong> {form.telefone || 'Não informado'}</p>
                            <p><strong>Nascimento:</strong> {formatDate(form.data_nascimento)}</p>
                            <p><strong>LinkedIn:</strong> {form.linkedin_url ? <a href={form.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Ver</a> : 'Não informado'}</p>
                            <p><strong>Website:</strong> {form.website ? <a href={form.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Acessar</a> : 'Não informado'}</p>
                            <p><strong>Interesses:</strong> {form.interesses || 'Não informado'}</p>
                            <p className="pt-2 border-t mt-2">
                                <strong>Pontos Totais:</strong> {form.pontos} (Nível {getLevel(form.pontos)})
                            </p>
                            <p><strong>Iniciais:</strong> {getInitials(form.nome)}</p>
                        </div>
                    )}
                </div>

                {/* 3. BOTÕES DE AÇÃO */}
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                            isEditing 
                            ? "bg-yellow-500 text-white hover:bg-yellow-600" 
                            : "bg-[#FEF7EC] text-[#394C97] hover:bg-[#FE5900]/20"
                        }`}
                        disabled={isSaving}
                    >
                        <PencilSquareIcon className="h-5 w-5" />
                        {isEditing ? "Cancelar Edição" : "Editar Perfil"}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#FEF7EC] text-[#394C97] rounded-full hover:bg-[#FE5900]/20 transition">
                        <Cog6ToothIcon className="h-5 w-5" />
                        Configurações
                    </button>
                </div>

                <div className="px-6 pb-6">
                    {/* Barra de Progresso do Nível (mantida) */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-[#394C97] mb-2 text-center">Progresso para o Nível {getLevel(form.pontos) + 1}</h3>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <motion.div 
                                className="bg-[#FE5900] h-2.5 rounded-full" 
                                initial={{ width: 0 }}
                                animate={{ width: `${getProgress(form.pontos)}%` }}
                                transition={{ duration: 1.5 }}
                            />
                        </div>
                        <p className="text-center text-xs text-gray-500 mt-1">{getProgress(form.pontos).toFixed(0)}% completo</p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full mt-4 px-6 py-3 bg-[#394C97] text-white rounded-full font-semibold shadow hover:bg-[#FE5900] transition duration-300"
                    >
                        Sair (Log Out)
                    </button>
                </div>
            </div>
        </motion.div>
    );
}