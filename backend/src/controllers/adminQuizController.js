const db = require('../config/db');

// --- CRUD DE QUIZZES ---

/**
 * @route   POST /api/admin/quizzes
 * @desc    (Admin) Criar um novo quiz
 * @access  Admin
 * @body    { "tarefa_id": 1, "titulo": "Quiz de Segurança", "descricao": "..." }
 */
const createQuiz = async (req, res) => {
  // Campos da tabela 'quizzes'
  const { tarefa_id, titulo, descricao, imagem_url, empresa_nome, ativo } = req.body;

  if (!tarefa_id || !titulo) {
    return res.status(400).json({ error: 'Os campos "tarefa_id" e "titulo" são obrigatórios.' });
  }

  try {
    const query = `
      INSERT INTO quizzes (
        tarefa_id, titulo, descricao, imagem_url, empresa_nome, ativo, data_criacao
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *;
    `;
    const values = [
      tarefa_id,
      titulo,
      descricao || null,
      imagem_url || null,
      empresa_nome || null,
      ativo || true
    ];

    const { rows } = await db.query(query, values);
    res.status(201).json({ message: 'Quiz criado com sucesso!', quiz: rows[0] });

  } catch (error) {
    console.error('Erro ao criar quiz:', error);
    if (error.code === '23503') { // Foreign key violation
      return res.status(404).json({ error: 'A tarefa (tarefa_id) especificada não existe.' });
    }
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   GET /api/admin/quizzes
 * @desc    (Admin) Listar todos os quizzes
 * @access  Admin
 */
const getAllQuizzes = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM quizzes ORDER BY data_criacao DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar quizzes:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   GET /api/admin/quizzes/:quizId
 * @desc    (Admin) Buscar um quiz específico (e suas perguntas)
 * @access  Admin
 */
const getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    // Busca o Quiz
    const quizResult = await db.query('SELECT * FROM quizzes WHERE id = $1', [quizId]);
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz não encontrado.' });
    }
    
    // Busca as Perguntas
    const questionsResult = await db.query(
      'SELECT * FROM perguntas_quiz WHERE quiz_id = $1 ORDER BY ordem ASC',
      [quizId]
    );

    res.json({
      ...quizResult.rows[0],
      perguntas: questionsResult.rows
    });

  } catch (error) {
    console.error('Erro ao buscar quiz por ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   PUT /api/admin/quizzes/:quizId
 * @desc    (Admin) Atualizar um quiz
 * @access  Admin
 */
const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { tarefa_id, titulo, descricao, imagem_url, empresa_nome, ativo } = req.body;

    if (!tarefa_id || !titulo) {
      return res.status(400).json({ error: 'Os campos "tarefa_id" e "titulo" são obrigatórios.' });
    }

    const query = `
      UPDATE quizzes
      SET tarefa_id = $1, titulo = $2, descricao = $3, imagem_url = $4, 
          empresa_nome = $5, ativo = $6
      WHERE id = $7
      RETURNING *;
    `;
    const values = [tarefa_id, titulo, descricao, imagem_url, empresa_nome, ativo, quizId];
    
    const { rows } = await db.query(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Quiz não encontrado para atualizar.' });
    }
    
    res.json({ message: 'Quiz atualizado com sucesso!', quiz: rows[0] });

  } catch (error)
 {
    console.error('Erro ao atualizar quiz:', error);
    if (error.code === '23503') {
      return res.status(404).json({ error: 'A tarefa (tarefa_id) especificada não existe.' });
    }
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   DELETE /api/admin/quizzes/:quizId
 * @desc    (Admin) Desativar (soft delete) um quiz
 * @access  Admin
 */
const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    // Soft delete (apenas desativa)
    const { rows } = await db.query(
      'UPDATE quizzes SET ativo = false WHERE id = $1 RETURNING *',
      [quizId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Quiz não encontrado.' });
    }
    
    res.json({ message: 'Quiz desativado com sucesso!', quiz: rows[0] });

  } catch (error) {
    console.error('Erro ao deletar quiz:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};


// --- CRUD DE PERGUNTAS_QUIZ (Aninhado) ---

/**
 * @route   POST /api/admin/quizzes/:quizId/questions
 * @desc    (Admin) Criar uma nova pergunta para um quiz
 * @access  Admin
 * @body    { "enunciado": "...", "tipo": "multipla_escolha", "resposta_correta": "...", "opcoes": [...] }
 */
const createQuestionForQuiz = async (req, res) => {
  const { quizId } = req.params;
  // Campos da tabela 'perguntas_quiz'
  const { enunciado, tipo, opcoes, resposta_correta, explicacao, ordem } = req.body;

  if (!enunciado || !tipo || !resposta_correta) {
    return res.status(400).json({ error: 'Campos "enunciado", "tipo" e "resposta_correta" são obrigatórios.' });
  }

  try {
    const query = `
      INSERT INTO perguntas_quiz (
        quiz_id, enunciado, tipo, opcoes, resposta_correta, explicacao, ordem, data_criacao
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *;
    `;
    const values = [
      quizId,
      enunciado,
      tipo,
      opcoes || null, // 'opcoes' pode ser um JSON/TEXT
      resposta_correta,
      explicacao || null,
      ordem || 0
    ];
    
    const { rows } = await db.query(query, values);
    res.status(201).json({ message: 'Pergunta criada com sucesso!', question: rows[0] });

  } catch (error) {
    console.error('Erro ao criar pergunta:', error);
    if (error.code === '23503') { // Foreign key violation
      return res.status(404).json({ error: 'O quiz (quiz_id) especificado não existe.' });
    }
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   GET /api/admin/quizzes/:quizId/questions
 * @desc    (Admin) Listar todas as perguntas de um quiz
 * @access  Admin
 */
const getQuestionsForQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    // Apenas verifica se o quiz existe
    const quizCheck = await db.query('SELECT id FROM quizzes WHERE id = $1', [quizId]);
    if (quizCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz não encontrado.' });
    }

    const { rows } = await db.query(
      'SELECT * FROM perguntas_quiz WHERE quiz_id = $1 ORDER BY ordem ASC',
      [quizId]
    );
    res.json(rows);
    
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   PUT /api/admin/quizzes/:quizId/questions/:questionId
 * @desc    (Admin) Atualizar uma pergunta
 * @access  Admin
 */
const updateQuestion = async (req, res) => {
  try {
    const { quizId, questionId } = req.params;
    const { enunciado, tipo, opcoes, resposta_correta, explicacao, ordem } = req.body;

    if (!enunciado || !tipo || !resposta_correta) {
      return res.status(400).json({ error: 'Campos "enunciado", "tipo" e "resposta_correta" são obrigatórios.' });
    }
    
    const query = `
      UPDATE perguntas_quiz
      SET enunciado = $1, tipo = $2, opcoes = $3, resposta_correta = $4,
          explicacao = $5, ordem = $6
      WHERE id = $7 AND quiz_id = $8
      RETURNING *;
    `;
    const values = [enunciado, tipo, opcoes, resposta_correta, explicacao, ordem, questionId, quizId];
    
    const { rows } = await db.query(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pergunta não encontrada ou não pertence a este quiz.' });
    }
    
    res.json({ message: 'Pergunta atualizada com sucesso!', question: rows[0] });

  } catch (error) {
    console.error('Erro ao atualizar pergunta:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   DELETE /api/admin/quizzes/:quizId/questions/:questionId
 * @desc    (Admin) Deletar uma pergunta
 * @access  Admin
 */
const deleteQuestion = async (req, res) => {
  try {
    const { quizId, questionId } = req.params;

    // Hard delete - perguntas podem ser deletadas sem afetar o histórico
    const { rowCount } = await db.query(
      'DELETE FROM perguntas_quiz WHERE id = $1 AND quiz_id = $2',
      [questionId, quizId]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Pergunta não encontrada ou não pertence a este quiz.' });
    }
    
    res.status(200).json({ message: 'Pergunta deletada com sucesso.' });

  } catch (error) {
    console.error('Erro ao deletar pergunta:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};


module.exports = {
  // Funções do Quiz
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  // Funções das Perguntas
  createQuestionForQuiz,
  getQuestionsForQuiz,
  updateQuestion,
  deleteQuestion
};