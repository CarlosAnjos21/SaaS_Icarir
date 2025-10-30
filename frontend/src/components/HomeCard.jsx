import { useNavigate } from "react-router-dom";

export default function HomeCard({ city, image }) {
  const navigate = useNavigate();

  return (
    <div
      className="cursor-pointer bg-white rounded-xl shadow-lg transition-all duration-300 ease-in-out overflow-hidden hover:shadow-2xl hover:h-[calc(100%+2px)] hover:w-[calc(100%+2px)] animate-fade-in"
      onClick={() => navigate("/missions")}
    >
      <img src={image} alt={city} className="w-full h-[240px] object-cover" />
      <div className="p-5">
        <h3 className="text-2xl font-bold text-orange mb-1">{city}</h3>
        <p className="text-sm text-dark">
          Complete missions to unlock discounts to {city}!
        </p>
      </div>
    </div>
  );
}
