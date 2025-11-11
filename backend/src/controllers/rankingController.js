// Importa o Prisma Client
<<<<<<< HEAD
const prisma = require('../config/prismaClient');
=======
const prisma = require("../config/prismaClient");
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121

/**
 * @route   GET /api/ranking
 * @desc    Busca o ranking global de usuários (privado por padrão)
 * @access  Privado (requer token)
 */
const getGlobalRanking = async (req, res) => {
  try {
<<<<<<< HEAD
    // Busca o ranking usando o Prisma, que é muito mais legível
    const ranking = await prisma.usuarios.findMany({
      // WHERE ativo = true AND role = 'user'
=======
    // Busca usuários ativos com role 'user'
    const usuarios = await prisma.Usuarios.findMany({
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
      where: {
        ativo: true,
        role: "user",
      },
      select: {
        id: true,
        nome: true,
        foto_url: true,
        pontos: true,
      },
      orderBy: [
        { pontos: "desc" },
        { nome: "asc" },
      ],
      take: 100,
    });
<<<<<<< HEAD
    
    res.json(ranking);
=======
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121

    // Gera as iniciais dinamicamente (caso não estejam salvas no banco)
    const ranking = usuarios.map((user) => {
      const nomes = user.nome.trim().split(" ");
      const initials = nomes.length >= 2
        ? nomes[0][0] + nomes[nomes.length - 1][0]
        : nomes[0].slice(0, 2);
      return {
        id: user.id,
        name: user.nome,
        initials: initials.toUpperCase(),
        photo: user.foto_url,
        points: user.pontos,
      };
    });

    res.json(ranking);
  } catch (error) {
    console.error("Erro ao buscar ranking:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

module.exports = {
  getGlobalRanking,
};