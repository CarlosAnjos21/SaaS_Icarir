const db = require('../config/db');

/**
 * @route   GET /api/ranking
 * @desc    (Público/Privado) Busca o ranking global de usuários
 * @access  A sua escolha (vamos deixar privado por padrão)
 */
const getGlobalRanking = async (req, res) => {
  try {
    // Busca nome, foto e pontos dos usuários.
    // Filtra para mostrar apenas 'user' (não 'admin').
    // Ordena por pontos (DESC) e depois por nome (ASC) para desempate.
    const query = `
      SELECT
        id,
        nome,
        foto_url,
        pontos
      FROM usuarios
      WHERE ativo = true AND role = 'user'
      ORDER BY
        pontos DESC,
        nome ASC
      LIMIT 100; -- Limita aos 100 primeiros
    `;
    
    const { rows } = await db.query(query);
    res.json(rows);

  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = {
  getGlobalRanking,
};