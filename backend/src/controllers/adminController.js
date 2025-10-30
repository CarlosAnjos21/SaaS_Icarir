const db = require('../config/db');

/**
 * @route   POST /api/admin/submissions/:submissionId/validate
 * @desc    Validar (aprovar) uma submissão de tarefa
 * @access  Admin
 * @body    { "approve": true, "pontos_concedidos": 150 }
 */
const validateTaskSubmission = async (req, res) => {
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
    const { usuario_id, tarefa_id, concluida } = submission;

    if (concluida) {
      throw new Error('Esta tarefa já foi validada anteriormente.');
    }

    if (approve) {
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
      });
    }

  } catch (error) {
    // ROLLBACK
    await client.query('ROLLBACK');
    
    if (error.message.includes('Submissão não encontrada') || error.message.includes('já foi validada')) {
      return res.status(404).json({ error: error.message });
    }
    
    console.error('Erro ao validar tarefa:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  } finally {
    client.release();
  }
};

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    (Admin) Obter estatísticas gerais para o dashboard
 * @access  Admin
 */
const getDashboardStats = async (req, res) => {
  try {
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
    ]);

    // Construímos o objeto de resposta
    const stats = {
      total_users: parseInt(usersResult.rows[0].total, 10),
      total_missions_active: parseInt(missionsResult.rows[0].total, 10),
      pending_submissions: parseInt(pendingResult.rows[0].total, 10),
      total_points_distributed: parseInt(pointsResult.rows[0].total, 10) || 0
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