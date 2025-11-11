<<<<<<< HEAD
// Importa o Prisma Client
const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client'); // Para tratamento de erro
// bcrypt não é usado neste arquivo, pode ser removido
// const bcrypt = require('bcryptjs'); 
=======
const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client');
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121

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
    const submission = await prisma.usuariosTarefas.findUnique({
      where: { id: submissionId }
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submissão não encontrada.' });
    }
<<<<<<< HEAD
    const { usuario_id, tarefa_id, concluida } = submission;
=======
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121

    if (submission.concluida) {
      return res.status(400).json({ error: 'Esta tarefa já foi validada anteriormente.' });
    }

    if (approve) {
<<<<<<< HEAD
      // --- LÓGICA DE APROVAÇÃO (Transação) ---

      // Agrupamos as 3 escritas (update submissão, update usuário, create log)
      // em uma transação atômica.
      const [updatedSubmission, updatedUser, newLog] = await prisma.$transaction([
        
        // 2. Atualizar a submissão (usuarios_tarefas)
=======
      const [updatedSubmission] = await prisma.$transaction([
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
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
      const updatedSubmission = await prisma.usuariosTarefas.update({
        where: { id: submissionId },
        data: {
          concluida: false,
          pontos_obtidos: 0,
          validado_por: adminId,
          data_validacao: new Date()
        }
      });
<<<<<<< HEAD
      
      res.json({
        message: 'Tarefa reprovada. O usuário pode tentar submeter novamente.',
        submission: updatedSubmission,
=======

      return res.json({
        message: 'Tarefa reprovada. O usuário pode tentar novamente.',
        submission: updatedSubmission
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
      });
    }
  } catch (error) {
<<<<<<< HEAD
    // ROLLBACK automático se a transação falhar
    
    // Captura erros que lançamos manualmente
    if (error.message.includes('Submissão não encontrada') || error.message.includes('já foi validada')) {
      return res.status(404).json({ error: error.message });
    }
    
    // Captura erro do Prisma (ex: registro não encontrado para atualizar)
=======
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Submissão não encontrada para atualização.' });
    }

    console.error('Erro ao validar tarefa:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
<<<<<<< HEAD
  // Não precisamos mais do 'finally { client.release() }'
=======
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
};

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Obter estatísticas gerais do painel administrativo
 * @access  Admin
 */
const getDashboardStats = async (req, res) => {
  try {
<<<<<<< HEAD
    // Usamos a API de agregação do Prisma
    
    // 1. Total de usuários
    const totalUsers = prisma.usuarios.count({
      where: { role: 'user', ativo: true }
    });

    // 2. Missões ativas
    const activeMissions = prisma.missoes.count({
      where: { ativo: true }
    });

    // 3. Submissões pendentes
    const pendingSubmissions = prisma.usuariosTarefas.count({
      where: {
        concluida: false,
        validado_por: null,
        NOT: { evidencias: null } // Garante que 'evidencias' não é nulo
      }
    });

    // 4. Total de pontos distribuídos
    const totalPointsAgg = prisma.usuarios.aggregate({
      where: { role: 'user' },
      _sum: {
        pontos: true
      }
    });

    // Executamos todas em paralelo
    const [
      usersCount,
      missionsCount,
      pendingCount,
      pointsSum
    ] = await Promise.all([
      totalUsers,
      activeMissions,
      pendingSubmissions,
      totalPointsAgg
    ]);

    // Construímos o objeto de resposta
    const stats = {
      total_users: usersCount,
      total_missions_active: missionsCount,
      pending_submissions: pendingCount,
      total_points_distributed: pointsSum._sum.pontos || 0
    };

    res.json(stats);

=======
    const [totalUsers, activeMissions, pendingSubmissions, totalPointsAgg] = await Promise.all([
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

    return res.json({
      totalUsers,
      activeMissions,
      pendingSubmissions,
      totalPointsDistributed: totalPointsAgg._sum.pontos || 0
    });
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = {
  validateTaskSubmission,
  getDashboardStats
};