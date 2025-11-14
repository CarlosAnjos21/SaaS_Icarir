import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cog6ToothIcon,
  PencilSquareIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import api from "../api/api";

export default function Profile() {
  const getLevel = (points) => Math.floor(points / 1000);
  const getProgress = (points) => (points % 1000) / 10;

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

  const getDescricao = (name) => {
    if (name.includes("Carlos")) return "IT Student - Full Stack Dev";
    if (name.includes("Ana")) return "UX/UI Designer passionate about innovation";
    if (name.includes("João")) return "Data and AI Specialist";
    return "Member of the Atlântico Avanti community";
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/register");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        const descricaoPersonalizada = getDescricao(data.nome);

        const enrichedUser = {
          ...data,
          name: data.nome,
          pontos: data.pontos || 1200,
          description: descricaoPersonalizada,
          image: data.foto_url || "",
        };

        setUser(enrichedUser);
        setForm({
          name: enrichedUser.name,
          email: enrichedUser.email,
          description: enrichedUser.description,
          image: enrichedUser.image,
        });
      } catch (err) {
        console.error("Erro ao buscar perfil:", err);
        navigate("/register");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
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

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#394C97] font-semibold">Loading profile...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-[#FEF7EC] to-[#394C97] flex flex-col items-center pt-[50px] px-4"
    >
      <div className="w-full max-w-4xl bg-white/30 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-white/40 pt-[100px]">
        {/* Avatar */}
        <div className="flex justify-start -mt-12 mb-6 px-6">
          <div
            {...getRootProps()}
            className={`w-32 h-32 ml-[80px] rounded-full overflow-hidden border-2 border-white shadow-lg bg-[#FEF7EC] flex items-center justify-center cursor-pointer transition duration-300 ${
              isDragActive ? "border-[#FE5900]" : ""
            }`}
          >
            <input {...getInputProps()} />
            {form.image ? (
              <img
                src={form.image}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <UserCircleIcon className="h-28 w-28 text-[#394C97]" />
            )}
          </div>
        </div>

        {/* Nome e descrição */}
        <div className="px-6 pb-8 text-left">
          <div className="text-left mb-4 ml-[80px]">
            <h1 className="text-2xl font-bold text-[#394C97] mb-2">
              {user.name}
            </h1>
            {!isEditing ? null : (
              <p className="text-sm text-[#FE5900]">{user.description}</p>
            )}
          </div>

          {/* Formulário de edição */}
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 text-left max-w-md mx-auto"
            >
              <input
                type="text"
                placeholder="Name"
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
                placeholder="About you"
                value={form.description}
                onChange={handleChange("description")}
                className="w-full px-4 py-2 border rounded-lg h-24 resize-none"
              />
              <button
                onClick={handleSave}
                className="w-full py-2 bg-[#394C97] text-white rounded-lg hover:bg-[#FE5900] transition hover:shadow-md"
              >
                Save changes
              </button>
            </motion.div>
          ) : (
            <div className="text-sm text-gray-600 ml-[80px] space-y-2 max-w-md mx-auto text-left">
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>ID:</strong> {user.id}
              </p>
              <p>
                <strong>Initials:</strong> {getInitials(user.name)}
              </p>
              <p>
                <strong>Total points:</strong> {user.pontos}
              </p>
            </div>
          )}
        </div>

        {/* Botões */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-[#FEF7EC] text-[#394C97] rounded-full hover:bg-[#FE5900]/20 transition"
          >
            <PencilSquareIcon className="h-5 w-5" />
            {isEditing ? "Cancel" : "Edit"}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#FEF7EC] text-[#394C97] rounded-full hover:bg-[#FE5900]/20 transition">
            <Cog6ToothIcon className="h-5 w-5" />
            Settings
          </button>
        </div>

        {/* Progresso e conquistas */}
        {/* ... permanece igual ... */}

        <button
          onClick={handleLogout}
          className="mt-8 px-6 py-2 bg-[#394C97] text-white rounded-full font-semibold shadow hover:bg-[#FE5900] transition duration-300"
        >
          Log Out
        </button>
      </div>
    </motion.div>
  );
}