import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import Navbar from "../components/Navbar";
import HomeCard from "../components/HomeCard";
import FeedbackBar from "../components/Feedbacks/FeedbackBar";

import bannerImg from "../assets/airport.jpg";
import logoIcarir from "../assets/logo_icarir.png";
import api from "../api/api";

// Imagens dos destinos
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
  const [loadingCity, setLoadingCity] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const iniciarMissao = async (city) => {
    setLoadingCity(city);
    try {
      const res = await api.get(`/missions/by-destination/${city}`);
      const missao = res.data[0];
      if (missao) {
        alert(`Missão iniciada: ${missao.title} (+${missao.pontos} pontos)`);
      } else {
        alert("Nenhuma missão disponível para esse destino.");
      }
    } catch (err) {
      console.error("Erro ao iniciar missão:", err);
      alert("Erro ao conectar com o servidor.");
    } finally {
      setLoadingCity(null);
    }
  };

  const carouselImages = [bannerImg, parisImg, tokyoImg];

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
  };

  return (
    <div className="min-h-screen bg-white text-black transition-colors duration-300">
      <Navbar />

      <div className="relative h-[900px] overflow-hidden">
        {/* Camada das imagens */}
        <div className="absolute top-0 left-0 w-full h-full">
          {carouselImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Slide ${index}`}
              className={`absolute w-full h-full object-cover scale-105 transition-opacity duration-1000 ease-in-out ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
              style={{
                transitionProperty: "opacity",
                zIndex: index === currentIndex ? 1 : 0,
              }}
            />
          ))}
        </div>

        {/* Gradiente e conteúdo fixo */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#394C97]/60 via-transparent to-white z-10"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 z-20">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">
            Explore the World
          </h1>
          <p className="text-xl md:text-2xl font-light">
            Complete missions and earn rewards on your next flight
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button className="bg-orange text-white px-6 py-2 rounded-full hover:bg-white hover:text-orange transition font-semibold">
              Start Now
            </button>
            <button className="border border-white px-6 py-2 rounded-full text-white hover:bg-white hover:text-[#394C97] transition font-semibold">
              Learn More
            </button>
          </div>
        </div>

        {/* Botões de navegação */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-white/20 active:bg-transparent text-[#394C97] hover:text-black p-3 rounded-full shadow-md transition duration-300 z-30"
          aria-label="Previous Slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-white/20 active:bg-transparent text-[#394C97] hover:text-black p-3 rounded-full shadow-md transition duration-300 z-30"
          aria-label="Next Slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Cards de destinos com efeito AOS */}
      <section className="relative max-w-[1800px] mx-auto py-[120px] px-6">
        <img
          src={logoIcarir}
          alt="Logo Icarir"
          className="absolute inset-0 w-full h-full object-contain opacity-5 pointer-events-none"
        />
        <h2 className="text-4xl font-bold text-[#394C97] mb-10 text-center relative z-10">
          Choose Your Destination
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 relative z-10">
          {destinations.map((dest) => (
            <HomeCard
              key={dest.id}
              city={dest.city}
              image={dest.image}
              onStartMission={iniciarMissao}
              loading={loadingCity === dest.city}
              animation="fade-up"
            />
          ))}
        </div>
      </section>

      <FeedbackBar />
    </div>
  );
}
