const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const app = express();

// ✅ CORS ajustado para Vite (porta 5173)
app.use(cors({
  origin: "http://localhost:5173", // porta correta do front-end com Vite
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// ✅ Rotas da API
const mainRouter = require("./routes/index");
app.use("/api", mainRouter);

// ✅ Redirecionar a raiz para o front-end
app.get("/", (req, res) => {
  res.redirect("http://localhost:5173");
});

// ✅ Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});