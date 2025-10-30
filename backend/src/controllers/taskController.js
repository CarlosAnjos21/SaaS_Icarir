const db = require('../config/db');

/**
 * @route   GET /api/missions/:missionId/tasks
 * @desc    Listar todas as tarefas ativas de uma missão específica
 * @access  Privado
 */
const getTasksByMissionId = async (req, res) => {
  try {
    // Graças ao 'mergeParams' no router, temos acesso ao :missionId
    const { missionId } = req.params;

    // Buscamos as tarefas daquela missão, ordenadas pela coluna 'ordem'
    [cite_start]// (Com base no diagrama [cite: 116, 121, 335])
    const query = `
      SELECT * FROM tarefas
      WHERE missao_id = $1 AND ativo = true
      ORDER BY ordem ASC;
    `;
    
    const { rows } = await db.query(query, [missionId]);

    // Não é um erro se uma missão não tiver tarefas, apenas retorna um array vazio
    res.json(rows);

  } catch (error) {
    console.error('Erro ao buscar tarefas da missão:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   POST /api/missions/:missionId/tasks/:taskId/submit
 * @desc    Submeter uma tarefa para validação
 * @access  Privado
 */
const submitTask = async (req, res) => {
    const { missionId, taskId } = req.params;
    const userId = req.user.id;
    const { evidencias } = req.body;
  
    if (!evidencias) {
      return res.status(400).json({ error: 'O campo "evidencias" é obrigatório.' });
    }
  
    const client = await db.pool.connect();
  
    try {
      // INICIAR TRANSAÇÃO
      await client.query('BEGIN');
  
      // 1. Validar a Tarefa: Existe, está ativa e pertence à Missão?
      const taskResult = await client.query(
        'SELECT id FROM tarefas WHERE id = $1 AND missao_id = $2 AND ativo = true',
        [taskId, missionId]
      );
      if (taskResult.rows.length === 0) {
        throw new Error('Tarefa não encontrada, inativa ou não pertence a esta missão.');
      }
  
      // 2. Validar Inscrição: O usuário está inscrito nesta missão?
      const subResult = await client.query(
        'SELECT id FROM usuarios_missoes WHERE usuario_id = $1 AND missao_id = $2 AND status_participacao = $3',
        [userId, missionId, 'inscrito']
      );
      if (subResult.rows.length === 0) {
        throw new Error('Você não está inscrito nesta missão ou sua inscrição não está ativa.');
      }
  
      // 3. Verificar se já existe uma submissão para esta tarefa
      const existingSubmission = await client.query(
        'SELECT id, concluida, tentativas FROM usuarios_tarefas WHERE usuario_id = $1 AND tarefa_id = $2',
        [userId, taskId]
      );
  
      let submissionResult;
  
      if (existingSubmission.rows.length > 0) {
        // 3a. JÁ EXISTE - É UMA RESUBMISSÃO
  
        const submission = existingSubmission.rows[0];
        if (submission.concluida) {
          return res.status(409).json({ error: 'Esta tarefa já foi concluída e validada.' });
        }
  
        // Atualiza a submissão existente
        const newTentativas = submission.tentativas + 1;
        const updateQuery = `
          UPDATE usuarios_tarefas
          SET evidencias = $1, tentativas = $2, data_atualizacao = NOW(), 
              concluida = false, pontos_obtidos = 0, data_conclusao = null, validado_por = null
          WHERE id = $3
          RETURNING *;
        `;
        const { rows } = await client.query(updateQuery, [evidencias, newTentativas, submission.id]);
        submissionResult = rows[0];
        
      } else {
        // 3b. NÃO EXISTE - É A PRIMEIRA SUBMISSÃO
        
        const insertQuery = `
          INSERT INTO usuarios_tarefas
            (usuario_id, tarefa_id, evidencias, concluida, pontos_obtidos, tentativas, data_criacao, data_atualizacao)
          VALUES
            ($1, $2, $3, false, 0, 1, NOW(), NOW())
          RETURNING *;
        `;
        const { rows } = await client.query(insertQuery, [userId, taskId, evidencias]);
        submissionResult = rows[0];
      }
  
      // COMMIT (Confirmar a transação)
      await client.query('COMMIT');
      
      res.status(201).json({
        message: 'Tarefa submetida para validação!',
        submission: submissionResult,
      });
  
    } catch (error) {
      // ROLLBACK (Desfazer tudo em caso de erro)
      await client.query('ROLLBACK');
      
      if (error.message.includes('Tarefa não encontrada') || error.message.includes('Você não está inscrito')) {
        return res.status(403).json({ error: error.message });
      }
      
      console.error('Erro ao submeter tarefa:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
      // Liberar o cliente
      client.release();
    }
  };
  
  /**
 * @route   GET /api/missions/:missionId/tasks/:taskId
 * @desc    Buscar uma tarefa específica pelo ID
 * @access  Privado
 */
const getTaskById = async (req, res) => {
    try {
      const { missionId, taskId } = req.params;
  
      const query = `
        SELECT * FROM tarefas
        WHERE id = $1 AND missao_id = $2;
      `;
      
      const { rows } = await db.query(query, [taskId, missionId]);
  
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Tarefa não encontrada ou não pertence a esta missão.' });
      }
  
      res.json(rows[0]);
  
    } catch (error) {
      console.error('Erro ao buscar tarefa por ID:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  };
  
  // --- (ADMIN) ---
  /**
   * @route   POST /api/missions/:missionId/tasks
   * @desc    Criar uma nova tarefa para uma missão
   * @access  Admin
   */
  const createTaskForMission = async (req, res) => {
    try {
      const { missionId } = req.params;
      
      // Lista completa de campos da tabela 'tarefas'
      const {
        categoria_id,
        titulo,
        descricao,
        instrucoes,
        pontos,
        tipo,
        dificuldade,
        ordem,
        requisitos, // (JSONB?)
        tarefa_anterior_id, // (INTEGER)
      } = req.body;
  
      // Validação de campos obrigatórios (baseado no diagrama)
      if (!titulo || !pontos || !tipo || !dificuldade) {
        return res.status(400).json({ error: 'Campos obrigatórios (titulo, pontos, tipo, dificuldade) estão faltando.' });
      }
  
      const query = `
        INSERT INTO tarefas (
          missao_id, categoria_id, titulo, descricao, instrucoes, 
          pontos, tipo, dificuldade, ativo, ordem, 
          requisitos, tarefa_anterior_id, data_criacao, data_atualizacao
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
        RETURNING *;
      `;
      
      const values = [
        missionId,
        categoria_id || null, // Permite nulo
        titulo,
        descricao || null,
        instrucoes || null,
        pontos,
        tipo,
        dificuldade,
        true, // Nova tarefa começa ativa por padrão
        ordem || 0,
        requisitos || null,
        tarefa_anterior_id || null
      ];
  
      const { rows } = await db.query(query, values);
  
      res.status(201).json({
        message: 'Tarefa criada com sucesso!',
        task: rows[0],
      });
  
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      // Erro de Foreign Key (ex: missão ou categoria não existem)
      if (error.code === '23503') {
        return res.status(404).json({ error: 'ID da missão ou da categoria é inválido.' });
      }
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  };
  
  
  module.exports = {
    getTasksByMissionId,
    submitTask,
    getTaskById,          // <-- Exporta a nova função
    createTaskForMission, // <-- Exporta a nova função
  };