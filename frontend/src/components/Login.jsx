import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api"; // ✅ Axios configurado com baseURL

export default function Login() {
  const [form, setForm] = useState({ email: "", senha: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError("");
  };

  const handleLogin = async () => {
    try {
      const response = await api.post("/auth/login", form);
      const { accessToken, user } = response.data;

      // Salva token e dados do usuário no localStorage
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      // Redireciona com base no papel do usuário
      navigate(user.role === "admin" ? "/admin" : "/profile");
    } catch (err) {
      console.error("Erro no login:", err);
      setError(
        err.response?.data?.error ||
          "E-mail ou senha incorretos. Tente novamente."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-purple-700 mb-6 text-center">
          Entrar na Conta
        </h1>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            value={form.email}
            onChange={handleChange("email")}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={form.senha}
            onChange={handleChange("senha")}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          {error && <p className="text-red-500 text-center text-sm">{error}</p>}

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