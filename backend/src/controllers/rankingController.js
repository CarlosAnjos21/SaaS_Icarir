// Importa o Prisma Client
const prisma = require('../config/prismaClient');

/**
 * @route   GET /api/ranking
 * @desc    (Público/Privado) Busca o ranking global de usuários
 * @access  A sua escolha (vamos deixar privado por padrão)
 */
const getGlobalRanking = async (req, res) => {
  try {
    // Busca o ranking usando o Prisma, que é muito mais legível
    const ranking = await prisma.usuarios.findMany({
      // WHERE ativo = true AND role = 'user'
      where: {
        ativo: true,
        role: 'user'
      },
      // SELECT id, nome, foto_url, pontos
      select: {
        id: true,
        nome: true,
        foto_url: true,
        pontos: true
      },
      // ORDER BY pontos DESC, nome ASC
      orderBy: [
        { pontos: 'desc' }, // Primeiro por pontos
        { nome: 'asc' }     // Depois por nome (desempate)
      ],
      // LIMIT 100
      take: 100
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