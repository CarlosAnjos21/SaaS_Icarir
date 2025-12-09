import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const MissaoDetalhes = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Adiciona o estado de loading para controlar o feedback do botão e evitar cliques duplos
  const [loading, setLoading] = useState(false);

  // Pega os dados enviados pela Home. 
  // Se não houver dados (undefined), usa um objeto vazio para não quebrar.
  const missionData = location.state?.missionData;

  // Função para lidar com o início da missão com lógica de loading e navegação
  const handleStartMission = async () => {
    if (loading) return; // Previne cliques múltiplos
    setLoading(true);

    // Substitui o alert() por console.log() para boas práticas do ambiente
    console.log("Você aceitou a missão em " + (missionData?.cidade || "Desconhecido"));
    
    // Simula um atraso de rede/API de 1.5 segundo
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    setLoading(false);
    // Navega para a área de missões após "aceitar"
    navigate("/missions"); 
  };

  // Obtém as imagens da galeria. Se missionData ou missionData.galeria for undefined, usa um array vazio.
  const galleryImages = missionData?.galeria || [];

  // Se não houver dados (ex: usuário digitou a URL direto), mostra erro ou volta
  if (!missionData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Nenhuma missão selecionada</h2>
        <button
          onClick={() => navigate('/')} // Volta para Home
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
        >
          Voltar para Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="max-w-5xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-xl border border-gray-100 font-sans text-gray-800">
      
          {/* Breadcrumb */}
          <div className="flex items-center text-xs font-bold text-gray-400 mb-6 uppercase tracking-wide">
            <span onClick={() => navigate('/')} className="hover:text-blue-600 cursor-pointer transition-colors">Home</span>
            <span className="mx-2 text-gray-300">&gt;</span>
            <span className="text-blue-800">Detalhes da Missão</span>
          </div>

          {/* Título DINÂMICO */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
            {missionData.titulo} ({missionData.cidade})
          </h1>
          <span className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full mb-6">
              Recompensa: {missionData.pontos} XP
          </span>

          {/* Hero Image */}
          <div
            className="w-full h-72 md:h-96 bg-gray-200 rounded-xl mb-8 bg-cover bg-center shadow-lg"
            style={{ 
                backgroundImage: `url('${missionData.imagem}')`,
                boxShadow: '0 10px 20px -5px rgba(57, 76, 151, 0.4)'
            }}
          ></div>

          {/* Meta Info */}
          <div className="flex items-center gap-3 mb-10 border-b border-gray-100 pb-6">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
              className="w-12 h-12 rounded-full bg-gray-100 object-cover border-4 border-gray-200"
              alt="Avatar"
            />
            <div>
              <h4 className="text-base font-bold text-gray-900 leading-none">Equipe de Operações Icarir</h4>
              <p className="text-sm text-gray-500 mt-1">{missionData.data}</p>
            </div>
          </div>

          {/* Card de Ação (CTA) - ONDE A MUDANÇA FOI IMPLEMENTADA */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 mb-12 shadow-inner">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-12 h-12 min-w-[48px] bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-900 uppercase tracking-wider mb-1">Inicie sua Jornada</h3>
                <p className="text-sm text-gray-600 leading-snug">O relógio começa a correr assim que você aceita a missão.</p>
              </div>
            </div>

            {/* Botão Principal: Agora usa o handleStartMission e o estado loading */}
            <button
              onClick={handleStartMission}
              disabled={loading}
              className={`w-full md:w-auto font-semibold py-3 px-8 rounded-full text-md transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group
                ${loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-[#394C97] hover:bg-[#FE5900] text-white'
                }`}
            >
              {loading ? (
                  <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Iniciando...
                  </span>
                  ) : (
                  <>
                      <span>Aceitar Missão</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </>
              )}
            </button>
          </div>

          {/* Texto Descritivo DINÂMICO */}
          <div className="text-gray-600 text-lg leading-relaxed space-y-6 mb-12">
            <p>
              {missionData.descricao} A <strong className="text-gray-900">Campanha Alpha</strong> surge como a escolha ideal para quem busca acelerar seu desenvolvimento profissional.
            </p>
            <p>
              Esta missão ocupa um papel central na nossa estratégia trimestral e reúne uma série de desafios práticos em <strong>{missionData.cidade}</strong>, quiz de conhecimento e tarefas de engajamento social.
            </p>
            <p>
              Descubra o prazer de superar seus limites. Ao concluir todas as etapas, você acumula <strong>{missionData.pontos} pontos</strong> valiosos.
            </p>
          </div>

          {/* SEÇÃO DE GALERIA - AGORA DINÂMICA */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-3 border-b pb-2">Ambiente da Missão</h2>
            <p className="text-md text-gray-500 mb-6 max-w-2xl">
              Uma prévia dos locais e desafios que você encontrará em <strong>{missionData.cidade}</strong>.
            </p>

            {/* AQUI ESTÁ A GALERIA */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {galleryImages.map((src, index) => (
                <div key={index} className="overflow-hidden rounded-xl h-32 bg-gray-200 shadow-md">
                  <img
                    src={`${src}?auto=format&fit=crop&w=300&h=300&q=80`}
                    alt={`Galeria de ${missionData.cidade} - ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  </div>
              ))}
            </div>

            <ul className="space-y-3 text-base text-gray-600 border-t pt-6">
              <li className="flex items-start"><span className="mr-3 font-bold text-blue-400">→</span><span><strong className="text-gray-900">Recompensa Máxima:</strong> {missionData.pontos} Pontos de experiência e medalha de ouro.</span></li>
              <li className="flex items-start"><span className="mr-3 font-bold text-blue-400">→</span><span><strong className="text-gray-900">Prazo de Conclusão:</strong> 7 dias após o início.</span></li>
              <li className="flex items-start"><span className="mr-3 font-bold text-blue-400">→</span><span><strong className="text-gray-900">Requisito Básico:</strong> Onboarding completo e Nível 5 de conta.</span></li>
            </ul>
          </div>
      </div>
    </div>
  );
};

export default MissaoDetalhes;