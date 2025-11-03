<<<<<<< HEAD
const db = require('../config/db');
=======
// Importa o Prisma Client
const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client'); // Para tratamento de erro
// bcrypt não é usado neste arquivo, pode ser removido
// const bcrypt = require('bcryptjs'); 
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5

/**
 * @route   POST /api/admin/submissions/:submissionId/validate
 * @desc    Validar (aprovar) uma submissão de tarefa
 * @access  Admin
 * @body    { "approve": true, "pontos_concedidos": 150 }
 */
const validateTaskSubmission = async (req, res) => {
<<<<<<< HEAD
  const { submissionId } = req.params;
  const adminId = req.user.id; // ID do admin logado
  const { approve, pontos_concedidos } = req.body;

  if (typeof approve !== 'boolean' || (approve && typeof pontos_concedidos !== 'number')) {
    return res.status(400).json({ error: 'Body inválido. Forneça "approve" (boolean) e "pontos_concedidos" (number, se aprovado).' });
  }

  const client = await db.pool.connect();

  try {
    // INICIAR TRANSAÇÃO
    await client.query('BEGIN');

    // 1. Encontrar a submissão (usuarios_tarefas)
    const subResult = await client.query(
      'SELECT * FROM usuarios_tarefas WHERE id = $1',
      [submissionId]
    );

    if (subResult.rows.length === 0) {
      throw new Error('Submissão não encontrada.');
    }
    const submission = subResult.rows[0];
=======
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
    // 1. Encontrar a submissão (usuarios_tarefas)
    const submission = await prisma.usuariosTarefas.findUnique({
      where: { id: submissionId }
    });

    if (!submission) {
      throw new Error('Submissão não encontrada.');
    }
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
    const { usuario_id, tarefa_id, concluida } = submission;

    if (concluida) {
      throw new Error('Esta tarefa já foi validada anteriormente.');
    }

    if (approve) {
<<<<<<< HEAD
      // --- LÓGICA DE APROVAÇÃO ---

      // 2. Atualizar a submissão (usuarios_tarefas)
      const updateSubQuery = `
        UPDATE usuarios_tarefas
        SET concluida = true,
            pontos_obtidos = $1,
            validado_por = $2,
            data_validacao = NOW(),
            data_conclusao = NOW(),
            data_atualizacao = NOW()
        WHERE id = $3
        RETURNING *;
      `;
      const updatedSubmission = await client.query(updateSubQuery, [pontos_concedidos, adminId, submissionId]);

      // 3. Adicionar os pontos ao usuário (usuarios)
      const updateUserQuery = `
        UPDATE usuarios
        SET pontos = pontos + $1,
            data_atualizacao = NOW()
        WHERE id = $2;
      `;
      await client.query(updateUserQuery, [pontos_concedidos, usuario_id]);

      // 4. Registrar a transação no 'logs_pontos' (com base no seu diagrama)
      const logQuery = `
        INSERT INTO logs_pontos
          (usuario_id, tarefa_id, pontos, tipo, descricao, data_criacao)
        VALUES
          ($1, $2, $3, $4, $5, NOW());
      `;
      await client.query(logQuery, [usuario_id, tarefa_id, pontos_concedidos, 'ganho_tarefa', 'Tarefa concluída e validada.']);
      
      // COMMIT
      await client.query('COMMIT');
      res.json({
        message: 'Tarefa aprovada com sucesso! Pontos concedidos.',
        submission: updatedSubmission.rows[0],
      });

    } else {
      // --- LÓGICA DE REPROVAÇÃO ---

      const updateSubQuery = `
        UPDATE usuarios_tarefas
        SET concluida = false, -- Garante que está como não concluída
            pontos_obtidos = 0,
            validado_por = $1,
            data_validacao = NOW(), -- Data da *tentativa* de validação
            data_atualizacao = NOW()
        WHERE id = $2
        RETURNING *;
      `;
      const updatedSubmission = await client.query(updateSubQuery, [adminId, submissionId]);
      
      // COMMIT
      await client.query('COMMIT');
      res.json({
        message: 'Tarefa reprovada. O usuário pode tentar submeter novamente.',
        submission: updatedSubmission.rows[0],
=======
      // --- LÓGICA DE APROVAÇÃO (Transação) ---

      // Agrupamos as 3 escritas (update submissão, update usuário, create log)
      // em uma transação atômica.
      const [updatedSubmission, updatedUser, newLog] = await prisma.$transaction([
        
        // 2. Atualizar a submissão (usuarios_tarefas)
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

        // 3. Adicionar os pontos ao usuário (usuarios)
        prisma.usuarios.update({
          where: { id: usuario_id },
          data: {
            pontos: { increment: pontos_concedidos } // Operação atômica
          }
        }),

        // 4. Registrar a transação no 'logs_pontos'
        prisma.logsPontos.create({
          data: {
            usuario_id: usuario_id,
            tarefa_id: tarefa_id,
            pontos: pontos_concedidos,
            tipo: 'ganho_tarefa',
            descricao: 'Tarefa concluída e validada.'
          }
        })
      ]);
      
      // COMMIT automático se a transação for bem-sucedida
      res.json({
        message: 'Tarefa aprovada com sucesso! Pontos concedidos.',
        submission: updatedSubmission,
      });

    } else {
      // --- LÓGICA DE REPROVAÇÃO (Operação Única) ---

      const updatedSubmission = await prisma.usuariosTarefas.update({
        where: { id: submissionId },
        data: {
          concluida: false,
          pontos_obtidos: 0,
          validado_por: adminId,
          data_validacao: new Date(),
        }
      });
      
      res.json({
        message: 'Tarefa reprovada. O usuário pode tentar submeter novamente.',
        submission: updatedSubmission,
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
      });
    }

  } catch (error) {
<<<<<<< HEAD
    // ROLLBACK
    await client.query('ROLLBACK');
    
=======
    // ROLLBACK automático se a transação falhar
    
    // Captura erros que lançamos manualmente
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
    if (error.message.includes('Submissão não encontrada') || error.message.includes('já foi validada')) {
      return res.status(404).json({ error: error.message });
    }
    
<<<<<<< HEAD
    console.error('Erro ao validar tarefa:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  } finally {
    client.release();
  }
=======
    // Captura erro do Prisma (ex: registro não encontrado para atualizar)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Submissão não encontrada.' });
    }
    
    console.error('Erro ao validar tarefa:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
  // Não precisamos mais do 'finally { client.release() }'
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
};

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    (Admin) Obter estatísticas gerais para o dashboard
 * @access  Admin
 */
const getDashboardStats = async (req, res) => {
  try {
<<<<<<< HEAD
    // Definimos todas as consultas
    const queryTotalUsers = "SELECT COUNT(id) AS total FROM usuarios WHERE role = 'user' AND ativo = true";
    const queryActiveMissions = "SELECT COUNT(id) AS total FROM missoes WHERE ativo = true";
    const queryPendingSubmissions = "SELECT COUNT(id) AS total FROM usuarios_tarefas WHERE concluida = false AND validado_por IS NULL AND evidencias IS NOT NULL";
    const queryTotalPoints = "SELECT SUM(pontos) AS total FROM usuarios WHERE role = 'user'";

    // Executamos todas em paralelo para máxima performance
    const [
      usersResult,
      missionsResult,
      pendingResult,
      pointsResult
    ] = await Promise.all([
      db.query(queryTotalUsers),
      db.query(queryActiveMissions),
      db.query(queryPendingSubmissions),
      db.query(queryTotalPoints)
=======
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
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
    ]);

    // Construímos o objeto de resposta
    const stats = {
<<<<<<< HEAD
      total_users: parseInt(usersResult.rows[0].total, 10),
      total_missions_active: parseInt(missionsResult.rows[0].total, 10),
      pending_submissions: parseInt(pendingResult.rows[0].total, 10),
      total_points_distributed: parseInt(pointsResult.rows[0].total, 10) || 0
=======
      total_users: usersCount,
      total_missions_active: missionsCount,
      pending_submissions: pendingCount,
      total_points_distributed: pointsSum._sum.pontos || 0
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
    };

    res.json(stats);

  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};


module.exports = {
  validateTaskSubmission,
  getDashboardStats,
};