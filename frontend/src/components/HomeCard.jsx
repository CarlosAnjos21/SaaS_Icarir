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
    AOS.refresh();
  }, []);

  return (
    <div
      data-aos={animation}
      // ADICIONADO 'group': Permite controlar o efeito da imagem quando passamos o mouse no card
      // ADICIONADO 'hover:-translate-y-2': Faz o card subir levemente
      className="group relative cursor-pointer bg-white rounded-xl shadow-md transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
      
      // Clique no Card -> Vai para Detalhes
      onClick={() => onStartMission(city)}
    >
      {/* Container da Imagem com overflow-hidden para o zoom não sair para fora */}
      <div className="h-[240px] w-full overflow-hidden relative">
        <img 
          src={image} 
          alt={city} 
          // EFEITO DE ZOOM AQUI: group-hover:scale-110 aumenta a imagem suavemente
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110" 
        />
        
        {/* (Opcional) Overlay escuro suave ao passar o mouse para destacar o texto abaixo */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
      </div>

      <div className="p-5">
        <h3 className="text-2xl font-bold text-orange mb-1 group-hover:text-[#394C97] transition-colors">
            {city}
        </h3>
        <p className="text-sm text-dark">
          Complete missions to unlock discounts to {city}!
        </p>
        
        <button
          // Clique no Botão -> Vai para Lista de Missões
          onClick={(e) => {
            e.stopPropagation();
            navigate("/missions");
          }}
          disabled={loading}
          className={`mt-4 px-4 py-2 rounded text-white font-medium shadow-sm transition-all duration-300 transform ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#394C97] hover:bg-[#FE5900] hover:scale-105 active:scale-95"
          }`}
        >
          {loading ? "Iniciando..." : "Iniciar Missão"}
        </button>
      </div>
    </div>
  );
}