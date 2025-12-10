import { ArrowRight, Calendar, List, Clock } from 'lucide-react'; // Importando ícones (necessário instalar: npm install lucide-react)

export default function MissionCard({ mission, onClick }) {
  // Desestruturando os dados da missão para facilitar o uso
  const {
    title,
    category,
    status, // Usado na imagem como "Em Andamento"
    progress, // Já calculamos no Missions.jsx, vamos usar este valor
    deadline,
    totalTasks,
    completedTasks,
  } = mission;

  // Calculando as tarefas para o caso de você querer usar o cálculo localmente (opcional)
  // const calculatedProgress = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div
      className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-300 transform hover:translate-y-[-2px]"
      onClick={onClick}
    >
      {/* Título e Categoria */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-gray-800 pr-2 leading-snug">
          {title}
          {/* Adicionando "..." no final do título se ele for muito longo (como na imagem) */}
          {title.length > 20 ? ' ...' : ''}
        </h2>
        {/* Categoria/Tag no canto superior direito */}
        <span className="bg-blue-100 text-blue-600 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
          {category}
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
            *Prazo:* {deadline}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <List className="w-4 h-4 text-gray-500" />
          <span>
            *Tarefas:* {completedTasks} de {totalTasks} Tarefas
          </span>
        </div>
      </div>

      {/* Botão Ver Tarefas */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button
          className="flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
          onClick={onClick}
        >
          Ver Tarefas →
          {/* O ícone ArrowRight já foi integrado acima, mas pode ser adicionado aqui também se preferir um visual diferente */}
        </button>
      </div>
    </div>
  );
}