import { useEffect, useState } from "react";

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    fetch("/data/quizzes.json")
      .then((res) => res.json())
      .then((data) => setQuestions(data))
      .catch((err) => console.error("Erro ao carregar quiz:", err));
  }, []);

  const handleSelect = (index) => {
    if (!confirmed) setSelected(index);
  };

  const handleConfirm = () => {
    if (selected !== null) setConfirmed(true);
  };

  const handleNext = () => {
    setSelected(null);
    setConfirmed(false);
    setCurrent((prev) => prev + 1);
  };

  if (questions.length === 0)
    return <p className="text-center mt-10 text-base">Carregando quiz...</p>;

  const q = questions[current];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-screen-sm bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Quiz Interativo
        </h2>

        <div className="mb-6">
          <p className="text-lg font-medium text-gray-700 mb-4">
            {current + 1}. {q.question}
          </p>

          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none
                  ${
                    selected === i
                      ? "bg-white text-orange hover:bg-gray-100"
                      : "bg-gray-200 hover:bg-gray-300"
                  }
                  ${confirmed ? "cursor-not-allowed opacity-90" : "cursor-pointer"}
                `}
                disabled={confirmed}
              >
                {opt}
              </button>
            ))}
          </div>

          {!confirmed ? (
            <button
              onClick={handleConfirm}
              disabled={selected === null}
              className="mt-6 w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
            >
              Confirmar Resposta
            </button>
          ) : (
            <div className="mt-6">
              <p
                className={`text-base italic ${
                  selected === q.answer ? "text-green-600" : "text-red-600"
                }`}
              >
                {selected === q.answer ? "✅ Correto!" : "❌ Incorreto."}{" "}
                {q.explanation}
              </p>

              {current < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="mt-4 w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  Próxima Pergunta
                </button>
              ) : (
                <p className="mt-4 text-center font-semibold text-purple-600">
                  🎉 Fim do quiz!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}