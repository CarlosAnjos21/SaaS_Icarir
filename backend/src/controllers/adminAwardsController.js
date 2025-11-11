// Importa o Prisma Client
const prisma = require('../config/prismaClient');

/**
 * @route   GET /api/awards
 * @desc    (Usuário) Listar todas as premiações ativas
 * @access  Privado
 */
const listAvailableAwards = async (req, res) => {
  try {
<<<<<<< HEAD
    // Lista os prêmios, ordenados pela posição do ranking
=======
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
    const awards = await prisma.premiacoes.findMany({
      where: {
        ativo: true,
        posicao_ranking: { not: null } // Apenas prêmios com posição no ranking
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
<<<<<<< HEAD
    
    res.json(awards);
=======
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121

    res.json(awards);
  } catch (error) {
    console.error('Erro ao listar premiações:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = {
  listAvailableAwards
};
