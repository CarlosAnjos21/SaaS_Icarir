import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cog6ToothIcon,
  PencilSquareIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    description: "",
    image: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("loggedUser");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const pontos = parsed.pontos || 1200;
        const descricaoPersonalizada = getDescricao(parsed.name);

        const enrichedUser = {
          ...parsed,
          pontos,
          descricao: descricaoPersonalizada,
        };

        setUser(enrichedUser);
        setForm({
          name: enrichedUser.name,
          email: enrichedUser.email,
          description: enrichedUser.descricao,
          image: enrichedUser.image || "",
        });
        setLoading(false);
      } else {
        navigate("/register");
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      navigate("/register");
    }
  }, [navigate]);

  const getDescricao = (name) => {
    if (name.includes("Carlos")) return "Estudante de TI - Dev Full Stack";
    if (name.includes("Ana")) return "Designer UX/UI apaixonada por inovação";
    if (name.includes("João")) return "Especialista em dados e IA";
    return "Membro da comunidade Atlântico Avanti";
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedUser");
    navigate("/logout");
  };

  const handleSave = () => {
    const updatedUser = {
      ...user,
      name: form.name,
      email: form.email,
      description: form.description,
      image: form.image,
    };
    localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const getInitials = (name) =>
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-purple-700 font-semibold">Carregando perfil...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-[#FEF7EC] to-[#394C97] flex justify-center items-start pt-[100px] px-4"
    >
      <div className="w-full max-w-4xl bg-white/30 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-white/40">
        {/* Parte superior */}
        <div className="flex flex-col items-center py-8 px-6 border-b border-purple-200">
          <br />
          <br />
        </div>

        {/* Imagem central */}
        <div className="flex justify-start -mt-12 mb-6 px-6">
          <div className="w-32 h-32 ml-[80px] rounded-full overflow-hidden border-4 border-white shadow-lg bg-purple-100 flex items-center justify-center">
            {form.image ? (
              <img
                src={form.image}
                alt="Foto de perfil"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <UserCircleIcon className="h-28 w-28 text-purple-500" />
            )}
          </div>
        </div>

        {/* Parte inferior */}
        <div className="px-6 pb-8 text-left">
          <div className="flex justify-center gap-4 mb-4">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition"
            >
              <PencilSquareIcon className="h-5 w-5" />
              {isEditing ? "Cancelar" : "Editar"}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition">
              <Cog6ToothIcon className="h-5 w-5" />
              Configurações
            </button>
          </div>
          <div className="text-left mb-4 ml-[80px]">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {user.name}
            </h1>
            <p className="text-sm text-purple-600">{user.description}</p>
          </div>

          {isEditing ? (
            <div className="space-y-4 text-left max-w-md mx-auto">
              <input
                type="text"
                placeholder="Nome"
                value={form.name}
                onChange={handleChange("name")}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange("email")}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <textarea
                placeholder="Descrição sobre você"
                value={form.description}
                onChange={handleChange("description")}
                className="w-full px-4 py-2 border rounded-lg h-24 resize-none"
              />
              <input
                type="text"
                placeholder="URL da imagem de perfil"
                value={form.image}
                onChange={handleChange("image")}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <button
                onClick={handleSave}
                className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition hover:shadow-md"
              >
                Salvar alterações
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-600 ml-[80px] space-y-2 max-w-md mx-auto text-left">
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>ID:</strong> {user.id}
              </p>
              <p>
                <strong>Inicial:</strong> {getInitials(user.name)}
              </p>
              <p>
                <strong>Total de pontos:</strong> {user.pontos}
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-center gap-6 text-purple-700 font-semibold text-sm">
            <span>Níveis</span>
            <span>Comentários</span>
            <span>Posts (0)</span>
          </div>

    
        </div>
      </div>
      <div><button
            onClick={handleLogout}
            className="mt-6 mx-auto text-red-500 hover:text-red-700 block"
          >
            Sair da Conta
          </button></div>
    </motion.div>
  );
}
