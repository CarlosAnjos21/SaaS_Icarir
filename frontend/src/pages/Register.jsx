import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [isLogin, setIsLogin] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin) {
      if (form.password !== form.confirmPassword) {
        setError("As senhas não coincidem.");
        return;
      }

      try {
        const res = await fetch("http://localhost:3001/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: form.name,
            email: form.email,
            senha: form.password,
            codigo_empresa: "empresa123", // você pode tornar isso dinâmico se quiser
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setSuccess("Conta criada com sucesso! Agora você pode entrar.");
          setForm({ name: "", email: "", password: "", confirmPassword: "" });
          setIsLogin(true);
        } else {
          setError(data.error || "Erro ao cadastrar.");
        }
      } catch (err) {
        setError("Erro de conexão com o servidor.");
      }
    } else {
      try {
        const res = await fetch("http://localhost:3001/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form.email,
            senha: form.password,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("token", data.accessToken);
          navigate("/profile");
        } else {
          setError(data.error || "E-mail ou senha inválidos.");
        }
      } catch (err) {
        setError("Erro de conexão com o servidor.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          {isLogin ? "Entrar" : "Criar Conta"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Nome completo"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Senha"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          {!isLogin && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar senha"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          )}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && (
            <p className="text-green-600 text-sm text-center">{success}</p>
          )}
          <button
            type="submit"
            className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-orange-600 transition"
          >
            {isLogin ? "Entrar" : "Registrar"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {isLogin ? "Ainda não tem uma conta?" : "Já tem uma conta?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setSuccess("");
            }}
            className="text-orange-500 hover:underline font-medium"
          >
            {isLogin ? "Cadastre-se" : "Entrar"}
          </button>
        </p>
      </div>
    </div>
  );
}