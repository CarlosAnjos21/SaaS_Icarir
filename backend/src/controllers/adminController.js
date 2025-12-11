// Importa o Prisma Client de forma segura
const prismaModule = require("../config/prismaClient");
const prisma = prismaModule.prisma || prismaModule.default || prismaModule;
const { Prisma } = require('@prisma/client'); 

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Retorna estatísticas gerais para o dashboard
 */
const getDashboardStats = async (req, res) => {
  try {
    // 1. Total de Usuários (Participantes ativos)
    const totalUsers = await prisma.usuario.count({
      where: { 
        role: 'participante', 
        ativo: true 
      }
    });

    // 2. Total de Missões Ativas
    const totalMissions = await prisma.missao.count({
      where: { ativa: true }
    });

    // 3. Total de Missões/Tarefas Concluídas
    // Contamos quantas vezes usuários concluíram tarefas como proxy de "missões concluídas" ou engajamento
    const completedMissions = await prisma.usuarioTarefa.count({
        where: { concluida: true }
    });

    // 4. Top Usuário (Maior Pontuação)
    const topUser = await prisma.usuario.findFirst({
      where: { 
        role: 'participante', 
        ativo: true 
      },
      orderBy: { 
        pontos: 'desc' 
      },
      select: {
        nome: true,
        pontos: true
      }
    });

    // 5. Cálculo da Taxa de Conclusão (Estimativa Simples)
    // Evita divisão por zero
    let averageCompletion = 0;
    // Se houver tarefas concluídas e usuários, calculamos uma média arbitrária para exibir
    // (Lógica real dependeria do total de tarefas possíveis vs concluídas)
    if (totalUsers > 0 && totalMissions > 0) {
        const totalTarefasPossiveis = totalUsers * totalMissions * 5; // Estima 5 tarefas por missão
        if (totalTarefasPossiveis > 0) {
             averageCompletion = Math.round((completedMissions / totalTarefasPossiveis) * 100);
             if (averageCompletion > 100) averageCompletion = 100;
        }
    }

    // Monta o JSON final
    res.json({
      totalUsers,
      totalMissions,
      completedMissions, 
      averageCompletion,
      topUser: topUser || { name: 'Nenhum', points: 0 }
    });

  } catch (error) {
    console.error("Erro no Dashboard:", error);
    res.status(500).json({ error: "Erro ao carregar estatísticas" });
  }
};

/**
 * @route   POST /api/admin/submissions/:submissionId/validate
 * @desc    Validar submissão (Aprovar/Reprovar)
 */
const validateTaskSubmission = async (req, res) => {
  const submissionId = parseInt(req.params.submissionId, 10);
  const adminId = req.user?.id;
  const { approve, pontos_concedidos } = req.body;

  try {
    const submission = await prisma.usuarioTarefa.findUnique({
      where: { id: submissionId }
    });

    if (!submission) return res.status(404).json({ error: 'Submissão não encontrada.' });

    if (approve) {
      await prisma.$transaction([
        prisma.usuarioTarefa.update({
          where: { id: submissionId },
          data: {
            concluida: true,
            pontos_obtidos: pontos_concedidos || 0,
            validado_por: adminId,
            data_validacao: new Date()
          }
        }),
        prisma.usuario.update({
          where: { id: submission.usuario_id },
          data: { pontos: { increment: pontos_concedidos || 0 } }
        })
      ]);
      res.json({ message: 'Aprovado com sucesso.' });
    } else {
      await prisma.usuarioTarefa.update({
        where: { id: submissionId },
        data: {
          concluida: false,
          pontos_obtidos: 0,
          validado_por: adminId,
          data_validacao: new Date()
        }
      });
      res.json({ message: 'Reprovado.' });
    }
  } catch (error) {
    console.error('Erro na validação:', error);
    res.status(500).json({ error: 'Erro ao validar.' });
  }
};

/**
 * @route   GET /api/admin/users
 * @desc    Listar todos os usuários (Adicionado para corrigir o modal)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        foto_url: true,
        role: true,
        ativo: true
      },
      orderBy: { nome: 'asc' }
    });
    res.json(users);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    res.status(500).json({ error: "Erro ao buscar usuários." });
  }
};

module.exports = {
  getDashboardStats,
  validateTaskSubmission,
  getAllUsers // Exportando a nova função
};