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

  const handleSubmit = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const clients = JSON.parse(localStorage.getItem("clients") || "[]");

    if (!isLogin) {
      if (form.password !== form.confirmPassword) {
        setError("As senhas não coincidem.");
        return;
      }

      const userExists = users.find((u) => u.email === form.email);
      if (userExists) {
        setError("Este e-mail já está cadastrado.");
        return;
      }

      const newUser = {
        id: Date.now(),
        name: form.name,
        email: form.email,
        password: form.password,
      };

      const newClient = {
        id: newUser.id,
        name: newUser.name,
        initials: form.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase(),
      };

      localStorage.setItem("users", JSON.stringify([...users, newUser]));
      localStorage.setItem("clients", JSON.stringify([...clients, newClient]));

      setSuccess("Conta criada com sucesso! Agora você pode entrar.");
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
      setIsLogin(true);
    } else {
      const user = users.find(
        (u) => u.email === form.email && u.password === form.password
      );

      if (!user) {
        setError("E-mail ou senha inválidos.");
        return;
      }

      localStorage.setItem("loggedUser", JSON.stringify(user));
      navigate("/profile"); // Redireciona para a página de perfil
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