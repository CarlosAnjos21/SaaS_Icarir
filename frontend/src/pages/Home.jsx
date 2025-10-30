import Header from "../components/Header";
import Navbar from "../components/Navbar";
import HomeCard from "../components/HomeCard";
import bannerImg from "../assets/airport.jpg";

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
  return (
    <div className="min-h-screen bg-white text-black transition-colors duration-300">
      <Navbar />
      {/* <Header /> */}

      {/* Imagem com degradê */}
      <div className="relative h-[600px] overflow-hidden">
        <img
          src={bannerImg}
          alt="Airport Banner"
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white transition-colors duration-300"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              Explore the World
            </h1>
            <p className="text-lg md:text-xl">
              Complete missions and earn rewards on your next flight
            </p>
          </div>
        </div>
      </div>

      {/* Cards de destinos */}
      <section className="max-w-[1800px] mx-auto py-[200px] px-6">
        <h2 className="text-3xl font-bold text-blue mb-6">
          Choose Your Destination
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {destinations.map((dest) => (
            <HomeCard key={dest.id} city={dest.city} image={dest.image} />
          ))}
        </div>
      </section>
    </div>
  );
}