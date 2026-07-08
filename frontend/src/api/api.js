// src/api/api.js
import axios from "axios";

/**
 * ─── Cliente HTTP com Interceptadores ──────────────────────────────────────────
 * 
 * Configura o axios com:
 * 1. baseURL dinâmico (env var ou localhost)
 * 2. Request interceptor: adiciona JWT automaticamente
 * 3. Response interceptor: renova token expirado automaticamente
 * 4. Error handling global
 */

// ─── Configuração Base ─────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 segundos
  withCredentials: true, // Para cookies (refreshToken)
});

console.log(`✅ API URL configurada: ${API_URL}`);

// ─── Request Interceptor: Adiciona JWT ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("❌ Erro ao preparar request:", error);
    return Promise.reject(error);
  }
);

// ─── Response Interceptor: Renova Token Expirado ───────────────────────────────
api.interceptors.response.use(
  // Sucesso: retorna normalmente
  (response) => response,

  // Erro: tenta renovar token se 401
  async (error) => {
    const originalRequest = error.config;

    // Se erro 401 e ainda não tentou refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.warn("⚠️  Token expirado. Tentando renovar...");

        // POST para /auth/refresh
        // O refreshToken vem automático nos cookies (httpOnly)
        const refreshResponse = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = refreshResponse.data;

        if (accessToken) {
          // Armazena novo token
          localStorage.setItem("token", accessToken);
          console.log("✅ Token renovado com sucesso!");

          // Retry da requisição original com novo token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("❌ Falha ao renovar token:", refreshError);

        // Limpa dados de autenticação
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Redireciona para login
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Outros erros: rejeita normalmente
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Já tentou refresh e ainda falhou
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
