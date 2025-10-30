import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    image: "",
    description: "",
  });

  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleLogin = () => {
    const user = {
      id: Date.now(), // gera um ID simples
      ...form,
    };
    localStorage.setItem("loggedUser", JSON.stringify(user));
    navigate("/profile"); // redireciona para o perfil
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-purple-700 mb-6 text-center">Entrar na Conta</h1>
        <div className="space-y-4">
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
          <input
            type="text"
            placeholder="URL da imagem de perfil (opcional)"
            value={form.image}
            onChange={handleChange("image")}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <textarea
            placeholder="Descrição (opcional)"
            value={form.description}
            onChange={handleChange("description")}
            className="w-full px-4 py-2 border rounded-lg h-24 resize-none"
          />
          <button
            onClick={handleLogin}
            className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}