import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

// Retornando ao componente externo conforme solicitado
import Navbar from "../components/Navbar"; 

import HomeCard from "../components/HomeCard";
import FeedbackBar from "../components/Feedbacks/FeedbackBar";

// --- IMPORTS DE IMAGENS ---
import bannerImg from "../assets/airport.jpg";
import logoIcarir from "../assets/símbolo-icarir.png";
import aircraftImg from "../assets/aircraft.jpg";
import christmasImg from "../assets/merry-christmas.jpg";

// --- DADOS ---
const GALERIA_PADRAO = [
  'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1518639192441-8fce0a366e2e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=300&q=80'
];

const DADOS_DAS_MISSOES = {
  "São Paulo, SP": {
    titulo: "O Coração Financeiro",
    pontos: 5000,
    descricao: "Explore a Faria Lima e visite o Cubo Itaú, o maior hub de empreendedorismo tecnológico da América Latina.",
    data: "Evento: Tech Week SP",
    imagem: 'https://images.unsplash.com/photo-1543059080-f9b1272213d5?auto=format&fit=crop&w=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1578308148355-6e1b5300f16f', // Ponte Estaiada
      'https://images.unsplash.com/photo-1565259160565-d6023d837682', // Paulista
      'https://images.unsplash.com/photo-1629906646540-30b6515822b3', // Beco do Batman
      'https://images.unsplash.com/photo-1598971861713-54ad1635092e'  // Ibirapuera
    ]
  },
  "Florianópolis, SC": {
    titulo: "Ilha do Silício",
    pontos: 4500,
    descricao: "Conecte-se com startups inovadoras na ACATE e aproveite o equilíbrio perfeito entre tecnologia e natureza.",
    data: "Summit Floripa",
    imagem: 'https://images.unsplash.com/photo-1543425028-2b50935560b4?auto=format&fit=crop&w=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1620835928189-6cb8f12a32c6',
      'https://images.unsplash.com/photo-1589406733221-5f25979c1377',
      'https://images.unsplash.com/photo-1564344406232-23c2a053229b',
      'https://images.unsplash.com/photo-1533630248882-628468728d8c'
    ]
  },
  "Recife, PE": {
    titulo: "Porto Digital",
    pontos: 6000,
    descricao: "Visite um dos principais parques tecnológicos e ambientes de inovação do Brasil, situado no centro histórico.",
    data: "Mangue.Bit Conference",
    imagem: 'https://images.unsplash.com/photo-1588619472312-326938cb46c5?auto=format&fit=crop&w=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1574510444569-450f789d7b42',
      'https://images.unsplash.com/photo-1622314546416-834f9a0c72c2',
      'https://images.unsplash.com/photo-1576778460596-f6d2b6389774',
      'https://images.unsplash.com/photo-1561054366-22a84d284379'
    ]
  },
  "Rio de Janeiro, RJ": {
    titulo: "Inovação Carioca",
    pontos: 5500,
    descricao: "Participe do Web Summit Rio e conheça o ecossistema de startups no Porto Maravalha e Fábrica de Startups.",
    data: "Web Summit Rio",
    imagem: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1483729558449-99ef09a8c325',
      'https://images.unsplash.com/photo-1518639192441-8fce0a366e2e',
      'https://images.unsplash.com/photo-1596482188090-67c4c4786d16',
      'https://images.unsplash.com/photo-1565538183759-33511eb0c0a9'
    ]
  },
  "Belo Horizonte, MG": {
    titulo: "San Pedro Valley",
    pontos: 4800,
    descricao: "Explore a comunidade de startups de Minas Gerais, famosa por sua hospitalidade e crescimento acelerado.",
    data: "FIRE Festival",
    imagem: 'https://images.unsplash.com/photo-1563276686-2a6c3818e692?auto=format&fit=crop&w=800&q=80',
    galeria: GALERIA_PADRAO
  },
  "Brasília, DF": {
    titulo: "GovTech Capital",
    pontos: 5200,
    descricao: "Descubra oportunidades no setor público e GovTechs, conectando-se com decisores no coração do país.",
    data: "Semana de Inovação",
    imagem: 'https://images.unsplash.com/photo-1555523722-1d2272449297?auto=format&fit=crop&w=800&q=80',
    galeria: GALERIA_PADRAO
  },
  "Curitiba, PR": {
    titulo: "Cidade Inteligente",
    pontos: 4700,
    descricao: "Conheça o Vale do Pinhão e veja como Curitiba se tornou referência mundial em Smart Cities e urbanismo.",
    data: "Smart City Expo",
    imagem: 'https://images.unsplash.com/photo-1566804576369-02c310c14b30?auto=format&fit=crop&w=800&q=80',
    galeria: GALERIA_PADRAO
  },
  "Fortaleza, CE": {
    titulo: "Ventos de Inovação",
    pontos: 4600,
    descricao: "Explore o hub tecnológico do Nordeste, com foco em energias renováveis e o ecossistema Rapadura Valley.",
    data: "Investe Nordeste",
    imagem: 'https://images.unsplash.com/photo-1549247796-0d12eb2243d7?auto=format&fit=crop&w=800&q=80',
    galeria: GALERIA_PADRAO
  },
  "Manaus, AM": {
    titulo: "Bioeconomia na Amazônia",
    pontos: 6500,
    descricao: "Imersão em sustentabilidade e biotecnologia no coração da floresta. Conheça o Polo Industrial e startups verdes.",
    data: "Jungle Tech",
    imagem: 'https://images.unsplash.com/photo-1622314643093-6a9876e625a6?auto=format&fit=crop&w=800&q=80',
    galeria: GALERIA_PADRAO
  },
  "Salvador, BA": {
    titulo: "Axé e Criatividade",
    pontos: 5000,
    descricao: "Descubra o potencial da economia criativa e turismo inteligente na primeira capital do Brasil.",
    data: "Salvador Creativity",
    imagem: 'https://images.unsplash.com/photo-1518182170546-0766ca6af38e?auto=format&fit=crop&w=800&q=80',
    galeria: GALERIA_PADRAO
  },
  "Gramado, RS": {
    titulo: "Turismo de Experiência",
    pontos: 4300,
    descricao: "Aprenda com os melhores cases de turismo e hotelaria do Brasil na Serra Gaúcha.",
    data: "Festuris",
    imagem: 'https://images.unsplash.com/photo-1627918881267-3330682855b7?auto=format&fit=crop&w=800&q=80',
    galeria: GALERIA_PADRAO
  },
  "Foz do Iguaçu, PR": {
    titulo: "Fronteiras da Inovação",
    pontos: 5800,
    descricao: "Conecte-se com o ecossistema trinacional e visite o Parque Tecnológico Itaipu (PTI).",
    data: "Iguassu Valley",
    imagem: 'https://images.unsplash.com/photo-1579979372132-72149b049d5a?auto=format&fit=crop&w=800&q=80',
    galeria: GALERIA_PADRAO
  }
};

const destinations = [
  { id: 1, city: "São Paulo, SP", image: DADOS_DAS_MISSOES["São Paulo, SP"].imagem },
  { id: 2, city: "Rio de Janeiro, RJ", image: DADOS_DAS_MISSOES["Rio de Janeiro, RJ"].imagem },
  { id: 3, city: "Florianópolis, SC", image: DADOS_DAS_MISSOES["Florianópolis, SC"].imagem },
  { id: 4, city: "Recife, PE", image: DADOS_DAS_MISSOES["Recife, PE"].imagem },
  { id: 5, city: "Belo Horizonte, MG", image: DADOS_DAS_MISSOES["Belo Horizonte, MG"].imagem },
  { id: 6, city: "Brasília, DF", image: DADOS_DAS_MISSOES["Brasília, DF"].imagem },
  { id: 7, city: "Curitiba, PR", image: DADOS_DAS_MISSOES["Curitiba, PR"].imagem },
  { id: 8, city: "Fortaleza, CE", image: DADOS_DAS_MISSOES["Fortaleza, CE"].imagem },
  { id: 9, city: "Manaus, AM", image: DADOS_DAS_MISSOES["Manaus, AM"].imagem },
  { id: 10, city: "Salvador, BA", image: DADOS_DAS_MISSOES["Salvador, BA"].imagem },
  { id: 11, city: "Gramado, RS", image: DADOS_DAS_MISSOES["Gramado, RS"].imagem },
  { id: 12, city: "Foz do Iguaçu, PR", image: DADOS_DAS_MISSOES["Foz do Iguaçu, PR"].imagem },
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // --- EFEITOS (AOS, Scroll) ---
  useEffect(() => {
    // 🌟 Rola a página para o topo ao carregar o componente
    window.scrollTo(0, 0); 
    
    AOS.init({ duration: 800, once: false });
    AOS.refresh();

    // Carrossel Automático
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % 3);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const iniciarMissao = (city) => {
    const dadosEspecificos = DADOS_DAS_MISSOES[city];
    const dadosParaEnviar = dadosEspecificos ? {
      ...dadosEspecificos,
      galeria: dadosEspecificos.galeria || GALERIA_PADRAO
    } : {
      titulo: `Conexões em ${city}`,
      pontos: 2000,
      descricao: `Expanda sua rede de contatos e descubra oportunidades de negócios únicas em ${city}.`,
      data: "Missão Corporativa",
      imagem: destinations.find(d => d.city === city)?.image,
      galeria: GALERIA_PADRAO
    };
    dadosParaEnviar.cidade = city;
    navigate('/missao-detalhes', { state: { missionData: dadosParaEnviar } });
  };

  const carouselImages = [bannerImg, aircraftImg, christmasImg];
  const prevSlide = () => setCurrentIndex((prev) => prev === 0 ? carouselImages.length - 1 : prev - 1);
  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % carouselImages.length);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      
      {/* Componente Navbar Externo */}
      <Navbar />

      {/* --- BANNER PRINCIPAL (Apenas Visual) --- */}
      <div className="relative h-[600px] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          {carouselImages.map((img, index) => (
            <img 
              key={index} 
              src={img} 
              alt="Slide" 
              className={`absolute w-full h-full object-cover scale-105 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-100" : "opacity-0"}`} 
              style={{ zIndex: index === currentIndex ? 1 : 0 }} 
            />
          ))}
        </div>
        
        {/* Gradiente sutil para acabamento */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#394C97]/30 via-transparent to-gray-50 z-10"></div>
        
        {/* Controles do Slider (Mantidos para navegação visual) */}
        <button onClick={prevSlide} className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/30 backdrop-blur-md text-white p-3 rounded-full transition z-30 border border-white/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={nextSlide} className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/30 backdrop-blur-md text-white p-3 rounded-full transition z-30 border border-white/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* --- SEÇÃO DE DESTINOS PARA EMPREENDEDORES (BRASIL) --- */}
      <section className="relative max-w-[1800px] mx-auto py-16 px-6 z-20 -mt-24">
        <img src={logoIcarir} alt="Bg" className="absolute inset-0 w-full h-full object-contain opacity-[0.03] pointer-events-none" />
        
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl mb-12 relative z-10 max-w-4xl mx-auto text-center border border-gray-100">
          <span className="text-[#FE5900] font-bold uppercase tracking-widest text-sm">Expandir Horizontes</span>
          <h2 className="text-3xl md:text-5xl font-bold text-[#394C97] mt-2">Destinos para Empreendedores</h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Descubra ecossistemas de inovação, feche negócios e participe de missões exclusivas nas cidades mais dinâmicas do nosso país.
          </p>
          <div className="w-24 h-1.5 bg-[#FE5900] mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 relative z-10">
          {destinations.map((dest) => (
            <HomeCard
              key={dest.id}
              city={dest.city}
              image={dest.image}
              onStartMission={() => iniciarMissao(dest.city)}
              loading={false}
              animation="fade-up"
            />
          ))}
        </div>
      </section>

      <FeedbackBar />
    </div>
  );
}