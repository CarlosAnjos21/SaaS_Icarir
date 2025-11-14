import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

export default function HomeCard({
  city,
  image,
  onStartMission,
  loading,
  animation = "fade-up",
}) {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    AOS.refresh(); // garante que novos elementos sejam animados ao subir
  }, []);

  return (
    <div
      data-aos={animation}
      className="cursor-pointer bg-white rounded-xl shadow-lg transition-all duration-300 ease-in-out overflow-hidden hover:shadow-2xl hover:h-[calc(100%+2px)] hover:w-[calc(100%+2px)]"
      onClick={() => navigate("/missions")}
    >
      <img src={image} alt={city} className="w-full h-[240px] object-cover" />
      <div className="p-5">
        <h3 className="text-2xl font-bold text-orange mb-1">{city}</h3>
        <p className="text-sm text-dark">
          Complete missions to unlock discounts to {city}!
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStartMission(city);
          }}
          disabled={loading}
          className={`mt-4 px-4 py-2 rounded text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#394C97] hover:bg-[#FE5900]"
          }`}
        >
          {loading ? "Iniciando..." : "Iniciar Missão"}
        </button>
      </div>
    </div>
  );
}
