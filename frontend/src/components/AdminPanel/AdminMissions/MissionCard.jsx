// src/components/AdminPanel/AdminMissions/MissionCard.jsx

import React from 'react';
import { Edit, Trash2, Calendar, MapPin, Briefcase } from 'lucide-react';

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
                <p className="flex items-center gap-1">{(mission.preco !== undefined && mission.preco !== null) ? `R$ ${Number(mission.preco).toFixed(2)}` : 'R$ —'}</p>
                <p className="flex items-center gap-1">{(mission.vagas_disponiveis !== undefined && mission.vagas_disponiveis !== null) ? `${mission.vagas_disponiveis} vagas` : '— vagas'}</p>
            </div>
            
            <ul className="mt-4 space-y-1 text-sm text-gray-700 p-3 bg-gray-50 rounded">
                <p className="font-semibold mb-1 flex items-center gap-2"><Briefcase size={16} /> Etapas ({mission.steps.length})</p>
                {/* Mostra apenas as 2 primeiras etapas para a visualização */}
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

export default MissionCard;