<<<<<<< HEAD
const db = require('../config/db');
=======
// Importa o Prisma Client
const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client'); // Para tratamento de erro
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5

// --- CRUD DE QUIZZES ---

/**
 * @route   POST /api/admin/quizzes
 * @desc    (Admin) Criar um novo quiz
<<<<<<< HEAD
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
=======
 */
const createQuiz = async (req, res) => {
  const { tarefa_id, titulo, descricao, imagem_url, empresa_nome, ativo } = req.body;

  // De acordo com o schema, apenas 'titulo' é obrigatório
  if (!titulo) {
    return res.status(400).json({ error: 'O campo "titulo" é obrigatório.' });
  }

  try {
    const newQuiz = await prisma.quizzes.create({
      data: {
        tarefa_id: tarefa_id ? parseInt(tarefa_id, 10) : null,
        titulo: titulo,
        descricao: descricao || null,
        imagem_url: imagem_url || null,
        empresa_nome: empresa_nome || null,
        ativo: ativo !== undefined ? ativo : true // Default para true
      }
    });
    res.status(201).json({ message: 'Quiz criado com sucesso!', quiz: newQuiz });

  } catch (error) {
    // Erro de FK (tarefa_id não existe) ou erro de registro único
    if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2003' || error.code === 'P2002')) {
      return res.status(404).json({ error: 'A tarefa (tarefa_id) especificada não existe ou já está associada a outro quiz.' });
    }
    console.error('Erro ao criar quiz:', error);
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   GET /api/admin/quizzes
 * @desc    (Admin) Listar todos os quizzes
<<<<<<< HEAD
 * @access  Admin
 */
const getAllQuizzes = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM quizzes ORDER BY data_criacao DESC');
    res.json(rows);
=======
 */
const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await prisma.quizzes.findMany({
      orderBy: { data_criacao: 'desc' }
    });
    res.json(quizzes);
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
  } catch (error) {
    console.error('Erro ao buscar quizzes:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   GET /api/admin/quizzes/:quizId
 * @desc    (Admin) Buscar um quiz específico (e suas perguntas)
<<<<<<< HEAD
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
=======
 */
const getQuizById = async (req, res) => {
  try {
    const quizId = parseInt(req.params.quizId, 10);
    if (isNaN(quizId)) {
      return res.status(400).json({ error: 'ID de Quiz inválido.' });
    }

    // Busca o Quiz e suas Perguntas em uma única chamada
    const quiz = await prisma.quizzes.findUnique({
      where: { id: quizId },
      include: {
        perguntas: { // Substitui a segunda query
          orderBy: { ordem: 'asc' }
        }
      }
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz não encontrado.' });
    }
    
    res.json(quiz); // Retorna { ...quiz, perguntas: [...] }
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5

  } catch (error) {
    console.error('Erro ao buscar quiz por ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   PUT /api/admin/quizzes/:quizId
 * @desc    (Admin) Atualizar um quiz
<<<<<<< HEAD
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
=======
 */
const updateQuiz = async (req, res) => {
  try {
    const quizId = parseInt(req.params.quizId, 10);
    if (isNaN(quizId)) {
      return res.status(400).json({ error: 'ID de Quiz inválido.' });
    }
    
    const { tarefa_id, titulo, descricao, imagem_url, empresa_nome, ativo } = req.body;

    if (!titulo) {
      return res.status(400).json({ error: 'O campo "titulo" é obrigatório.' });
    }

    const updatedQuiz = await prisma.quizzes.update({
      where: { id: quizId },
      data: {
        tarefa_id: tarefa_id ? parseInt(tarefa_id, 10) : null,
        titulo: titulo,
        descricao: descricao,
        imagem_url: imagem_url,
        empresa_nome: empresa_nome,
        ativo: ativo
        // Prisma ignora campos 'undefined'
      }
    });
    
    res.json({ message: 'Quiz atualizado com sucesso!', quiz: updatedQuiz });

  } catch (error) {
    // Erro de FK (tarefa_id não existe) ou Quiz não encontrado
    if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2003' || error.code === 'P2025' || error.code === 'P2002')) {
      return res.status(404).json({ error: 'Erro ao atualizar: Quiz não encontrado, tarefa_id inválida ou tarefa_id já em uso.' });
    }
    console.error('Erro ao atualizar quiz:', error);
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   DELETE /api/admin/quizzes/:quizId
 * @desc    (Admin) Desativar (soft delete) um quiz
<<<<<<< HEAD
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
=======
 */
const deleteQuiz = async (req, res) => {
  try {
    const quizId = parseInt(req.params.quizId, 10);
    if (isNaN(quizId)) {
      return res.status(400).json({ error: 'ID de Quiz inválido.' });
    }

    // Soft delete (apenas desativa)
    const deletedQuiz = await prisma.quizzes.update({
      where: { id: quizId },
      data: { ativo: false }
    });
    
    res.json({ message: 'Quiz desativado com sucesso!', quiz: deletedQuiz });

  } catch (error) {
    // Erro se o quiz não for encontrado
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Quiz não encontrado.' });
    }
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
    console.error('Erro ao deletar quiz:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};


// --- CRUD DE PERGUNTAS_QUIZ (Aninhado) ---

/**
 * @route   POST /api/admin/quizzes/:quizId/questions
 * @desc    (Admin) Criar uma nova pergunta para um quiz
<<<<<<< HEAD
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
=======
 * @body    { "enunciado": "...", "tipo": "...", "opcoes": [{"text": "A", "isCorrect": true}, ...] }
 */
const createQuestionForQuiz = async (req, res) => {
  const quizId = parseInt(req.params.quizId, 10);
  if (isNaN(quizId)) {
    return res.status(400).json({ error: 'ID de Quiz inválido.' });
  }
  
  // Corrigido para alinhar com o schema.prisma (opcoes é um JSON)
  const { enunciado, tipo, opcoes, explicacao, ordem } = req.body;

  if (!enunciado || !opcoes) {
    return res.status(400).json({ error: 'Campos "enunciado" e "opcoes" (JSON) são obrigatórios.' });
  }

  try {
    const newQuestion = await prisma.perguntasQuiz.create({
      data: {
        quiz_id: quizId,
        enunciado: enunciado,
        tipo: tipo || 'single-choice',
        opcoes: opcoes, // Prisma aceita o JSON diretamente
        explicacao: explicacao || null,
        ordem: ordem ? parseInt(ordem, 10) : 0
      }
    });
    res.status(201).json({ message: 'Pergunta criada com sucesso!', question: newQuestion });

  } catch (error) {
    // Erro de FK (quiz_id não existe)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return res.status(404).json({ error: 'O quiz (quiz_id) especificado não existe.' });
    }
    console.error('Erro ao criar pergunta:', error);
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   GET /api/admin/quizzes/:quizId/questions
 * @desc    (Admin) Listar todas as perguntas de um quiz
<<<<<<< HEAD
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
=======
 */
const getQuestionsForQuiz = async (req, res) => {
  try {
    const quizId = parseInt(req.params.quizId, 10);
    if (isNaN(quizId)) {
      return res.status(400).json({ error: 'ID de Quiz inválido.' });
    }

    // Busca as perguntas. Se o quizId não existir, retorna array vazio.
    const questions = await prisma.perguntasQuiz.findMany({
      where: { quiz_id: quizId },
      orderBy: { ordem: 'asc' }
    });
    
    res.json(questions);
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
    
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   PUT /api/admin/quizzes/:quizId/questions/:questionId
 * @desc    (Admin) Atualizar uma pergunta
<<<<<<< HEAD
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
=======
 */
const updateQuestion = async (req, res) => {
  try {
    const quizId = parseInt(req.params.quizId, 10);
    const questionId = parseInt(req.params.questionId, 10);
    if (isNaN(quizId) || isNaN(questionId)) {
      return res.status(400).json({ error: 'IDs inválidos.' });
    }

    // Corrigido para alinhar com o schema.prisma
    const { enunciado, tipo, opcoes, explicacao, ordem } = req.body;

    if (!enunciado || !opcoes) {
      return res.status(400).json({ error: 'Campos "enunciado" e "opcoes" são obrigatórios.' });
    }
    
    const updatedQuestion = await prisma.perguntasQuiz.update({
      // Garante que a pergunta pertence ao quiz
      where: { id: questionId, quiz_id: quizId }, 
      data: {
        enunciado: enunciado,
        tipo: tipo,
        opcoes: opcoes,
        explicacao: explicacao,
        ordem: ordem ? parseInt(ordem, 10) : undefined
      }
    });
    
    res.json({ message: 'Pergunta atualizada com sucesso!', question: updatedQuestion });

  } catch (error) {
    // Erro se a pergunta não for encontrada
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Pergunta não encontrada ou não pertence a este quiz.' });
    }
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
    console.error('Erro ao atualizar pergunta:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   DELETE /api/admin/quizzes/:quizId/questions/:questionId
 * @desc    (Admin) Deletar uma pergunta
<<<<<<< HEAD
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
=======
 */
const deleteQuestion = async (req, res) => {
  try {
    const quizId = parseInt(req.params.quizId, 10);
    const questionId = parseInt(req.params.questionId, 10);
    if (isNaN(quizId) || isNaN(questionId)) {
      return res.status(400).json({ error: 'IDs inválidos.' });
    }

    // Hard delete
    await prisma.perguntasQuiz.delete({
      where: { id: questionId, quiz_id: quizId }
    });
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
    
    res.status(200).json({ message: 'Pergunta deletada com sucesso.' });

  } catch (error) {
<<<<<<< HEAD
=======
    // Erro se a pergunta não for encontrada
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Pergunta não encontrada ou não pertence a este quiz.' });
    }
    // Erro se a pergunta já tiver respostas (proteção de FK)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return res.status(409).json({ error: 'Não é possível deletar, pois esta pergunta já possui respostas de usuários.' });
    }
>>>>>>> ed831e1596253d89afdf2edff1a6e96e60db7aa5
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