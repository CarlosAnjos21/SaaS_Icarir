// Importa o Prisma Client
const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client');

/**
 * @route   POST /api/admin/submissions/:submissionId/validate
 * @desc    Validar (aprovar ou reprovar) uma submissão de tarefa
 * @access  Admin
 * @body    { "approve": true, "pontos_concedidos": 150 }
 */
const validateTaskSubmission = async (req, res) => {
  const submissionId = parseInt(req.params.submissionId, 10);
  if (isNaN(submissionId)) {
    return res.status(400).json({ error: 'ID de submissão inválido.' });
  }

  const adminId = req.user.id; // ID do admin logado
  const { approve, pontos_concedidos } = req.body;

  if (typeof approve !== 'boolean' || (approve && (typeof pontos_concedidos !== 'number' || pontos_concedidos < 0))) {
    return res.status(400).json({ error: 'Body inválido. Forneça "approve" (boolean) e "pontos_concedidos" (number >= 0, se aprovado).' });
  }

  try {
    // 1. Buscar submissão
    const submission = await prisma.usuariosTarefas.findUnique({
      where: { id: submissionId }
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submissão não encontrada.' });
    }

    if (submission.concluida) {
      return res.status(400).json({ error: 'Esta tarefa já foi validada anteriormente.' });
    }

    if (approve) {
      // --- LÓGICA DE APROVAÇÃO (Transação) ---
      const [updatedSubmission] = await prisma.$transaction([
        // Atualiza a submissão
        prisma.usuariosTarefas.update({
          where: { id: submissionId },
          data: {
            concluida: true,
            pontos_obtidos: pontos_concedidos,
            validado_por: adminId,
            data_validacao: new Date(),
            data_conclusao: new Date()
          }
        }),

        // Atualiza os pontos do usuário
        prisma.usuarios.update({
          where: { id: submission.usuario_id },
          data: {
            pontos: { increment: pontos_concedidos }
          }
        }),

        // Cria registro no log de pontos
        prisma.logsPontos.create({
          data: {
            usuario_id: submission.usuario_id,
            tarefa_id: submission.tarefa_id,
            pontos: pontos_concedidos,
            tipo: 'ganho_tarefa',
            descricao: 'Tarefa concluída e validada.'
          }
        })
      ]);

      res.json({
        message: 'Tarefa aprovada com sucesso! Pontos concedidos.',
        submission: updatedSubmission
      });
    } else {
      // --- LÓGICA DE REPROVAÇÃO ---
      const updatedSubmission = await prisma.usuariosTarefas.update({
        where: { id: submissionId },
        data: {
          concluida: false,
          pontos_obtidos: 0,
          validado_por: adminId,
          data_validacao: new Date()
        }
      });

      res.json({
        message: 'Tarefa reprovada. O usuário pode tentar novamente.',
        submission: updatedSubmission
      });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Submissão não encontrada para atualização.' });
    }

    console.error('Erro ao validar tarefa:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    (Admin) Obter estatísticas gerais do painel administrativo
 * @access  Admin
 */
const getDashboardStats = async (req, res) => {
  try {
    // Consultas paralelas com Promise.all
    const [
      totalUsers,
      activeMissions,
      pendingSubmissions,
      totalPointsAgg
    ] = await Promise.all([
      prisma.usuarios.count({ where: { role: 'user', ativo: true } }),
      prisma.missoes.count({ where: { ativo: true } }),
      prisma.usuariosTarefas.count({
        where: {
          concluida: false,
          validado_por: null,
          NOT: { evidencias: null }
        }
      }),
      prisma.usuarios.aggregate({
        where: { role: 'user' },
        _sum: { pontos: true }
      })
    ]);

    const stats = {
      total_users: totalUsers,
      total_missions_active: activeMissions,
      pending_submissions: pendingSubmissions,
      total_points_distributed: totalPointsAgg._sum.pontos || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = {
  validateTaskSubmission,
  getDashboardStats
};
