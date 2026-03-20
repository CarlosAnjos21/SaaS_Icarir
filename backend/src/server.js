const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const setupSwagger = require("./swagger");

const app = express();

// ─── Middlewares Globais ───────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ─── CORS Dinâmico (funciona em dev e produção) ────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requests sem origin (ex: Postman, curl) em dev
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS bloqueado para origin: ${origin}`));
      }
    },
    credentials: true,
  })
);

// ─── Swagger ───────────────────────────────────────────────────────────────────
setupSwagger(app);

// ─── Pasta de uploads ──────────────────────────────────────────────────────────
try {
  const uploadsPath = path.join(__dirname, "..", "uploads", "evidences");
  fs.mkdirSync(uploadsPath, { recursive: true });
} catch (err) {
  console.error("Erro criando pasta de uploads:", err);
}
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// ─── Rotas da API ──────────────────────────────────────────────────────────────
// ATENÇÃO: Todas as rotas passam pelo index.js — sem duplicação aqui
const mainRouter = require("./routes/index");
app.use("/api", mainRouter);

// ─── Rota raiz ────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "API Jornada Conexões rodando!", status: "ok" });
});

// ─── Error Handler Global ─────────────────────────────────────────────────────
// Captura qualquer erro não tratado nas rotas
app.use((err, req, res, next) => {
  console.error("❌ Erro não tratado:", err.stack || err.message);

  // Erro de CORS
  if (err.message && err.message.startsWith("CORS bloqueado")) {
    return res.status(403).json({ error: err.message });
  }

  res.status(err.status || 500).json({
    error: err.message || "Erro interno do servidor.",
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`📄 Docs: http://localhost:${PORT}/api-docs`);
});