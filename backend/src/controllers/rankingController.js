// Importa o Prisma Client
const prisma = require('../config/prismaClient');

/**
 * @route   GET /api/ranking
 * @desc    Busca o ranking global de usuários (privado por padrão)
 * @access  Privado (requer token)
 */
const getGlobalRanking = async (req, res) => {
  try {
    // Busca nome, foto e pontos dos usuários
    // Filtra apenas usuários ativos e com role = 'user'
    // Ordena por pontos (descendente) e nome (ascendente, para desempate)
    const ranking = await prisma.usuarios.findMany({
      where: {
        ativo: true,
        role: 'user'
      },
      select: {
        id: true,
        nome: true,
        foto_url: true,
        pontos: true
      },
      orderBy: [
        { pontos: 'desc' }, // primeiro pelos pontos
        { nome: 'asc' }     // depois pelo nome (desempate)
      ],
      take: 100 // limita aos 100 primeiros
    });

    res.json(ranking);
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = {
  getGlobalRanking,
};
