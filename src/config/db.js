const { Pool } = require('pg');
require('dotenv').config(); // Carrega as variáveis do arquivo .env

// O Pool vai ler as variáveis de ambiente automaticamente
// (PGUSER, PGHOST, PGDATABASE, PGPASSWORD, PGPORT)
const pool = new Pool();

// Opcional: Testa a conexão
pool.on('connect', () => {
  console.log('Conexão com o banco de dados PostgreSQL estabelecida com sucesso!');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // Exportamos o pool caso precise de transações
};