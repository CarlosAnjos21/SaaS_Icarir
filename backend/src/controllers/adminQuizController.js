<<<<<<< HEAD
// Importa o Prisma Client
const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client'); // Para tratamento de erro

// --- CRUD DE QUIZZES ---

/**
 * @route   POST /api/admin/quizzes
 * @desc    (Admin) Criar um novo quiz
 */
const createQuiz = async (req, res) => {
  const { tarefa_id, titulo, descricao, imagem_url, empresa_nome, ativo } = req.body;

  // De acordo com o schema, apenas 'titulo' é obrigatório
=======
// src/controllers/adminQuizController.js
const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client');

/**
 * @route   POST /api/admin/quizzes
 * @desc    Criar um novo quiz
 * @access  Admin
 */
const createQuiz = async (req, res) => {
  const { titulo, descricao, ativo } = req.body;

>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
  if (!titulo) {
    return res.status(400).json({ error: 'O título do quiz é obrigatório.' });
  }

  try {
    const novoQuiz = await prisma.quiz.create({
      data: {
        titulo,
        descricao: descricao || '',
        ativo: ativo ?? true,
      },
    });

    res.status(201).json({
      message: 'Quiz criado com sucesso!',
      quiz: novoQuiz,
    });
  } catch (error) {
    console.error('Erro ao criar quiz:', error);
<<<<<<< HEAD
    res.status(500).json({ error: 'Erro interno do servidor.' });
=======
    res.status(500).json({ error: 'Erro interno ao criar quiz.' });
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
  }
};

/**
 * @route   GET /api/admin/quizzes
<<<<<<< HEAD
 * @desc    (Admin) Listar todos os quizzes
 */
const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await prisma.quizzes.findMany({
      orderBy: { data_criacao: 'desc' }
=======
 * @desc    Listar todos os quizzes
 * @access  Admin
 */
const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        perguntas: true,
      },
      orderBy: { id: 'asc' },
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
    });

    res.json(quizzes);
  } catch (error) {
    console.error('Erro ao buscar quizzes:', error);
    res.status(500).json({ error: 'Erro interno ao buscar quizzes.' });
  }
};

/**
 * @route   GET /api/admin/quizzes/:quizId
<<<<<<< HEAD
 * @desc    (Admin) Buscar um quiz específico (e suas perguntas)
 */
const getQuizById = async (req, res) => {
  try {
    const quizId = parseInt(req.params.quizId, 10);
    if (isNaN(quizId)) {
      return res.status(400).json({ error: 'ID de Quiz inválido.' });
    }
=======
 * @desc    Buscar quiz por ID
 * @access  Admin
 */
const getQuizById = async (req, res) => {
  const quizId = parseInt(req.params.quizId, 10);

  if (isNaN(quizId)) {
    return res.status(400).json({ error: 'ID de quiz inválido.' });
  }
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { perguntas: true },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz não encontrado.' });
    }
<<<<<<< HEAD
    
    res.json(quiz); // Retorna { ...quiz, perguntas: [...] }
=======
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121

    res.json(quiz);
  } catch (error) {
    console.error('Erro ao buscar quiz por ID:', error);
    res.status(500).json({ error: 'Erro interno ao buscar quiz.' });
  }
};

/**
 * @route   PUT /api/admin/quizzes/:quizId
<<<<<<< HEAD
 * @desc    (Admin) Atualizar um quiz
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
    res.status(500).json({ error: 'Erro interno do servidor.' });
=======
 * @desc    Atualizar quiz
 * @access  Admin
 */
const updateQuiz = async (req, res) => {
  const quizId = parseInt(req.params.quizId, 10);
  const { titulo, descricao, ativo } = req.body;

  if (isNaN(quizId)) {
    return res.status(400).json({ error: 'ID de quiz inválido.' });
  }

  try {
    const quizAtualizado = await prisma.quiz.update({
      where: { id: quizId },
      data: { titulo, descricao, ativo },
    });

    res.json({
      message: 'Quiz atualizado com sucesso!',
      quiz: quizAtualizado,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Quiz não encontrado para atualizar.' });
    }

    console.error('Erro ao atualizar quiz:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar quiz.' });
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
  }
};

/**
 * @route   DELETE /api/admin/quizzes/:quizId
<<<<<<< HEAD
 * @desc    (Admin) Desativar (soft delete) um quiz
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
=======
 * @desc    Deletar (ou desativar) quiz
 * @access  Admin
 */
const deleteQuiz = async (req, res) => {
  const quizId = parseInt(req.params.quizId, 10);

  if (isNaN(quizId)) {
    return res.status(400).json({ error: 'ID de quiz inválido.' });
  }

  try {
    await prisma.quiz.delete({ where: { id: quizId } });

    res.json({ message: 'Quiz deletado com sucesso!' });
  } catch (error) {
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Quiz não encontrado para deletar.' });
    }
<<<<<<< HEAD
=======

>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
    console.error('Erro ao deletar quiz:', error);
    res.status(500).json({ error: 'Erro interno ao deletar quiz.' });
  }
};

/**
 * @route   POST /api/admin/quizzes/:quizId/questions
<<<<<<< HEAD
 * @desc    (Admin) Criar uma nova pergunta para um quiz
 * @body    { "enunciado": "...", "tipo": "...", "opcoes": [{"text": "A", "isCorrect": true}, ...] }
=======
 * @desc    Criar uma nova pergunta para um quiz
 * @access  Admin
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
 */
const createQuestionForQuiz = async (req, res) => {
  const quizId = parseInt(req.params.quizId, 10);
  const { enunciado, alternativas, resposta_correta } = req.body;

  if (isNaN(quizId)) {
    return res.status(400).json({ error: 'ID de quiz inválido.' });
  }

  if (!enunciado || !Array.isArray(alternativas) || alternativas.length < 2) {
    return res.status(400).json({ error: 'A pergunta precisa de enunciado e pelo menos duas alternativas.' });
  }

  try {
    const novaPergunta = await prisma.perguntas.create({
      data: {
        enunciado,
        alternativas,
        resposta_correta,
        quiz_id: quizId,
      },
    });

    res.status(201).json({
      message: 'Pergunta criada com sucesso!',
      pergunta: novaPergunta,
    });
  } catch (error) {
    console.error('Erro ao criar pergunta:', error);
<<<<<<< HEAD
    res.status(500).json({ error: 'Erro interno do servidor.' });
=======
    res.status(500).json({ error: 'Erro interno ao criar pergunta.' });
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
  }
};

/**
 * @route   GET /api/admin/quizzes/:quizId/questions
<<<<<<< HEAD
 * @desc    (Admin) Listar todas as perguntas de um quiz
 */
const getQuestionsForQuiz = async (req, res) => {
  try {
    const quizId = parseInt(req.params.quizId, 10);
    if (isNaN(quizId)) {
      return res.status(400).json({ error: 'ID de Quiz inválido.' });
    }
=======
 * @desc    Listar perguntas de um quiz
 * @access  Admin
 */
const getQuestionsForQuiz = async (req, res) => {
  const quizId = parseInt(req.params.quizId, 10);

  if (isNaN(quizId)) {
    return res.status(400).json({ error: 'ID de quiz inválido.' });
  }
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121

  try {
    const perguntas = await prisma.perguntas.findMany({
      where: { quiz_id: quizId },
      orderBy: { id: 'asc' },
    });
<<<<<<< HEAD
    
    res.json(questions);
    
=======

    res.json(perguntas);
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
    res.status(500).json({ error: 'Erro interno ao buscar perguntas.' });
  }
};

/**
 * @route   PUT /api/admin/quizzes/:quizId/questions/:questionId
<<<<<<< HEAD
 * @desc    (Admin) Atualizar uma pergunta
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
=======
 * @desc    Atualizar pergunta de um quiz
 * @access  Admin
 */
const updateQuestion = async (req, res) => {
  const questionId = parseInt(req.params.questionId, 10);
  const { enunciado, alternativas, resposta_correta } = req.body;

  if (isNaN(questionId)) {
    return res.status(400).json({ error: 'ID de pergunta inválido.' });
  }

  try {
    const perguntaAtualizada = await prisma.perguntas.update({
      where: { id: questionId },
      data: { enunciado, alternativas, resposta_correta },
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
    });

    res.json({
      message: 'Pergunta atualizada com sucesso!',
      pergunta: perguntaAtualizada,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Pergunta não encontrada para atualizar.' });
    }
<<<<<<< HEAD
=======

>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
    console.error('Erro ao atualizar pergunta:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar pergunta.' });
  }
};

/**
 * @route   DELETE /api/admin/quizzes/:quizId/questions/:questionId
<<<<<<< HEAD
 * @desc    (Admin) Deletar uma pergunta
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
    
    res.status(200).json({ message: 'Pergunta deletada com sucesso.' });

  } catch (error) {
    // Erro se a pergunta não for encontrada
=======
 * @desc    Deletar pergunta de um quiz
 * @access  Admin
 */
const deleteQuestion = async (req, res) => {
  const questionId = parseInt(req.params.questionId, 10);

  if (isNaN(questionId)) {
    return res.status(400).json({ error: 'ID de pergunta inválido.' });
  }

  try {
    await prisma.perguntas.delete({ where: { id: questionId } });
    res.json({ message: 'Pergunta deletada com sucesso!' });
  } catch (error) {
>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Pergunta não encontrada para deletar.' });
    }
<<<<<<< HEAD
    // Erro se a pergunta já tiver respostas (proteção de FK)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return res.status(409).json({ error: 'Não é possível deletar, pois esta pergunta já possui respostas de usuários.' });
    }
=======

>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
    console.error('Erro ao deletar pergunta:', error);
    res.status(500).json({ error: 'Erro interno ao deletar pergunta.' });
  }
};

module.exports = {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  createQuestionForQuiz,
  getQuestionsForQuiz,
  updateQuestion,
  deleteQuestion,
};
