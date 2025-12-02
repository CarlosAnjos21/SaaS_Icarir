import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    UserIcon,
    EnvelopeIcon,
    LockClosedIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function Register() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
        setSuccess("");
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (form.password !== form.confirmPassword) {
            setError("As senhas não coincidem. Por favor, verifique.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("http://localhost:3001/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: form.name,
                    email: form.email,
                    senha: form.password,
                    codigo_empresa: "empresa123",
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess("Conta criada com sucesso! Redirecionando para o Login...");
                setForm({ name: "", email: "", password: "", confirmPassword: "" });

                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                setError(data.error || "Erro ao cadastrar. Tente um e-mail diferente.");
            }
        } catch (err) {
            setError("Erro de conexão com o servidor. Verifique o backend.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 pt-[50px]">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="
                    w-full max-w-md bg-white p-8 rounded-2xl shadow-xl 
                    relative overflow-hidden
                "
            >
                {/* Barra decorativa */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#394C97] to-[#FE5900]"></div>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-[#394C97] tracking-tight">
                        Criar Conta
                    </h2>
                    <p className="text-gray-500 text-sm mt-2">
                        Junte-se a nós para começar sua jornada de missões.
                    </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    {/* Nome */}
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            name="name"
                            placeholder="Nome completo"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                            focus:ring-2 focus:ring-[#394C97] outline-none bg-gray-50 focus:bg-white"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                            focus:ring-2 focus:ring-[#394C97] outline-none bg-gray-50 focus:bg-white"
                            required
                        />
                    </div>

                    {/* Senha */}
                    <div className="relative">
                        <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="password"
                            name="password"
                            placeholder="Senha"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                            focus:ring-2 focus:ring-[#394C97] outline-none bg-gray-50 focus:bg-white"
                            required
                        />
                    </div>

                    {/* Confirmar Senha */}
                    <div className="relative">
                        <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirmar senha"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                            focus:ring-2 focus:ring-[#394C97] outline-none bg-gray-50 focus:bg-white"
                            required
                        />
                    </div>

                    {/* Feedback */}
                    {error && (
                        <p className="text-red-500 text-sm text-center font-medium">{error}</p>
                    )}

                    {success && (
                        <div className="flex items-center justify-center bg-green-50 text-green-600 p-3 rounded-lg border border-green-200">
                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                            <p className="text-sm font-medium">{success}</p>
                        </div>
                    )}

                    {/* Botão */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`
                            w-full flex items-center justify-center gap-2 py-3 rounded-lg 
                            text-white font-bold text-lg shadow-md transition transform hover:-translate-y-0.5
                            ${
                                loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-[#394C97] hover:bg-[#304180] hover:shadow-[#394C97]/30"
                            }
                        `}
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            "Registrar"
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Já tem uma conta?{" "}
                    <Link
                        to="/login"
                        className="font-bold text-[#FE5900] hover:text-[#e04f00] hover:underline transition"
                    >
                        Entrar aqui
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
