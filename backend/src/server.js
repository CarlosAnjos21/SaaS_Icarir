const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const setupSwagger = require("./swagger");

const app = express();

// ─── Middlewares Globais ───────────────────────────────────────────────────────
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// ─── CORS Dinâmico (funciona em dev e produção) ────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS bloqueado para origin: ${origin}`));
      }
    },
    credentials: true,
  })
);

// ─── Rate Limiting ──────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Muitas requisições. Tente novamente em alguns minutos." },
});
app.use("/api", apiLimiter);

// ─── Swagger ───────────────────────────────────────────────────────────────────
setupSwagger(app);

// ─── Rotas da API ──────────────────────────────────────────────────────────────
const mainRouter = require("./routes/index");
app.use("/api", mainRouter);

// ─── Rota raiz ────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "API ICARIR rodando!", status: "ok" });
});

// ─── Error Handler Global ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Erro não tratado:", err.stack || err.message);

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