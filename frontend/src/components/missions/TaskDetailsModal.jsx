import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
    X, UploadCloud, CheckCircle, AlertCircle, Loader, Camera, FileText, Send, Link as LinkIcon, ListChecks, HelpCircle
} from 'lucide-react';

// --- DEFINIÇÃO DE API LOCAL (Com Autenticação) ---
// Tenta pegar o token de locais comuns
const getToken = () => localStorage.getItem('token') || localStorage.getItem('user_token') || '';

// EXPORTADO: Agora outros componentes (como MissionDetails) podem usar esta mesma definição
export const api = {
    post: async (endpoint, data) => {
        const baseUrl = 'http://localhost:3001/api'; 
        const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
        
        const token = getToken();

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // CRUCIAL: Envia o token se existir para validar a pontuação no backend
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Erro na requisição: ${response.status}`);
        }

        return { data: await response.json() };
    }
};

const TaskDetailsModal = ({ task, status, onClose, onComplete }) => {
    const [file, setFile] = useState(null);
    const [socialLink, setSocialLink] = useState("");
    
    // Estados para o Quiz
    const [quizAnswers, setQuizAnswers] = useState({}); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Verifica se já foi concluída
    const isCompleted = status?.concluida;

    // --- TRATAMENTO ROBUSTO DO QUIZ ---
    const questions = useMemo(() => {
        if (!task.quiz) return [];
        
        let data = task.quiz;
        
        // 1. Tenta parse se for string (comum em alguns bancos de dados)
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.error("Erro ao fazer parse do quiz:", e);
                return [];
            }
        }

        // 2. Tenta extrair o array de perguntas de várias estruturas possíveis
        // Estrutura { perguntas: [] } ou { questions: [] } ou o próprio array []
        const extractedQuestions = data.perguntas || data.questions || (Array.isArray(data) ? data : []);
        
        return Array.isArray(extractedQuestions) ? extractedQuestions : [];
    }, [task.quiz]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Limite de 25MB para envio por E-mail (SMTP)
            if (selectedFile.size > 25 * 1024 * 1024) { 
                setError("O arquivo excede o limite de 25MB (Limite do servidor de e-mail).");
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    // --- SUBMISSÃO DE DOCUMENTO (DIRECT-TO-EMAIL) ---
    const submitDocumentTask = async () => {
        if (!file) {
            setError("Por favor, anexe o documento solicitado.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Envio do E-mail (Binário direto para o Backend)
            const formData = new FormData();
            formData.append('contract', file);

            console.log("📤 Enviando e-mail...");
            
            // Endpoint específico para envio de e-mail (sem autenticação estrita ou tratado no backend)
            const emailResponse = await fetch('http://localhost:3001/api/send-contract', {
                method: 'POST',
                body: formData, 
            });

            const emailResult = await emailResponse.json();

            if (!emailResponse.ok) {
                throw new Error(emailResult.error || "Falha no envio do e-mail.");
            }

            console.log("✅ E-mail enviado. Registrando pontos...");

            // 2. Registro da Pontuação
            // Usa a api local configurada com token para garantir a validação
            await api.post(`/tasks/${task.id}/submit`, {
                type: 'document',
                fileUrl: null, 
                evidence: `Arquivo enviado via e-mail: ${file.name} | Ref: ${emailResult.messageId || 'S/N'}`,
                emailDestination: 'samuell.alves@aluno.uece.br'
            });

            onComplete();
            
        } catch (err) {
            console.error("Erro no processo:", err);
            const msg = err.message || "Erro ao processar envio.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // --- SUBMISSÃO SOCIAL ---
    const submitSocialTask = async () => {
        if (!socialLink.trim()) {
            setError("Cole o link da sua postagem.");
            return;
        }
        setLoading(true);
        try {
            await api.post(`/tasks/${task.id}/submit`, {
                type: 'social',
                evidence: socialLink
            });
            onComplete();
        } catch (err) {
            console.error("Erro social:", err);
            setError("Erro ao validar link. Verifique se está correto.");
        } finally {
            setLoading(false);
        }
    };

    // --- SUBMISSÃO DE QUIZ ---
    const handleQuizOptionSelect = (questionIndex, option) => {
        setQuizAnswers(prev => ({ ...prev, [questionIndex]: option }));
    };

    const submitQuizTask = async () => {
        const answeredCount = Object.keys(quizAnswers).length;
        
        if (answeredCount < questions.length) {
            setError(`Responda todas as ${questions.length} perguntas.`);
            return;
        }

        setLoading(true);
        try {
            const response = await api.post(`/tasks/${task.id}/submit`, {
                type: 'quiz',
                answers: quizAnswers
            });
            
            if (response.data && (response.data.success || response.data.points > 0)) {
                onComplete();
            } else {
                setError("Pontuação insuficiente ou respostas incorretas.");
            }
        } catch (err) {
            console.error("Erro quiz:", err);
            setError("Respostas incorretas ou erro ao validar.");
        } finally {
            setLoading(false);
        }
    };

    // Lógica genérica
    const submitGenericTask = async () => {
        setLoading(true);
        try {
            await api.post(`/tasks/${task.id}/submit`, { type: 'generic', evidence: 'Conclusão manual' });
            onComplete();
        } catch (err) {
            setError("Erro ao concluir tarefa.");
        } finally {
            setLoading(false);
        }
    };

    const getTaskContent = () => {
        const type = (task.tipo || '').toLowerCase();
        const categoryName = (task.categoria?.nome || '').toLowerCase();

        // 1. TAREFA DE DOCUMENTO
        if (type === 'administrativa' || categoryName.includes('document') || categoryName.includes('administrativa')) {
            return (
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <h4 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2">
                            <FileText size={16} /> Instruções de Envio
                        </h4>
                        <p className="text-sm text-blue-800 mb-2">
                            {task.descricao || task.description || "Envie a documentação necessária."}
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
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            disabled={loading}
                        />
                        {file ? (
                            <div className="text-center">
                                <FileText className="w-8 h-8 text-[#FE5900] mx-auto mb-2" />
                                <p className="font-bold text-gray-700 text-sm">{file.name}</p>
                                <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                <p className="text-xs text-green-600 font-semibold mt-1">Pronto para enviar</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2 transition-colors" />
                                <p className="font-semibold text-gray-600 text-sm">Clique para anexar arquivo</p>
                                <p className="text-xs text-gray-400 mt-1">PDF ou Imagem (Max 25MB)</p>
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
                            {task.descricao || task.description || "Cole o link da postagem."}
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

        // 3. TAREFA QUIZ
        if (type === 'conhecimento' || task.quiz) {
            
            if (questions.length === 0) {
                return (
                    <div className="text-center py-8">
                        <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">Nenhuma pergunta encontrada para este quiz.</p>
                        <p className="text-xs text-gray-400 mt-1">Contate o administrador.</p>
                    </div>
                );
            }

            return (
                <div className="space-y-6">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                        <h4 className="font-bold text-indigo-900 text-sm mb-2 flex items-center gap-2">
                            <HelpCircle size={16} /> Teste de Conhecimento
                        </h4>
                        <p className="text-sm text-indigo-800">
                            Responda corretamente para garantir seus pontos.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {questions.map((q, qIndex) => {
                            // Tratamento de campos flexíveis
                            // Aceita: enunciado, pergunta, question, texto, title
                            const questionText = q.enunciado || q.pergunta || q.question || q.texto || q.title || "Pergunta sem texto";
                            // Aceita: opcoes, alternativas, options, answers
                            const options = q.opcoes || q.alternativas || q.options || q.answers || [];

                            return (
                                <div key={qIndex} className="space-y-3">
                                    <p className="font-bold text-gray-800 text-sm">
                                        {qIndex + 1}. {questionText}
                                    </p>
                                    <div className="space-y-2">
                                        {options.length > 0 ? (
                                            options.map((opt, optIndex) => (
                                                <label 
                                                    key={optIndex} 
                                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                                        quizAnswers[qIndex] === opt 
                                                        ? 'border-indigo-500 bg-indigo-50 shadow-sm' 
                                                        : 'border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question-${qIndex}`}
                                                        value={opt}
                                                        checked={quizAnswers[qIndex] === opt}
                                                        onChange={() => handleQuizOptionSelect(qIndex, opt)}
                                                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                                        disabled={loading}
                                                    />
                                                    <span className={`text-sm ${quizAnswers[qIndex] === opt ? 'text-indigo-900 font-medium' : 'text-gray-600'}`}>
                                                        {opt}
                                                    </span>
                                                </label>
                                            ))
                                        ) : (
                                            <p className="text-xs text-red-400 italic">Sem opções cadastradas.</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button 
                        onClick={submitQuizTask}
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all mt-4"
                    >
                        {loading ? <Loader className="animate-spin w-5 h-5" /> : <ListChecks size={18} />}
                        {loading ? "Validando Respostas..." : "Enviar Respostas"}
                    </button>
                </div>
            );
        }

        // 4. FALLBACK
        return (
            <div className="space-y-6">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <h4 className="font-bold text-gray-800 text-sm mb-2">Descrição</h4>
                    <p className="text-sm text-gray-600">
                        {task.descricao || task.description || "Realize a atividade."}
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
                className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
                    <h3 className="font-bold text-lg text-gray-800 truncate pr-4">{task.titulo || 'Detalhes da Tarefa'}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
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
                                <p className="text-xs text-blue-500 mt-4">Evidência enviada</p>
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