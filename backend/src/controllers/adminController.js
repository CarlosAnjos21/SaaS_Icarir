const prisma = require('../config/prismaClient');

const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalMissions, completedTasks] = await Promise.all([
      prisma.usuario.count({ where: { role: 'participante', ativo: true } }),
      prisma.missao.count({ where: { ativa: true } }),
      prisma.usuarioTarefa.count({ where: { concluida: true } }),
    ]);

    const topUser = await prisma.usuario.findFirst({
      where: { role: 'participante', ativo: true },
      orderBy: { pontos_totais: 'desc' },
      select: { nome: true, pontos_totais: true, foto_url: true },
    });

    const missionRankings = await prisma.$queryRaw`
      WITH scores AS (
        SELECT
          m.id AS "missaoId",
          m.titulo AS "missionTitle",
          u.id AS "userId",
          u.nome AS "userName",
          u.foto_url AS "userAvatar",
          SUM(ut.pontos_obtidos) AS "totalPoints",
          ROW_NUMBER() OVER (PARTITION BY m.id ORDER BY SUM(ut.pontos_obtidos) DESC) AS rn
        FROM usuarios_tarefas ut
        JOIN tarefas t ON ut.tarefa_id = t.id
        JOIN missoes m ON t.missao_id = m.id
        JOIN usuarios u ON ut.usuario_id = u.id
        WHERE u.role = 'participante' AND u.ativo = true AND ut.concluida = true
        GROUP BY m.id, m.titulo, u.id, u.nome, u.foto_url
      )
      SELECT "missaoId", "missionTitle", "userId", "userName", "userAvatar", "totalPoints"
      FROM scores WHERE rn = 1
      ORDER BY "totalPoints" DESC
    `;

    const estimatedTotal = (totalUsers * totalMissions * 3) || 1;
    const averageCompletion = Math.min(Math.round((completedTasks / estimatedTotal) * 100), 100);

    res.json({
      totalUsers,
      totalMissions,
      completedTasks,
      averageCompletion,
      topUser: {
        name: topUser?.nome || 'Nenhum usuário',
        points: Number(topUser?.pontos_totais || 0),
        avatar: topUser?.foto_url || null,
      },
      missionRankings: missionRankings.map((r) => ({
        id: r.missaoId,
        title: r.missionTitle,
        topUser: {
          name: r.userName,
          points: Number(r.totalPoints || 0),
          avatar: r.userAvatar || null,
        },
      })),
    });
  } catch (error) {
    console.error('Erro no dashboard:', error);
    res.status(500).json({ error: 'Erro ao carregar estatísticas.' });
  }
};

const validateTaskSubmission = async (req, res) => {
  const submissionId = parseInt(req.params.submissionId, 10);
  const adminId = req.user?.id;
  const { approve, pontos_concedidos = 0 } = req.body;

  try {
    const submission = await prisma.usuarioTarefa.findUnique({
      where: { id: submissionId },
    });
    if (!submission) return res.status(404).json({ error: 'Submissão não encontrada.' });

    if (approve) {
      await prisma.$transaction([
        prisma.usuarioTarefa.update({
          where: { id: submissionId },
          data: {
            concluida: true,
            pontos_obtidos: pontos_concedidos,
            validado_por: adminId,
            data_validacao: new Date(),
          },
        }),
        prisma.usuario.update({
          where: { id: submission.usuario_id },
          data: {
            pontos: { increment: pontos_concedidos },
            pontos_totais: { increment: pontos_concedidos },
          },
        }),
        prisma.logsPontos.create({
          data: {
            usuario_id: submission.usuario_id,
            tarefa_id: submission.tarefa_id,
            validador_id: adminId,
            pontos: pontos_concedidos,
            tipo: 'tarefa_concluida',
            descricao: 'Tarefa validada pelo admin',
          },
        }),
      ]);
      return res.json({ message: 'Submissão aprovada.' });
    }

    await prisma.usuarioTarefa.update({
      where: { id: submissionId },
      data: {
        concluida: false,
        pontos_obtidos: 0,
        validado_por: adminId,
        data_validacao: new Date(),
      },
    });
    res.json({ message: 'Submissão reprovada.' });
  } catch (error) {
    console.error('Erro na validação:', error);
    res.status(500).json({ error: 'Erro ao validar submissão.' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.usuario.findMany({
      select: { id: true, nome: true, email: true, foto_url: true, role: true, ativo: true },
      orderBy: { nome: 'asc' },
    });
    res.json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
};

module.exports = { getDashboardStats, validateTaskSubmission, getAllUsers };