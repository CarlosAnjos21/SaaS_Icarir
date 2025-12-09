// src/components/missions/MissionCard.jsx

import { ArrowRight, Calendar, List, Clock } from 'lucide-react';

export default function MissionCard({ mission, onClick }) {
  // Os dados já vêm normalizados do componente Missions.jsx
  const {
    title,
    category,
    status,
    progress,
    deadline,
    totalTasks,
    completedTasks,
  } = mission;

  return (
    <div
      className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-300 transform hover:translate-y-[-2px]"
      onClick={onClick}
    >
      {/* Título e Categoria */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-gray-800 pr-2 leading-snug">
          {title}
          {title && title.length > 20 ? ' ...' : ''}
        </h2>
        {/* Categoria/Tag no canto superior direito */}
        <span className="bg-blue-100 text-blue-600 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
          {category || 'Geral'}
        </span>
      </div>

      {/* Status e Progresso */}
      <div className="flex justify-between items-center mb-2 text-sm text-gray-700">
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="font-semibold">{status}</span>
        </div>
        <span className="font-bold text-gray-800">{progress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2 rounded-full mb-3">
        <div
          className="h-2 bg-blue-600 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Detalhes: Prazo e Tarefas */}
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>
            **Prazo:** {deadline || 'Não definido'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <List className="w-4 h-4 text-gray-500" />
          <span>
            **Tarefas:** {completedTasks} de {totalTasks} Tarefas
          </span>
        </div>
      </div>

      {/* Botão Ver Tarefas */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button
          className="flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
          onClick={onClick}
        >
          Ver Tarefas <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}