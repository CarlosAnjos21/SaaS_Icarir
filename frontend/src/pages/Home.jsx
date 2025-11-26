import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

import Navbar from "../components/Navbar";
import HomeCard from "../components/HomeCard";
import FeedbackBar from "../components/Feedbacks/FeedbackBar";

// --- IMPORTS DE IMAGENS ---
import bannerImg from "../assets/airport.jpg";
import logoIcarir from "../assets/símbolo-icarir.png";
import aircraftImg from "../assets/aircraft.jpg";
import christmasImg from "../assets/merry-christmas.jpg";

// Destinos
import parisImg from "../assets/destinations/paris.jpg";
import tokyoImg from "../assets/destinations/tokyo.jpg";
import newyorkImg from "../assets/destinations/new-york.jpg";
import londonImg from "../assets/destinations/london.jpg";
import romeImg from "../assets/destinations/rome.jpg";
import dubaiImg from "../assets/destinations/dubai.jpg";
import sydneyImg from "../assets/destinations/sydney.jpg";
import rioImg from "../assets/destinations/rio-de-janeiro.jpg";
import capetownImg from "../assets/destinations/cape-town.jpg";
import bangkokImg from "../assets/destinations/bangkok.jpg";
import barcelonaImg from "../assets/destinations/barcelona.jpg";
import torontoImg from "../assets/destinations/toronto.jpg";


// --- GALERIA PADRÃO PARA MISSÕES GENÉRICAS (Fallback) ---
const GALERIA_PADRAO = [
  'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=300&q=80'
];


// --- BANCO DE DADOS DE CONTEÚDO (Com a propriedade 'galeria' adicionada) ---
const DADOS_DAS_MISSOES = {
  "Paris": {
    titulo: "O Segredo da Torre Eiffel",
    pontos: 5000,
    descricao: "Explore as ruas românticas de Paris e encontre os 3 cadeados dourados escondidos nas pontes do Sena. Uma jornada de mistério e romance.",
    data: "Evento Especial: Fim de Semana",
    imagem: parisImg,
    galeria: [
      'https://images.unsplash.com/photo-1511739001486-fe63a1372b64', // Rua
      'https://images.unsplash.com/photo-1543349688-66236b2880c1', // Museu
      'https://images.unsplash.com/photo-1502602898624-9bc0a48b7d2f', // Torre
      'https://images.unsplash.com/photo-1534351332831-29e1d8825878' // Café
    ]
  },
  "Tokyo": {
    titulo: "Cyberpunk Night Run",
    pontos: 8500,
    descricao: "Uma corrida contra o tempo nas ruas iluminadas de neon em Akihabara. Colete os chips de dados antes que a bateria do seu drone acabe.",
    data: "Disponível por 24h",
    imagem: tokyoImg,
    galeria: [
      'https://images.unsplash.com/photo-1540959733332-eab4de6013cb',
      'https://images.unsplash.com/photo-1534305370258-062e7c3a0b38',
      'https://images.unsplash.com/photo-1503891450247-ee598a798936',
      'https://images.unsplash.com/photo-1550998811-fb05a5a1f0a1'
    ]
  },
  "New York": {
    titulo: "A Conquista de Manhattan",
    pontos: 4200,
    descricao: "Suba no topo do Empire State e tire a foto perfeita do pôr do sol. Em seguida, corra para o Central Park para o desafio de resistência.",
    data: "Missão Permanente",
    imagem: newyorkImg,
    galeria: [
      'https://images.unsplash.com/photo-1500908880628-98e945c8509e',
      'https://images.unsplash.com/photo-1534430480872-358049bb7e7e',
      'https://images.unsplash.com/photo-1530912170669-03a1f819f71c',
      'https://images.unsplash.com/photo-1516086817283-bc2a2e46b0a1'
    ]
  },
  "Rio de Janeiro": {
    titulo: "Desafio do Cristo Redentor",
    pontos: 6000,
    descricao: "Suba a trilha secreta até o Cristo e descubra a vista mais bonita do mundo. Recompensa extra para quem completar em menos de 1 hora.",
    data: "Evento de Verão",
    imagem: rioImg,
    galeria: [
      'https://images.unsplash.com/photo-1521487673516-ec8d752c040d',
      'https://images.unsplash.com/photo-1534608779901-d779a55231c5',
      'https://images.unsplash.com/photo-1534240778949-c12e52b2b1ff',
      'https://images.unsplash.com/photo-1549429712-ae3ac3f0e7d5'
    ]
  },
};

const destinations = [
  { id: 1, city: "Paris", image: parisImg },
  { id: 2, city: "Tokyo", image: tokyoImg },
  { id: 3, city: "New York", image: newyorkImg },
  { id: 4, city: "London", image: londonImg },
  { id: 5, city: "Rome", image: romeImg },
  { id: 6, city: "Dubai", image: dubaiImg },
  { id: 7, city: "Sydney", image: sydneyImg },
  { id: 8, city: "Rio de Janeiro", image: rioImg },
  { id: 9, city: "Cape Town", image: capetownImg },
  { id: 10, city: "Bangkok", image: bangkokImg },
  { id: 11, city: "Barcelona", image: barcelonaImg },
  { id: 12, city: "Toronto", image: torontoImg },
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 800, once: false });
    AOS.refresh();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- FUNÇÃO INTELIGENTE QUE SELECIONA O CONTEÚDO E PASSA A GALERIA ---
  const iniciarMissao = (city) => {
    // 1. Procura se temos dados personalizados para essa cidade
    const dadosEspecificos = DADOS_DAS_MISSOES[city];

    // 2. Monta o pacote de dados. Se não tiver dados específicos, usa o genérico
    const dadosParaEnviar = dadosEspecificos ? {
      // Se houver dados específicos, espalha eles.
      ...dadosEspecificos,
      // Garante que a galeria específica seja usada.
      galeria: dadosEspecificos.galeria || GALERIA_PADRAO
    } : {
      titulo: `Expedição em ${city}`,
      pontos: 2000,
      descricao: `Prepare-se para explorar ${city} e completar desafios incríveis para subir no ranking global da Icarir.`,
      data: "Missão Padrão",
      imagem: destinations.find(d => d.city === city)?.image,
      // Para missões genéricas, usa a galeria padrão.
      galeria: GALERIA_PADRAO
    };

    // 3. Adiciona o nome da cidade garantido
    dadosParaEnviar.cidade = city;

    // 4. Navega enviando o pacote pronto
    navigate('/missao-detalhes', { state: { missionData: dadosParaEnviar } });
  };

  const carouselImages = [bannerImg, aircraftImg, christmasImg];

  const prevSlide = () => setCurrentIndex((prev) => prev === 0 ? carouselImages.length - 1 : prev - 1);
  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % carouselImages.length);

  return (
    <div className="min-h-screen bg-background text-dark transition-colors duration-300">
      <Navbar />

      {/* Banner */}
      <div className="relative h-[900px] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          {carouselImages.map((img, index) => (
            <img key={index} src={img} alt="Slide" className={`absolute w-full h-full object-cover scale-105 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-100" : "opacity-0"}`} style={{ zIndex: index === currentIndex ? 1 : 0 }} />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-transparent to-background z-10"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 z-20">
          {/* TEXTO DO BANNER TRADUZIDO */}
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">Explore o Mundo</h1>
          <p className="text-xl md:text-2xl font-light">Complete missões e ganhe recompensas no seu próximo voo</p>
          <div className="mt-6 flex justify-center gap-4">
            {/* BOTÕES TRADUZIDOS */}
            <button className="border border-transparent border-2 bg-accent text-white px-6 py-2 rounded-full hover:bg-primary hover:text-white transition font-semibold">Começar Agora</button>
            <button className="border border-primary border-2 px-6 py-2 rounded-full text-white hover:bg-primary hover:border-transparent hover:text-background transition font-semibold">Saiba Mais</button>
          </div>
        </div>
        {/* Botões slider */}
        <button onClick={prevSlide} className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-white/20 active:bg-transparent text-primary hover:text-dark p-3 rounded-full shadow-md transition duration-300 z-30"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
        <button onClick={nextSlide} className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-white/20 active:bg-transparent text-primary hover:text-dark p-3 rounded-full shadow-md transition duration-300 z-30"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
      </div>

      {/* Cards de Destino */}
      <section className="relative max-w-[1800px] mx-auto py-[120px] px-6">
        <img src={logoIcarir} alt="Bg" className="absolute inset-0 w-full h-full object-contain opacity-5 pointer-events-none" />
        {/* TÍTULO DA SEÇÃO TRADUZIDO */}
        <h2 className="text-4xl font-bold text-primary mb-10 text-center relative z-10">Escolha Seu Destino</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 relative z-10">
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