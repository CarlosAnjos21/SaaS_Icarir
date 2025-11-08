const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const app = express();

// ✅ CORS ajustado para Vite (porta 5173)
app.use(
  cors({
    origin: "http://localhost:5173", // porta correta do front-end com Vite
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ✅ Rotas da API
const mainRouter = require("./routes/index");
app.use("/api", mainRouter);

// ✅ Redirecionar a raiz para o front-end
app.get("/", (req, res) => {
  res.redirect("http://localhost:5173");

  // ✅ Middleware para rotas não encontradas
  app.use((req, res, next) => {
    res.status(404).json({ error: "Rota não encontrada." });
  });

  // ✅ Middleware para rotas não encontradas
  app.use((req, res, next) => {
    res.status(404).json({ error: "Rota não encontrada." });
  });

  // ✅ Middleware global de tratamento de erros
  app.use((err, req, res, next) => {
    console.error("Erro interno:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  });
});

// ✅ Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
