const prisma = require('../config/prismaClient');

const listAvailableAwards = async (req, res) => {
  try {
    const awards = await prisma.premiacao.findMany({ // era prisma.premiacoes — incorreto
      where: { ativo: true, posicao_ranking: { not: null } },
      select: { id: true, titulo: true, descricao: true, tipo: true, posicao_ranking: true, imagem_url: true },
      orderBy: { posicao_ranking: 'asc' },
    });
    res.json(awards);
  } catch (error) {
    console.error('Erro ao listar premiações:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = { listAvailableAwards };