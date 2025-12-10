import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    X, UploadCloud, CheckCircle, AlertCircle, Loader, Camera, FileText, Send 
} from 'lucide-react';
import { supabase } from '../../api/supabaseClient'; 
import api from '../../api/api';

const TaskDetailsModal = ({ task, status, onClose, onComplete }) => {
    const [file, setFile] = useState(null);
    const [socialLink, setSocialLink] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Verifica se já foi feita
    const isCompleted = status?.concluida;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 200 * 1024 * 1024) { // 200MB limit
                setError("O arquivo excede o limite de 200MB.");
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const submitDocumentTask = async () => {
        if (!file) {
            setError("Por favor, anexe o documento solicitado.");
            return;
        }

        setLoading(true);
        try {
            // 1. Upload para Supabase
            const fileExt = file.name.split('.').pop();
            const fileName = `doc_${task.id}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('evidencias') // Certifique-se de criar este bucket público 'evidencias' no Supabase
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('evidencias')
                .getPublicUrl(filePath);

            // 2. Registrar no Backend
            await api.post(`/tasks/${task.id}/submit`, {
                type: 'document',
                fileUrl: data.publicUrl,
                evidence: `Enviado para: samuell.alves@aluno.uece.br | Arquivo: ${data.publicUrl}`
            });

            onComplete(); // Fecha e atualiza
            
        } catch (err) {
            console.error("Erro no envio:", err);
            setError("Falha ao enviar documento. Verifique a conexão.");
        } finally {
            setLoading(false);
        }
    };

    const submitSocialTask = async () => {
        if (!socialLink.trim()) {
            setError("Cole o link da sua postagem.");
            return;
        }

        setLoading(true);
        
        // Simulação de delay de verificação
        setTimeout(async () => {
            try {
                await api.post(`/tasks/${task.id}/submit`, {
                    type: 'social',
                    evidence: socialLink
                });
                onComplete();
            } catch (err) {
                console.error("Erro social:", err);
                setError("Não foi possível validar. Tente novamente.");
                setLoading(false);
            }
        }, 1500); 
    };

    const submitGenericTask = async () => {
        setLoading(true);
        try {
            await api.post(`/tasks/${task.id}/submit`, { type: 'generic', evidence: 'Conclusão manual' });
            onComplete();
        } catch (err) {
            setError("Erro ao concluir tarefa.");
            setLoading(false);
        }
    };

    // Lógica para decidir qual conteúdo renderizar
    const getTaskContent = () => {
        // Normalização para evitar erros de caixa alta/baixa ou nulos
        const type = (task.tipo || '').toLowerCase();
        const categoryName = (task.categoria?.nome || '').toLowerCase();

        // 1. TAREFA DE DOCUMENTO (Administrativa)
        if (type === 'administrativa' || categoryName.includes('document') || categoryName.includes('administrativa')) {
            return (
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <h4 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2">
                            <FileText size={16} /> Instruções de Envio
                        </h4>
                        <p className="text-sm text-blue-800 mb-2">
                            {task.descricao || task.description || "Envie o documento solicitado para validação."}
                        </p>
                        <div className="bg-white p-2 rounded border border-blue-100 text-xs font-mono text-blue-600">
                            Destino: samuell.alves@aluno.uece.br
                        </div>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-white transition-colors relative cursor-pointer group">
                        <input 
                            type="file" 
                            onChange={handleFileChange} 
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        {file ? (
                            <div className="text-center">
                                <FileText className="w-8 h-8 text-[#FE5900] mx-auto mb-2" />
                                <p className="font-bold text-gray-700 text-sm">{file.name}</p>
                                <p className="text-xs text-green-600 font-semibold mt-1">Pronto para enviar</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2 transition-colors" />
                                <p className="font-semibold text-gray-600 text-sm">Clique para anexar arquivo</p>
                                <p className="text-xs text-gray-400 mt-1">PDF ou Imagem (Max 200MB)</p>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={submitDocumentTask}
                        disabled={loading || !file}
                        className="w-full bg-[#FE5900] text-white py-3 rounded-xl font-bold shadow-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                    >
                        {loading ? <Loader className="animate-spin w-5 h-5" /> : <Send size={18} />}
                        {loading ? "Enviando..." : "Enviar e Receber Pontos"}
                    </button>
                </div>
            );
        }

        // 2. TAREFA SOCIAL
        if (type === 'social' || categoryName.includes('social')) {
            return (
                <div className="space-y-6">
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                        <h4 className="font-bold text-purple-900 text-sm mb-2 flex items-center gap-2">
                            <Camera size={16} /> Desafio Social
                        </h4>
                        <p className="text-sm text-purple-800">
                            {task.descricao || task.description || "Faça uma postagem e cole o link abaixo para comprovar."}
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Link da Postagem</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                            <input 
                                type="url" 
                                placeholder="https://instagram.com/p/..." 
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                                value={socialLink}
                                onChange={(e) => setSocialLink(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2">
                            * O link ficará salvo para auditoria futura da equipe.
                        </p>
                    </div>

                    <button 
                        onClick={submitSocialTask}
                        disabled={loading || !socialLink}
                        className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                    >
                        {loading ? <Loader className="animate-spin w-5 h-5" /> : <CheckCircle size={18} />}
                        {loading ? "Verificando..." : "Validar e Ganhar Pontos"}
                    </button>
                </div>
            );
        }

        // 3. TAREFA PADRÃO (FALLBACK)
        return (
            <div className="space-y-6">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <h4 className="font-bold text-gray-800 text-sm mb-2">Descrição da Tarefa</h4>
                    <p className="text-sm text-gray-600">
                        {task.descricao || task.description || "Realize a atividade proposta para completar esta etapa."}
                    </p>
                </div>
                <button 
                    onClick={submitGenericTask}
                    disabled={loading}
                    className="w-full bg-[#394C97] text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? <Loader className="animate-spin w-5 h-5" /> : <CheckCircle size={18} />}
                    Marcar como Concluída
                </button>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800 truncate pr-4">{task.titulo || 'Detalhes da Tarefa'}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {error && (
                        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-xs font-medium flex items-center gap-2">
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}
                    
                    {isCompleted ? (
                        <div className="text-center py-6">
                            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CheckCircle size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Tarefa Concluída!</h3>
                            <p className="text-sm text-gray-500 mt-1">Pontos creditados com sucesso.</p>
                            {status?.evidencias?.url && (
                                <a href={status.evidencias.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline mt-4 block">
                                    Ver evidência enviada
                                </a>
                            )}
                        </div>
                    ) : (
                        getTaskContent()
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default TaskDetailsModal;