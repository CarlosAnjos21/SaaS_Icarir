<<<<<<< HEAD
const db = require('../config/db');

/**
 * @route   GET /api/quizzes/:quizId
 * @desc    (Usuário) Buscar um quiz e suas perguntas
=======
// Importa o Prisma Client
const prisma = require('../config/prismaClient');

/**
 * @route   GET /api/quizzes/:quizId
 * @desc    (Usuário) Buscar um quiz e suas perguntas (sem as respostas)
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
 * @access  Privado
 */
const getQuizForUser = async (req, res) => {
  try {
<<<<<<< HEAD
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
=======
    const quizId = parseInt(req.params.quizId, 10);
    if (isNaN(quizId)) {
      return res.status(400).json({ error: 'ID do Quiz inválido.' });
    }

    // 1. Buscar o Quiz e suas perguntas (substitui as 2 queries)
    const quiz = await prisma.quizzes.findUnique({
      where: { id: quizId, ativo: true },
      select: {
        id: true,
        titulo: true,
        descricao: true,
        imagem_url: true,
        // Inclui as perguntas, selecionando os campos
        perguntas: {
          select: {
            id: true,
            enunciado: true,
            tipo: true,
            ordem: true,
            opcoes: true // Traz o JSON 'opcoes' completo
          },
          orderBy: {
            ordem: 'asc'
          }
        }
      }
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz não encontrado ou inativo.' });
    }
    
    // 2. Filtrar as respostas corretas do JSON 'opcoes'
    // Movemos a lógica do SQL para o JavaScript
    const filteredQuestions = quiz.perguntas.map(q => {
      // 'opcoes' é um array de objetos, ex: [{ text: "A", isCorrect: true }]
      // Removemos a chave 'isCorrect' de cada objeto no array
      const filteredOptions = q.opcoes.map(option => {
        const { isCorrect, ...rest } = option; // Remove 'isCorrect'
        return rest; // Retorna o objeto sem a chave 'isCorrect'
      });
      
      return { ...q, opcoes: filteredOptions };
    });

    const response = { ...quiz, perguntas: filteredQuestions };
    res.json(response);
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5

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
<<<<<<< HEAD
  const { quizId } = req.params;
=======
  const quizId = parseInt(req.params.quizId, 10);
  if (isNaN(quizId)) {
    return res.status(400).json({ error: 'ID do Quiz inválido.' });
  }

>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
  const userId = req.user.id;
  const { answers } = req.body; // Array de { pergunta_id, resposta }

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'O array "answers" é obrigatório.' });
  }

<<<<<<< HEAD
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
=======
  try {
    // Usamos $transaction para garantir que TODAS as operações
    // falhem ou tenham sucesso juntas.
    const result = await prisma.$transaction(async (tx) => {

      // 1. Buscar o Quiz e sua Tarefa associada (usando o cliente de transação 'tx')
      const quiz = await tx.quizzes.findFirstOrThrow({
        where: { id: quizId, ativo: true },
        select: { id: true, tarefa_id: true }
      });
      const { tarefa_id } = quiz;

      // 2. Buscar as PERGUNTAS COM as respostas corretas
      const questions = await tx.perguntasQuiz.findMany({
        where: { quiz_id: quizId },
        select: { id: true, opcoes: true }
      });
      
      const correctAnswersMap = new Map();
      questions.forEach(q => {
        // Encontra a opção correta dentro do JSON 'opcoes'
        const correctOption = q.opcoes.find(opt => opt.isCorrect === true);
        correctAnswersMap.set(q.id, correctOption ? correctOption.text : null);
      });

      // 3. Validar se o usuário já completou esta tarefa
      let taskPoints = 0;
      if (tarefa_id) {
        const tarefa = await tx.tarefas.findUnique({
          where: { id: tarefa_id },
          select: { pontos: true }
        });
        taskPoints = tarefa ? tarefa.pontos : 0;

        const existingSub = await tx.usuariosTarefas.findUnique({
          where: { 
            usuario_id_tarefa_id: { usuario_id: userId, tarefa_id: tarefa_id }
          },
          select: { concluida: true }
        });

        if (existingSub && existingSub.concluida) {
          throw new Error('Você já completou este quiz/tarefa.');
        }
      }

      // 4. Corrigir e Salvar as respostas (dentro da transação)
      let totalCorrect = 0;
      const submissionResults = [];
      
      for (const answer of answers) {
        const { pergunta_id, resposta } = answer;
        const isCorrect = correctAnswersMap.get(pergunta_id) === resposta;

        if (isCorrect) {
          totalCorrect++;
        }

        const newAnswer = await tx.respostasQuizzes.create({
          data: {
            usuario_id: userId,
            pergunta_id: pergunta_id,
            resposta: resposta,
            correta: isCorrect,
            // data_resposta é default(now())
          },
          select: { id: true, pergunta_id: true, resposta: true, correta: true }
        });
        submissionResults.push(newAnswer);
      }
      
      // 5. Verificar se passou (100% de acerto) e conceder pontos
      let finalMessage = `Quiz submetido. Você acertou ${totalCorrect} de ${correctAnswersMap.size}.`;
      
      if (tarefa_id && totalCorrect === correctAnswersMap.size) {
        finalMessage = `Parabéns! Você acertou todas e ganhou ${taskPoints} pontos!`;

        // 5a. Inserir/Atualizar 'usuarios_tarefas' (UPSERT)
        await tx.usuariosTarefas.upsert({
          where: { 
            usuario_id_tarefa_id: { usuario_id: userId, tarefa_id: tarefa_id }
          },
          create: {
            usuario_id: userId,
            tarefa_id: tarefa_id,
            concluida: true,
            pontos_obtidos: taskPoints,
            data_conclusao: new Date(),
          },
          update: {
            concluida: true,
            pontos_obtidos: taskPoints,
            data_conclusao: new Date(),
          }
        });

        // 5b. Atualizar 'usuarios' (incremento atômico)
        await tx.usuarios.update({
          where: { id: userId },
          data: {
            pontos: { increment: taskPoints }
          }
        });

        // 5c. Inserir 'logs_pontos'
        await tx.logsPontos.create({
          data: {
            usuario_id: userId,
            tarefa_id: tarefa_id,
            pontos: taskPoints,
            tipo: 'ganho_quiz',
            descricao: 'Quiz concluído com 100% de acerto.'
          }
        });
      }
      
      // Retorna os dados de dentro da transação
      return {
        message: finalMessage,
        score: {
          correct: totalCorrect,
          total: correctAnswersMap.size,
        },
        results: submissionResults,
      };
    }); // FIM DO PRISMA TRANSACTION (Commit automático)

    // Se a transação foi bem-sucedida, 'result' conterá o retorno
    res.status(200).json(result);

  } catch (error) {
    // Se a transação falhar, o Prisma faz o ROLLBACK
    if (error.message.includes('Quiz não encontrado') || error.message.includes('Você já completou')) {
      return res.status(409).json({ error: error.message });
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
    }
    
    console.error('Erro ao submeter quiz:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
<<<<<<< HEAD
  } finally {
    client.release();
  }
=======
  }
  // Não precisamos mais do 'finally { client.release() }'
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
};


module.exports = {
  getQuizForUser,
  submitQuiz,
};