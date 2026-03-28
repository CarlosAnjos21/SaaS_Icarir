const prisma = require("../config/prismaClient");

exports.getDashboard = async (req, res) => {
  try {

    const missionsCompleted = await prisma.usuarioMissao.count();

    const totalPoints = await prisma.usuario.aggregate({
      _sum: {
        pontos_totais: true
      }
    });

    const tripsMade = await prisma.missao.count();

    res.json({
      stats: {
        missionsCompleted,
        totalPoints: totalPoints._sum.pontos_totais || 0,
        tripsMade
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erro ao carregar dashboard"
    });
  }
};