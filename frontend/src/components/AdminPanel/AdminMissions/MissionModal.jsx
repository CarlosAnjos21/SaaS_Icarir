import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Certifique-se que o caminho para o cliente supabase está correto
import { supabase } from '../../../api/supabaseClient'; 
import { 
    X, Settings, Image as ImageIcon, Briefcase, Plus, Loader, Trash2, 
    CheckSquare, DollarSign, Users, Calendar, FileText, Camera, Mail, MapPin, UploadCloud,
    AlertCircle, Share2
} from 'lucide-react';
import QuizForm from './QuizForm';

const MissionModal = ({ newMission, setNewMission, handleAddStep, handleRemoveStep, handleToggleQuiz, handleSaveMission, handleModalClose, isEditing, isLoading }) => {
    
    const [uploading, setUploading] = useState(false);

    const handleStepChange = (index, field, value) => {
        const updatedSteps = [...newMission.steps];
        if (field === 'points') updatedSteps[index][field] = Number(value);
        else updatedSteps[index][field] = value;
        setNewMission({ ...newMission, steps: updatedSteps });
    };

    const handleImageUpload = async (event) => {
        try {
            setUploading(true);
            const file = event.target.files[0];
            if (!file) return;

            if (file.size > 2 * 1024 * 1024) {
                alert("A imagem de capa deve ter no máximo 2MB.");
                return;
            }

            const fileExt = file.name.split('.').pop();
            // Gera nome único para evitar colisão
            const fileName = `mission_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            // Salva na pasta 'capas/' dentro do bucket
            const filePath = `capas/${fileName}`;

            // Upload para o bucket 'images' (Verifique se ele existe e é público)
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Gera a URL pública
            const { data } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            // Atualiza o estado para exibir o preview imediatamente
            setNewMission({ ...newMission, imageUrl: data.publicUrl });

        } catch (error) {
            console.error("Erro de upload:", error);
            alert('Erro ao fazer upload: ' + (error.message || "Verifique se o bucket 'images' existe e é público."));
        } finally {
            setUploading(false);
        }
    };

    const addDocumentTask = () => {
        const docTask = {
            description: "", 
            points: 50,
            tipo: 'administrativa', 
        };
        setNewMission(prev => ({ ...prev, steps: [docTask, ...(prev.steps || [])] }));
    };

    const addSocialTask = () => {
        const socialTask = {
            description: "",
            points: 30,
            tipo: 'social',
        };
        setNewMission(prev => ({ ...prev, steps: [...(prev.steps || []), socialTask] }));
    };

    return (
        <div className="absolute inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto custom-scrollbar w-full h-full">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={handleModalClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl relative flex flex-col mt-10 mb-10 z-50"
            >
                <button
                    onClick={handleModalClose}
                    disabled={isLoading}
                    className="absolute top-4 right-4 z-50 p-2 bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors shadow-sm border border-gray-100"
                >
                    <X size={24} />
                </button>

                <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-[#394C97]">
                        {isEditing ? "Editar Missão" : "Nova Missão"}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Configure os detalhes da viagem, valores e tarefas.</p>
                </div>

                <div className="p-8 space-y-8">
                    {/* SEÇÃO 1: DADOS E CAPA */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-5">
                            <div className="flex items-center gap-2 text-[#394C97] font-bold text-xs uppercase tracking-widest mb-2 border-b border-gray-100 pb-2">
                                <Settings size={14} /> Dados Gerais
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Título</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Imersão no Vale do Silício"
                                    className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-[#394C97]/20 outline-none font-bold text-gray-700"
                                    value={newMission.title}
                                    onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
                                    disabled={isLoading}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Descrição</label>
                                <textarea
                                    placeholder="Detalhes..."
                                    rows={2}
                                    className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-[#394C97]/20 outline-none text-sm resize-none"
                                    value={newMission.descricao || ""}
                                    onChange={(e) => setNewMission({ ...newMission, descricao: e.target.value })}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Cidade</label>
                                    <div className="relative">
                                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-200 bg-gray-50 p-3 pl-10 rounded-xl outline-none text-sm"
                                            value={newMission.city}
                                            onChange={(e) => setNewMission({ ...newMission, city: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Expiração</label>
                                    <div className="relative">
                                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-200 bg-gray-50 p-3 pl-10 rounded-xl outline-none text-sm text-gray-600"
                                            value={newMission.expirationDate}
                                            onChange={(e) => setNewMission({ ...newMission, expirationDate: e.target.value })}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Pontos (XP)</label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl outline-none text-sm"
                                        value={newMission.points}
                                        onChange={(e) => setNewMission({ ...newMission, points: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Valor (R$)</label>
                                    <div className="relative">
                                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full border border-gray-200 bg-gray-50 p-3 pl-10 rounded-xl outline-none text-sm"
                                            value={newMission.preco ?? ''}
                                            onChange={(e) => setNewMission({ ...newMission, preco: e.target.value === '' ? null : Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Vagas</label>
                                    <div className="relative">
                                        <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-200 bg-gray-50 p-3 pl-10 rounded-xl outline-none text-sm"
                                            value={newMission.vagas_disponiveis ?? ''}
                                            onChange={(e) => setNewMission({ ...newMission, vagas_disponiveis: e.target.value === '' ? null : parseInt(e.target.value, 10) })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Coluna da Direita: Upload de Capa */}
                        <div className="lg:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 mb-2">Capa da Missão</label>
                            {/* Área de Preview e Upload */}
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors h-full min-h-[200px] relative overflow-hidden group">
                                {uploading ? (
                                    <div className="flex flex-col items-center">
                                        <Loader className="animate-spin text-[#394C97] mb-2" />
                                        <span className="text-xs text-gray-400">Enviando...</span>
                                    </div>
                                ) : newMission.imageUrl ? (
                                    // PREVIEW DA IMAGEM SE JÁ EXISTIR (Edição ou Upload Recente)
                                    <div className="relative w-full h-full">
                                        <img 
                                            src={newMission.imageUrl} 
                                            alt="Capa" 
                                            className="w-full h-full object-cover rounded-lg shadow-sm" 
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg cursor-pointer">
                                            <p className="text-white text-xs font-bold flex items-center gap-1"><UploadCloud size={16}/> Alterar</p>
                                        </div>
                                    </div>
                                ) : (
                                    // Placeholder se não houver imagem
                                    <>
                                        <ImageIcon className="text-gray-300 mb-2" size={40} />
                                        <span className="text-xs text-gray-500 text-center font-medium">Clique para upload</span>
                                        <span className="text-[10px] text-gray-400 text-center mt-1">(Max 2MB)</span>
                                    </>
                                )}
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageUpload} 
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    disabled={uploading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SEÇÃO 2: TAREFAS */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                            <div className="flex items-center gap-2 text-[#394C97] font-bold text-xs uppercase tracking-widest">
                                <Briefcase size={14} /> Etapas e Requisitos
                            </div>
                            
                            <div className="flex gap-2">
                                <button onClick={addDocumentTask} type="button" className="text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors flex gap-1">
                                    <FileText size={12} /> + Docs
                                </button>
                                <button onClick={addSocialTask} type="button" className="text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 transition-colors flex gap-1">
                                    <Camera size={12} /> + Social
                                </button>
                                <button onClick={handleAddStep} type="button" className="text-[10px] font-bold text-white bg-[#394C97] hover:bg-[#2a385f] px-3 py-1.5 rounded-lg shadow-sm transition-colors flex gap-1">
                                    <Plus size={12} /> + Manual
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {newMission.steps.map((step, i) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={i} 
                                    className={`flex gap-3 items-start p-3 border rounded-xl group transition-colors ${
                                        step.tipo === 'administrativa' ? 'bg-blue-50/50 border-blue-200' :
                                        step.tipo === 'social' ? 'bg-purple-50/50 border-purple-200' :
                                        'bg-gray-50 border-gray-200 hover:border-blue-200'
                                    }`}
                                >
                                    <div className="mt-3 text-xs font-bold text-gray-400 w-6 text-center select-none">{i + 1}</div>
                                    
                                    <div className="flex-1 space-y-2">
                                        {step.tipo === 'administrativa' ? (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Mail size={14} className="text-blue-500" />
                                                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Envio de Documento</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Título do Documento (Ex: Cópia do RG)"
                                                    className="w-full border border-blue-200 bg-white p-2.5 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none text-gray-700 font-medium"
                                                    value={step.description}
                                                    onChange={(e) => handleStepChange(i, 'description', e.target.value)}
                                                    disabled={isLoading}
                                                />
                                                <div className="flex items-start gap-1.5 text-[10px] text-blue-600/80 bg-blue-100/50 p-2 rounded-lg mt-1">
                                                    <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                                                    <span>Envio para: <strong>samuell.alves@aluno.uece.br</strong></span>
                                                </div>
                                            </div>
                                        ) : step.tipo === 'social' ? (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Share2 size={14} className="text-purple-500" />
                                                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Postagem Social</span>
                                                </div>
                                                 <input
                                                    type="text"
                                                    placeholder="Regra do Post (Ex: Foto com a hashtag #Evento2025)"
                                                    className="w-full border border-purple-200 bg-white p-2.5 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 outline-none text-gray-700 font-medium"
                                                    value={step.description}
                                                    onChange={(e) => handleStepChange(i, 'description', e.target.value)}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        ) : (
                                            <textarea
                                                placeholder="Descrição da etapa"
                                                className="w-full border bg-white p-2.5 rounded-lg text-sm focus:ring-1 focus:ring-[#394C97] outline-none text-gray-700 resize-none"
                                                value={step.description}
                                                onChange={(e) => handleStepChange(i, 'description', e.target.value)}
                                                rows={2}
                                            />
                                        )}
                                    </div>
                                    <div className="w-24">
                                        <input
                                            type="number"
                                            placeholder="Pts"
                                            className="w-full border bg-white p-2.5 text-center rounded-lg text-sm outline-none font-mono"
                                            value={step.points}
                                            onChange={(e) => handleStepChange(i, 'points', e.target.value)}
                                        />
                                    </div>
                                    <button onClick={() => handleRemoveStep(i)} className="p-2.5 text-gray-300 hover:text-red-500">
                                        <Trash2 size={16} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* SEÇÃO 3: QUIZ */}
                    <section className="space-y-4 pt-2 border-t border-gray-100">
                        <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${newMission.quiz ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${newMission.quiz ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}`}>
                                {newMission.quiz && <CheckSquare size={12} className="text-white" />}
                            </div>
                            <input 
                                type="checkbox" 
                                checked={!!newMission.quiz} 
                                onChange={handleToggleQuiz} 
                                className="hidden" 
                                disabled={isLoading}
                            />
                            <div>
                                <span className="block text-sm font-bold text-gray-800">Incluir Quiz</span>
                                <span className="block text-xs text-gray-500">Validação de conhecimento ao final.</span>
                            </div>
                        </label>

                        <AnimatePresence>
                            {newMission.quiz && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                    <div className="pl-4 border-l-2 border-indigo-100 ml-2 py-2">
                                        <QuizForm newMission={newMission} setNewMission={setNewMission} isLoading={isLoading} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl sticky bottom-0 z-20">
                    <button onClick={handleModalClose} disabled={isLoading} className="px-6 py-2.5 rounded-xl text-gray-600 font-bold text-xs hover:bg-gray-200 transition-colors uppercase tracking-wide">Cancelar</button>
                    <button onClick={handleSaveMission} disabled={isLoading || uploading} className="px-8 py-2.5 rounded-xl bg-[#394C97] text-white font-bold shadow-lg hover:bg-[#2a385f] transition-all flex items-center gap-2 text-xs uppercase tracking-wide">
                        {isLoading || uploading ? <Loader size={16} className="animate-spin" /> : null}
                        {isEditing ? "Salvar" : "Criar"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default MissionModal;