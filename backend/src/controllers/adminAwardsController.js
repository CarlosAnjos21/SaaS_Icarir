<<<<<<< HEAD
const db = require('../config/db');
=======
// Importa o Prisma Client
const prisma = require('../config/prismaClient');
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5

/**
 * @route   GET /api/awards
 * @desc    (Usuário) Listar todas as premiações ativas
 * @access  Privado
 */
const listAvailableAwards = async (req, res) => {
  try {
    // Lista os prêmios, ordenados pela posição do ranking
<<<<<<< HEAD
    const query = `
      SELECT id, titulo, descricao, tipo, posicao_ranking, imagem_url
      FROM premiacoes
      WHERE ativo = true AND posicao_ranking IS NOT NULL
      ORDER BY posicao_ranking ASC;
    `;
    const { rows } = await db.query(query);
    res.json(rows);
=======
    const awards = await prisma.premiacoes.findMany({
      where: {
        ativo: true,
        posicao_ranking: { not: null } // Prisma para 'IS NOT NULL'
      },
      select: {
        id: true,
        titulo: true,
        descricao: true,
        tipo: true,
        posicao_ranking: true,
        imagem_url: true
      },
      orderBy: {
        posicao_ranking: 'asc'
      }
    });
    
    res.json(awards);
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5

  } catch (error) {
    console.error('Erro ao listar premiações:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = {
  listAvailableAwards,
};