const express = require('express');
require('dotenv').config(); // Carrega as variáveis de ambiente

const app = express();
app.use(express.json()); // Middleware para ler JSON

// Importa o roteador mestre
const mainRouter = require('./routes/index');

// Diz ao app para usar o roteador mestre
// Todas as rotas agora começarão com /api
app.use('/api', mainRouter);

// Rota "catch-all" para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// Iniciar o servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`API disponível em http://localhost:${PORT}/api`);
});