const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client');

/**
 * @route   POST /api/admin/submissions/:submissionId/validate
 * @desc    Validar (aprovar ou reprovar) uma submissão de tarefa
 * @access  Admin
 */
const validateTaskSubmission = async (req, res) => {
  const submissionId = parseInt(req.params.submissionId, 10);
  if (isNaN(submissionId)) {
    return res.status(400).json({ error: 'ID de submissão inválido.' });
  }

  const adminId = req.user?.id;
  const { approve, pontos_concedidos } = req.body;

  if (typeof approve !== 'boolean') {
    return res.status(400).json({ error: 'O campo "approve" deve ser booleano.' });
  }

  if (approve && (typeof pontos_concedidos !== 'number' || pontos_concedidos < 0)) {
    return res.status(400).json({ error: 'Se aprovado, "pontos_concedidos" deve ser um número maior ou igual a 0.' });
  }

  try {
    const submission = await prisma.usuarioTarefa.findUnique({
      where: { id: submissionId }
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submissão não encontrada.' });
    }

    if (submission.concluida) {
      return res.status(400).json({ error: 'Esta tarefa já foi validada anteriormente.' });
    }

    if (approve) {
      const [updatedSubmission] = await prisma.$transaction([
        prisma.usuarioTarefa.update({
          where: { id: submissionId },
          data: {
            concluida: true,
            pontos_obtidos: pontos_concedidos,
            validado_por: adminId,
            data_validacao: new Date(),
            data_conclusao: new Date()
          }
        }),
        prisma.usuarios.update({
          where: { id: submission.usuario_id },
          data: {
            pontos: { increment: pontos_concedidos }
          }
        }),
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

      return res.json({
        message: 'Tarefa aprovada com sucesso! Pontos concedidos.',
        submission: updatedSubmission
      });
    } else {
      const updatedSubmission = await prisma.usuarioTarefa.update({
        where: { id: submissionId },
        data: {
          concluida: false,
          pontos_obtidos: 0,
          validado_por: adminId,
          data_validacao: new Date()
        }
      });

      return res.json({
        message: 'Tarefa reprovada. O usuário pode tentar novamente.',
        submission: updatedSubmission
      });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Submissão não encontrada para atualização.' });
    }

    console.error('Erro ao validar tarefa:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Obter estatísticas gerais do painel administrativo
 * @access  Admin
 */
const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, activeMissions, pendingSubmissions, totalPointsAgg] = await Promise.all([
      prisma.usuarios.count({ where: { role: 'user', ativo: true } }),
      prisma.missao.count({ where: { ativo: true } }),
      prisma.usuarioTarefa.count({
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

    return res.json({
      totalUsers,
      activeMissions,
      pendingSubmissions,
      totalPointsDistributed: totalPointsAgg._sum.pontos || 0
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = {
  validateTaskSubmission,
  getDashboardStats
};