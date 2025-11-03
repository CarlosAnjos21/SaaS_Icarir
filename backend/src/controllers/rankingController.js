<<<<<<< HEAD
const db = require('../config/db');
=======
// Importa o Prisma Client
const prisma = require('../config/prismaClient');
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5

/**
 * @route   GET /api/ranking
 * @desc    (Público/Privado) Busca o ranking global de usuários
 * @access  A sua escolha (vamos deixar privado por padrão)
 */
const getGlobalRanking = async (req, res) => {
  try {
<<<<<<< HEAD
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
=======
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
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5

  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = {
  getGlobalRanking,
};