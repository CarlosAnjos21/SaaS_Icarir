// Importa o Prisma Client de forma segura
const prismaModule = require("../config/prismaClient");
const prisma = prismaModule.prisma || prismaModule.default || prismaModule;
const { Prisma } = require('@prisma/client'); // Import necessário para tratar erros específicos

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
        // Atualiza pontos do usuário
        prisma.usuario.update({
          where: { id: submission.usuario_id },
          data: {
            pontos: { increment: pontos_concedidos }
          }
        }),
        // Log de pontos
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
    // Tratamento seguro para verificar o tipo do erro
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Submissão não encontrada para atualização.' });
    }

    console.error('Erro ao validar tarefa:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Retorna estatísticas gerais para o dashboard administrativo
 * @access  Privado (Admin)
 */
const getDashboardStats = async (req, res) => {
  try {
    if (!prisma) throw new Error("Prisma não inicializado.");

    // --- EXECUÇÃO SEQUENCIAL (AWAIT LINHA POR LINHA) ---
    // Mantida a lógica sequencial para evitar erro "MaxClientsInSessionMode" no Supabase

    // 1. Total de Usuários
    const totalUsers = await prisma.usuario.count({ 
        where: { role: 'participante', ativo: true } 
    });

    // 2. Missões Ativas
    const activeMissions = await prisma.missao.count({ 
        where: { ativa: true } 
    });

    // 3. Submissões Pendentes (Aguardando Validação)
    const pendingSubmissions = await prisma.usuarioTarefa.count({
        where: {
          concluida: false,
          validado_por: null,
          evidencias: { not: null }
        }
    });

    // 4. Total de Pontos Distribuídos
    const totalPointsAgg = await prisma.usuario.aggregate({
        where: { role: 'participante' },
        _sum: { pontos: true }
    });

    res.json({
      totalUsers,
      activeMissions,
      pendingSubmissions,
      totalPointsDistributed: totalPointsAgg._sum.pontos || 0
    });

  } catch (error) {
    console.error("Erro CRÍTICO no Dashboard:", error);
    res.status(500).json({ 
        error: "Erro ao carregar estatísticas", 
        details: error.message
    });
  }
};

module.exports = {
  validateTaskSubmission,
  getDashboardStats,
};