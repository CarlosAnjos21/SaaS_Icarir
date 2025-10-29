const db = require('../config/db');

/**
 * @route   GET /api/awards
 * @desc    (Usuário) Listar todas as premiações ativas
 * @access  Privado
 */
const listAvailableAwards = async (req, res) => {
  try {
    // Lista os prêmios, ordenados pela posição do ranking
    const query = `
      SELECT id, titulo, descricao, tipo, posicao_ranking, imagem_url
      FROM premiacoes
      WHERE ativo = true AND posicao_ranking IS NOT NULL
      ORDER BY posicao_ranking ASC;
    `;
    const { rows } = await db.query(query);
    res.json(rows);

  } catch (error) {
    console.error('Erro ao listar premiações:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = {
  listAvailableAwards,
};