import { X, Calendar, List, Clock, CheckCircle } from 'lucide-react';

export default function MissionDetailsModal({ mission, onClose, onCompleteStep }) {
  const {
    title,
    category,
    status,
    progress,
    deadline,
    totalTasks,
    completedTasks,
    description,
    steps,
  } = mission;

  const handleComplete = (stepId, isCompleted) => {
    if (!isCompleted) {
      onCompleteStep(stepId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        
        {/* Cabeçalho */}
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition"
              aria-label="Fechar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex space-x-3 mt-2 text-sm">
            <span className="bg-blue-100 text-blue-600 font-medium px-3 py-1 rounded-full">{category}</span>
            <span className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-1" /> {status}
            </span>
          </div>
        </div>

        {/* Corpo */}
        <div className="p-6">
          <p className="text-gray-700 mb-6">{description}</p>
          
          {/* Progresso */}
          <div className="mb-6 space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Progresso Atual</h3>
            
            <div className="flex justify-between items-center text-sm text-gray-700">
              <span className="font-semibold">Concluído</span>
              <span className="font-bold text-blue-600">{progress}%</span>
            </div>
            
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div
                className="h-2 bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 mt-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>Prazo: {deadline}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
                <List className="w-4 h-4 text-gray-500" />
                <span>Tarefas: {completedTasks} de {totalTasks}</span>
              </div>
            </div>
          </div>
          
          {/* Passos */}
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            Passos da Missão ({completedTasks}/{totalTasks})
          </h3>
          
          <ul className="space-y-3">
            {steps.map((step) => (
              <li
                key={step.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  step.completed ? 'bg-green-50' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span
                  className={`text-base ${
                    step.completed ? 'line-through text-gray-500' : 'text-gray-800'
                  }`}
                >
                  {step.text}
                </span>
                
                <button
                  onClick={() => handleComplete(step.id, step.completed)}
                  disabled={step.completed}
                  className={`flex items-center space-x-1 p-1 rounded-full transition-colors disabled:cursor-default ${
                    step.completed 
                      ? 'text-green-600' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  aria-label={step.completed ? 'Concluído' : 'Marcar como concluído'}
                >
                  {step.completed ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span className="text-sm px-3 py-1">Concluir</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Rodapé */}
        <div className="p-6 pt-4 border-t border-gray-200 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}