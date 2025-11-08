import { useState } from "react";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import HomeCard from "../components/HomeCard";
import bannerImg from "../assets/airport.jpg";
import logoIcarir from "../assets/logo_icarir.png";
import api from "../api/api"; // Axios configurado

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

  const iniciarMissao = async (city) => {
    setLoadingCity(city);
    try {
      const res = await api.get(`/missions/by-destination/${city}`);
      const missao = res.data[0];

      if (missao) {
        alert(`Missão iniciada: ${missao.title} (+${missao.pontos} pontos)`);
        // Aqui você pode redirecionar ou atualizar o estado global
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

  return (
    <div className="min-h-screen bg-white text-black transition-colors duration-300">
      <Navbar />
      {/* <Header /> */}

      <div className="relative h-[900px] overflow-hidden">
        <img
          src={bannerImg}
          alt="Airport Banner"
          className="absolute top-0 left-0 w-full h-full object-cover scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#394C97]/60 via-transparent to-white"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 animate-fade-in">
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
        </div>
      </div>

      {/* Cards de destinos com imagem de fundo */}
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
            />
          ))}
        </div>
      </section>
    </div>
  );
}
