<<<<<<< HEAD
const db = require('../config/db');
=======
// Importa o Prisma Client
const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client'); // Para capturar erros
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5

/**
 * @route   GET /api/missions/:missionId/tasks
 * @desc    Listar todas as tarefas ativas de uma missão específica
 * @access  Privado
 */
const getTasksByMissionId = async (req, res) => {
  try {
<<<<<<< HEAD
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
=======
    const missionId = parseInt(req.params.missionId, 10);
    if (isNaN(missionId)) {
      return res.status(400).json({ error: 'ID da missão inválido.' });
    }

    // Busca as tarefas daquela missão, ordenadas pela coluna 'ordem'
    const tarefas = await prisma.tarefas.findMany({
      where: {
        missao_id: missionId,
        ativo: true
      },
      orderBy: {
        ordem: 'asc'
      }
    });

    res.json(tarefas);
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5

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
<<<<<<< HEAD
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
=======
  const missionId = parseInt(req.params.missionId, 10);
  const taskId = parseInt(req.params.taskId, 10);
  const userId = req.user.id;
  const { evidencias } = req.body;

  if (!evidencias) {
    return res.status(400).json({ error: 'O campo "evidencias" é obrigatório.' });
  }
  if (isNaN(missionId) || isNaN(taskId)) {
    return res.status(400).json({ error: 'IDs de missão ou tarefa inválidos.' });
  }
  
  try {
    // Usamos $transaction para rodar todas as validações e o upsert
    // de forma atômica (tudo ou nada), prevenindo race conditions.
    const submissionResult = await prisma.$transaction(async (tx) => {

      // 1. Validar a Tarefa (usando o cliente de transação 'tx')
      const task = await tx.tarefas.findFirst({
        where: { id: taskId, missao_id: missionId, ativo: true }
      });
      if (!task) {
        throw new Error('Tarefa não encontrada, inativa ou não pertence a esta missão.');
      }

      // 2. Validar Inscrição (usando 'tx')
      const enrollment = await tx.usuariosMissoes.findFirst({
        where: { 
          usuario_id: userId, 
          missao_id: missionId, 
          status_participacao: 'inscrito' 
        }
      });
      if (!enrollment) {
        throw new Error('Você não está inscrito nesta missão ou sua inscrição não está ativa.');
      }

      // 3. Verificar submissão existente (usando 'tx')
      const existingSubmission = await tx.usuariosTarefas.findUnique({
        where: { 
          // Usa o índice composto definido no schema.prisma
          usuario_id_tarefa_id: { usuario_id: userId, tarefa_id: taskId } 
        }
      });

      if (existingSubmission && existingSubmission.concluida) {
        // Lança um erro para acionar o ROLLBACK da transação
        throw new Error('Esta tarefa já foi concluída e validada.');
      }

      // 4. Dados para a submissão (primeira vez ou resubmissão)
      const submissionData = {
        usuario_id: userId,
        tarefa_id: taskId,
        evidencias: evidencias,
        concluida: false,
        pontos_obtidos: 0,
        data_conclusao: null,
        validado_por: null,
        tentativas: existingSubmission ? existingSubmission.tentativas + 1 : 1 // Incrementa ou define como 1
      };

      // 5. Usar UPSERT (usando 'tx')
      // Cria se não existir, atualiza se existir
      const result = await tx.usuariosTarefas.upsert({
        where: { 
          usuario_id_tarefa_id: { usuario_id: userId, tarefa_id: taskId } 
        },
        update: submissionData, // O que fazer se encontrar
        create: submissionData, // O que fazer se não encontrar
      });

      return result; // Retorna o resultado da transação
    });

    // Se $transaction for concluído, ele faz o COMMIT
    res.status(201).json({
      message: 'Tarefa submetida para validação!',
      submission: submissionResult,
    });

  } catch (error) {
    // Se $transaction falhar, ele faz o ROLLBACK
    
    // Trata os erros específicos que lançamos
    if (error.message.includes('Tarefa não encontrada') || error.message.includes('Você não está inscrito')) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('já foi concluída')) {
      return res.status(409).json({ error: error.message });
    }
    
    console.error('Erro ao submeter tarefa:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
 * @route   GET /api/missions/:missionId/tasks/:taskId
 * @desc    Buscar uma tarefa específica pelo ID
 * @access  Privado
 */
const getTaskById = async (req, res) => {
<<<<<<< HEAD
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
=======
  try {
    const missionId = parseInt(req.params.missionId, 10);
    const taskId = parseInt(req.params.taskId, 10);
    
    if (isNaN(missionId) || isNaN(taskId)) {
      return res.status(400).json({ error: 'IDs de missão ou tarefa inválidos.' });
    }

    const tarefa = await prisma.tarefas.findFirst({
      where: {
        id: taskId,
        missao_id: missionId
      }
    });

    if (!tarefa) {
      return res.status(404).json({ error: 'Tarefa não encontrada ou não pertence a esta missão.' });
    }

    res.json(tarefa);

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
    const missionId = parseInt(req.params.missionId, 10);
    if (isNaN(missionId)) {
      return res.status(400).json({ error: 'ID da missão inválido.' });
    }

    const {
      categoria_id,
      titulo,
      descricao,
      instrucoes,
      pontos,
      tipo,
      dificuldade,
      ordem,
      requisitos,
      tarefa_anterior_id,
    } = req.body;

    if (!titulo || !pontos || !tipo || !dificuldade) {
      return res.status(400).json({ error: 'Campos obrigatórios (titulo, pontos, tipo, dificuldade) estão faltando.' });
    }

    const newTask = await prisma.tarefas.create({
      data: {
        missao_id: missionId,
        categoria_id: categoria_id ? parseInt(categoria_id, 10) : null,
        titulo: titulo,
        descricao: descricao || null,
        instrucoes: instrucoes || null,
        pontos: parseInt(pontos, 10), // Garante que é um número
        tipo: tipo,
        dificuldade: dificuldade,
        ativo: true, // Padrão
        ordem: ordem ? parseInt(ordem, 10) : 0,
        requisitos: requisitos || Prisma.JsonNull, // Usa Prisma.JsonNull para JSON
        tarefa_anterior_id: tarefa_anterior_id ? parseInt(tarefa_anterior_id, 10) : null
      }
    });
    
    res.status(201).json({
      message: 'Tarefa criada com sucesso!',
      task: newTask,
    });

  } catch (error) {
    // Erro de Foreign Key (ex: missão ou categoria não existem)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return res.status(404).json({ error: 'ID da missão ou da categoria é inválido.' });
    }
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};


module.exports = {
  getTasksByMissionId,
  submitTask,
  getTaskById,
  createTaskForMission,
};
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
