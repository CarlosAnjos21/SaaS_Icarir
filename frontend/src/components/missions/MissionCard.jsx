import React from 'react';
import { Calendar, MapPin, CheckCircle, Lock, Trophy, Award } from 'lucide-react';

const MissionCard = ({ mission, onClick }) => {
    // CORREÇÃO: Garante que a imagem seja encontrada independente do nome da propriedade
    const displayImage = mission.image || mission.imageUrl || mission.foto_url;

    const { 
        title, 
        category, 
        deadline, 
        progress = 0, 
        isJoined,
        points 
    } = mission;

    return (
        <div 
            onClick={onClick}
            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer group overflow-hidden flex flex-col h-full relative"
        >
            {/* Área da Imagem de Capa */}
            <div className="h-44 w-full relative bg-gray-100 overflow-hidden">
                {displayImage ? (
                    <img 
                        src={displayImage} 
                        alt={title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    // Fallback visual apenas se não houver URL de imagem definida
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-200">
                        <MapPin size={48} />
                    </div>
                )}

                {/* Badge de Status (Inscrito/Disponível) */}
                <div className="absolute top-3 right-3 z-10">
                    {isJoined ? (
                        <span className="bg-green-100/95 backdrop-blur text-green-700 text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1 border border-green-200">
                            <CheckCircle size={10} /> PARTICIPANDO
                        </span>
                    ) : (
                        <span className="bg-gray-900/70 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1 border border-white/20">
                            <Lock size={10} /> DISPONÍVEL
                        </span>
                    )}
                </div>

                 {/* Badge de Pontos */}
                 <div className="absolute bottom-3 left-3 z-10">
                     <span className="bg-white/90 backdrop-blur text-[#FE5900] text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                        <Award size={10} /> {points || 0} XP
                     </span>
                 </div>
            </div>

            {/* Conteúdo do Card */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="mb-2">
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md uppercase tracking-wide">
                        {category || 'Geral'}
                    </span>
                </div>

                <h3 className="text-lg font-bold text-gray-800 line-clamp-2 group-hover:text-[#394C97] transition-colors mb-2">
                    {title}
                </h3>

                {/* Barra de Progresso (se inscrito) ou Data (se não inscrito) */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                    {isJoined ? (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-500 font-medium">
                                <span>Progresso</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-[#394C97] rounded-full transition-all duration-500" 
                                    style={{ width: `${progress}%` }} 
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center text-xs text-gray-400 font-medium">
                            <Calendar size={12} className="mr-1.5" /> 
                            Expira em: {deadline || 'Sem prazo'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MissionCard;