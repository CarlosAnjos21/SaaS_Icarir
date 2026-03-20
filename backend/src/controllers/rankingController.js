const prisma = require('../config/prismaClient');

const getGlobalRanking = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: { ativo: true, role: 'participante' },
      select: { id: true, nome: true, foto_url: true, pontos_totais: true, role: true },
      orderBy: { pontos_totais: 'desc' },
      take: 100,
    });

    const ranking = usuarios.map((u) => {
      const partes = u.nome.trim().split(' ');
      const initials =
        partes.length >= 2
          ? (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
          : u.nome.slice(0, 2).toUpperCase();

      return {
        id: u.id,
        name: u.nome,
        initials,
        photo: u.foto_url || null,
        points: Number(u.pontos_totais || 0),
        department: u.role,
        variation: 0,
      };
    });

    res.json(ranking);
  } catch (error) {
    console.error('Erro no ranking:', error);
    res.status(500).json({ error: 'Erro ao buscar ranking.' });
  }
};

module.exports = { getGlobalRanking };