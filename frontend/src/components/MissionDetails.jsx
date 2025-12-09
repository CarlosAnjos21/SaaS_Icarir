import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "../components/Navbar";
import { Briefcase, MapPin, Clock, Trophy } from "lucide-react";

export default function MissionDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const mission = location.state?.missionData;

  // 1. Redirecionamento e Inicialização do AOS
  useEffect(() => {
    if (!mission) navigate("/");
    
    // **🌟 MUDANÇA PRINCIPAL AQUI: Rola para o topo ao carregar a página.**
    window.scrollTo(0, 0); 
    
    AOS.init({ 
      duration: 900, 
      once: false, 
      offset: 50 
    }); 
    
    AOS.refresh();

  }, [mission, navigate]); // Dependências garantem que o efeito roda ao entrar na página

  if (!mission) return null;

  // Formatação da data (Exemplo: 04 de Dezembro de 2025)
  const formatDate = (dateString) => {
    if (!dateString) return "Disponível imediatamente";
    try {
      return new Date(dateString).toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formattedDate = formatDate(mission.data);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      {/* Hero Section (Banner mais impactante) */}
      <div className="relative w-full h-[500px] md:h-[550px] overflow-hidden">
        <img
          src={mission.imagem}
          alt={mission.titulo}
          className="absolute w-full h-full object-cover grayscale brightness-[0.7] transition duration-500 hover:brightness-[0.8]"
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute inset-0 flex items-end pb-16 px-6 md:px-20 text-white z-10" data-aos="fade-down" data-aos-delay="200">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight shadow-text">
              {mission.titulo}
            </h1>
            <p className="text-xl md:text-2xl font-light mt-4 opacity-95">
              Oportunidade de pontuação máxima em **{mission.cidade}**
            </p>
            <div className="flex items-center gap-4 mt-4 text-lg">
              <Trophy className="w-6 h-6 text-[#FE5900]" />
              <span className="font-semibold text-xl">
                Até {mission.pontos.toLocaleString()} Pontos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal com Layout de 2 Colunas (Desktop) */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Coluna Principal: Descrição e Galeria */}
          <div className="lg:col-span-2">
            {/* Seção 1: Descrição e CTA (Top) */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#394C97] mb-4" data-aos="fade-up">
                Visão Geral da Missão
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed" data-aos="fade-up" data-aos-delay="100">
                {mission.descricao}{" "}
                Maximize seu desempenho, expanda seus contatos e gere um impacto profissional duradouro.
              </p>
            </div>

            {/* CTA/Alerta - Fixo no topo e mais profissional */}
            <div className="sticky top-0 bg-white border-y border-blue-200 px-6 py-4 rounded-xl shadow-lg flex flex-col md:flex-row items-center justify-between mb-12 z-20" data-aos="zoom-in">
              <p className="font-semibold text-xl text-blue-800 mb-3 md:mb-0">
                Pronto para a Missão?
              </p>
              <button
                onClick={() => alert("Missão iniciada!")}
                className="w-full md:w-auto bg-[#394C97] hover:bg-blue-700 text-white px-8 py-3 rounded-full transition duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg font-bold uppercase tracking-wider"
              >
                <Briefcase className="inline w-5 h-5 mr-2" /> Iniciar Missão
              </button>
            </div>


            {/* Seção 2: Imagens de Suporte (Galeria) */}
            <h3 className="text-2xl font-bold text-gray-700 mb-6 border-b pb-2" data-aos="fade-up">
              Galeria de Apoio
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {mission.galeria?.slice(0, 4).map((img, index) => ( // Limita a 4 imagens para layout
                <img
                  key={index}
                  src={`${img}?auto=format&fit=crop&w=400&h=200&q=75`} // Otimiza o carregamento da imagem
                  alt={`Galeria Imagem ${index + 1}`}
                  className="h-40 w-full object-cover rounded-xl shadow-xl transition duration-300 hover:shadow-2xl hover:scale-[1.03] cursor-pointer"
                  data-aos="fade-up"
                  data-aos-delay={index * 150}
                />
              ))}
            </div>
            
            {/* Seção 3: Regras e Guias (Se necessário) */}
            <h3 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-2" data-aos="fade-up">
              Compromisso e Requisitos
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-6" data-aos="fade-up" data-aos-delay="100">
                Para o sucesso completo desta missão, é essencial seguir rigorosamente o guia de procedimentos. A pontuação é diretamente ligada à qualidade e veracidade das evidências fornecidas.
            </p>

            <ul className="space-y-4 text-gray-800 text-lg list-disc list-inside px-4">
                <li data-aos="fade-up" data-aos-delay="200">
                    <strong className="text-[#394C97]">Regras de Evidência:</strong> Use somente os métodos de coleta e formatos de evidências solicitados.
                </li>
                <li data-aos="fade-up" data-aos-delay="300">
                    <strong className="text-[#394C97]">Guia Completo:</strong> O <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Guia Operacional (PDF)</span> detalhado é disponibilizado no Painel da Missão após o início.
                </li>
            </ul>

          </div>

          {/* Coluna Lateral: Metadados e Especificações */}
          <div className="lg:col-span-1">
            {/* Bloco de Detalhes da Missão (Ficha Técnica) */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl border border-gray-100" data-aos="fade-left">
              <h3 className="text-xl font-bold text-[#394C97] mb-6 flex items-center">
                <Briefcase className="w-6 h-6 mr-3 text-[#FE5900]" />
                Ficha Técnica
              </h3>
              
              <ul className="space-y-5 text-gray-800 text-base">
                <li className="flex items-center" data-aos="fade-left" data-aos-delay="100">
                  <Trophy className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-semibold">Recompensa Máxima:</p>
                    <p className="text-gray-600">
                      {mission.pontos.toLocaleString()} pontos de Rank Global
                    </p>
                  </div>
                </li>
                <li className="flex items-center" data-aos="fade-left" data-aos-delay="200">
                  <MapPin className="w-5 h-5 text-red-500 mr-3" />
                  <div>
                    <p className="font-semibold">Local de Operação:</p>
                    <p className="text-gray-600">{mission.cidade}</p>
                  </div>
                </li>
                <li className="flex items-center" data-aos="fade-left" data-aos-delay="300">
                  <Clock className="w-5 h-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-semibold">Prazo Estimado:</p>
                    <p className="text-gray-600">Curta Duração - Ideal para planejamento rápido</p>
                  </div>
                </li>
              </ul>
            </div>
            
            {/* Box de Autor/Publicação */}
            <div className="mt-8 p-6 bg-gray-100 rounded-xl border border-gray-200" data-aos="fade-left" data-aos-delay="400">
              <p className="text-sm uppercase font-semibold text-gray-500 mb-3">Publicado por</p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#394C97] flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg">
                  OP
                </div>
                <div>
                  <p className="font-bold text-lg">Equipe de Operações Estratégicas</p>
                  <p className="text-sm text-gray-500">
                    Publicado em: {formattedDate}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Rodapé - Opcional */}
      <footer className="bg-gray-800 text-white text-center py-6 mt-12">
        <p className="text-sm">&copy; {new Date().getFullYear()} Plataforma de Missões. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}