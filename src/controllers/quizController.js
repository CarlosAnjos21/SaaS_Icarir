const db = require('../config/db');

/**
 * @route   GET /api/quizzes/:quizId
 * @desc    (Usuário) Buscar um quiz e suas perguntas
 * @access  Privado
 */
const getQuizForUser = async (req, res) => {
  try {
    const { quizId } = req.params;

    // 1. Buscar o Quiz
    const quizResult = await db.query(
      'SELECT id, titulo, descricao, imagem_url FROM quizzes WHERE id = $1 AND ativo = true',
      [quizId]
    );

    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz não encontrado ou inativo.' });
    }
    const quiz = quizResult.rows[0];

    // 2. Buscar as perguntas, mas SEM as respostas corretas
    // O campo 'opcoes' deve ser filtrado.
    // Assumindo que 'opcoes' é um JSON: [{"text": "A"}, {"text": "B"}]
    const questionsResult = await db.query(
      `SELECT 
         id, 
         enunciado, 
         tipo, 
         ordem,
         -- Transforma o JSON 'opcoes', remove 'isCorrect' de cada opção
         (SELECT jsonb_agg(
                   opcao - 'isCorrect' -- Remove a chave 'isCorrect'
                 ) 
          FROM jsonb_array_elements(opcoes) AS opcao
         ) AS opcoes_filtradas
       FROM perguntas_quiz 
       WHERE quiz_id = $1 
       ORDER BY ordem ASC`,
      [quizId]
    );

    quiz.questions = questionsResult.rows.map(q => ({
      ...q,
      opcoes: q.opcoes_filtradas // Renomeia para 'opcoes' para o frontend
    }));

    res.json(quiz);

  } catch (error) {
    console.error('Erro ao buscar quiz:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   POST /api/quizzes/:quizId/submit
 * @desc    (Usuário) Submeter respostas de um quiz
 * @access  Privado
 * @body    { "answers": [{ "pergunta_id": 1, "resposta": "texto da resposta" }] }
 */
const submitQuiz = async (req, res) => {
  const { quizId } = req.params;
  const userId = req.user.id;
  const { answers } = req.body; // Array de { pergunta_id, resposta }

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'O array "answers" é obrigatório.' });
  }

  const client = await db.pool.connect();

  try {
    // INICIAR TRANSAÇÃO
    await client.query('BEGIN');

    // 1. Buscar o Quiz e sua Tarefa associada
    const quizResult = await client.query(
      'SELECT id, tarefa_id FROM quizzes WHERE id = $1 AND ativo = true',
      [quizId]
    );
    if (quizResult.rows.length === 0) {
      throw new Error('Quiz não encontrado ou inativo.');
    }
    const { tarefa_id } = quizResult.rows[0];

    // 2. Buscar as PERGUNTAS COM as respostas corretas (do banco)
    const questionsResult = await client.query(
      'SELECT id, opcoes FROM perguntas_quiz WHERE quiz_id = $1',
      [quizId]
    );
    const correctAnswersMap = new Map();
    questionsResult.rows.forEach(q => {
      // Encontra a opção correta dentro do JSON 'opcoes'
      const correctOption = q.opcoes.find(opt => opt.isCorrect === true);
      correctAnswersMap.set(q.id, correctOption ? correctOption.text : null);
    });

    // 3. Validar se o usuário já completou esta tarefa (se houver tarefa)
    let taskPoints = 0;
    if (tarefa_id) {
      const taskResult = await client.query(
        'SELECT pontos FROM tarefas WHERE id = $1', [tarefa_id]
      );
      taskPoints = taskResult.rows.length > 0 ? taskResult.rows[0].pontos : 0;

      const existingSub = await client.query(
        'SELECT id, concluida FROM usuarios_tarefas WHERE usuario_id = $1 AND tarefa_id = $2',
        [userId, tarefa_id]
      );
      if (existingSub.rows.length > 0 && existingSub.rows[0].concluida) {
        throw new Error('Você já completou este quiz/tarefa.');
      }
    }

    // 4. Corrigir e Salvar as respostas
    let totalCorrect = 0;
    const submissionResults = [];
    
    for (const answer of answers) {
      const { pergunta_id, resposta } = answer;
      const isCorrect = correctAnswersMap.get(pergunta_id) === resposta;

      if (isCorrect) {
        totalCorrect++;
      }

      const { rows } = await client.query(
        `INSERT INTO respostas_quizzes 
           (usuario_id, pergunta_id, resposta, correta, data_resposta)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id, pergunta_id, resposta, correta`,
        [userId, pergunta_id, resposta, isCorrect]
      );
      submissionResults.push(rows[0]);
    }
    
    // 5. Verificar se passou (100% de acerto) e conceder pontos
    let finalMessage = 'Quiz submetido. Você acertou ' + totalCorrect + ' de ' + correctAnswersMap.size + '.';
    
    if (tarefa_id && totalCorrect === correctAnswersMap.size) {
      // ACERTOU TUDO!
      finalMessage = `Parabéns! Você acertou todas e ganhou ${taskPoints} pontos!`;

      // 5a. Inserir/Atualizar 'usuarios_tarefas'
      await client.query(
        `INSERT INTO usuarios_tarefas
           (usuario_id, tarefa_id, concluida, pontos_obtidos, data_conclusao, data_criacao, data_atualizacao)
         VALUES ($1, $2, true, $3, NOW(), NOW(), NOW())
         ON CONFLICT (usuario_id, tarefa_id) DO UPDATE SET
           concluida = EXCLUDED.concluida,
           pontos_obtidos = EXCLUDED.pontos_obtidos,
           data_conclusao = EXCLUDED.data_conclusao,
           data_atualizacao = NOW();`,
        [userId, tarefa_id, taskPoints]
      );

      // 5b. Atualizar 'usuarios'
      await client.query(
        'UPDATE usuarios SET pontos = pontos + $1, data_atualizacao = NOW() WHERE id = $2',
        [taskPoints, userId]
      );

      // 5c. Inserir 'logs_pontos'
      await client.query(
        'INSERT INTO logs_pontos (usuario_id, tarefa_id, pontos, tipo, descricao, data_criacao) VALUES ($1, $2, $3, $4, $5, NOW())',
        [userId, tarefa_id, taskPoints, 'ganho_quiz', 'Quiz concluído com 100% de acerto.']
      );
    }

    // COMMIT
    await client.query('COMMIT');
    
    res.status(200).json({
      message: finalMessage,
      score: {
        correct: totalCorrect,
        total: correctAnswersMap.size,
      },
      results: submissionResults,
    });

  } catch (error) {
    // ROLLBACK
    await client.query('ROLLBACK');
    
    if (error.message.includes('Quiz não encontrado') || error.message.includes('Você já completou')) {
      return res.status(409).json({ error: error.message }); // 409 Conflict
    }
    
    console.error('Erro ao submeter quiz:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  } finally {
    client.release();
  }
};


module.exports = {
  getQuizForUser,
  submitQuiz,
};