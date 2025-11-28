// src/controllers/adminQuizController.js
const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client');

/**
 * @route   POST /api/admin/quizzes
 * @desc    Criar um novo quiz
 * @access  Admin
 */
const createQuiz = async (req, res) => {
  const { titulo, descricao, ativo, tarefa_id } = req.body;

  if (!titulo) {
    return res.status(400).json({ error: 'O título do quiz é obrigatório.' });
  }

  if (!tarefa_id) {
    return res.status(400).json({ error: 'O ID da tarefa é obrigatório para vincular o quiz.' });
  }

  try {
    const novoQuiz = await prisma.quiz.create({
      data: {
        titulo,
        descricao: descricao || '',
        ativa: ativo ?? true,
        tarefa: {
          connect: { id: Number(tarefa_id) }
        }
      },
    });

    res.status(201).json({
      message: 'Quiz criado e vinculado à tarefa com sucesso!',
      quiz: novoQuiz,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'A tarefa informada não existe.' });
    }

    console.error('Erro ao criar quiz:', error);
    res.status(500).json({ error: 'Erro interno ao criar quiz.' });
  }
};

/**
 * @route   GET /api/admin/quizzes
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
    });

    res.json(quizzes);
  } catch (error) {
    console.error('Erro ao buscar quizzes:', error);
    res.status(500).json({ error: 'Erro interno ao buscar quizzes.' });
  }
};

/**
 * @route   GET /api/admin/quizzes/:quizId
 * @desc    Buscar quiz por ID
 * @access  Admin
 */
const getQuizById = async (req, res) => {
  const quizId = parseInt(req.params.quizId, 10);

  if (isNaN(quizId)) {
    return res.status(400).json({ error: 'ID de quiz inválido.' });
  }

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { perguntas: true },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz não encontrado.' });
    }

    res.json(quiz);
  } catch (error) {
    console.error('Erro ao buscar quiz por ID:', error);
    res.status(500).json({ error: 'Erro interno ao buscar quiz.' });
  }
};

/**
 * @route   PUT /api/admin/quizzes/:quizId
 * @desc    Atualizar quiz
 * @access  Admin
 */
const updateQuiz = async (req, res) => {
  const quizId = parseInt(req.params.quizId, 10);
  const { titulo, descricao, ativo, tarefa_id } = req.body;

  if (isNaN(quizId)) {
    return res.status(400).json({ error: 'ID de quiz inválido.' });
  }

  try {
    const data = {
      titulo,
      descricao,
      ativa: ativo,
    };

    if (tarefa_id) {
      data.tarefa = { connect: { id: Number(tarefa_id) } };
    }

    const quizAtualizado = await prisma.quiz.update({
      where: { id: quizId },
      data,
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
  }
};

/**
 * @route   DELETE /api/admin/quizzes/:quizId
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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Quiz não encontrado para deletar.' });
    }

    console.error('Erro ao deletar quiz:', error);
    res.status(500).json({ error: 'Erro interno ao deletar quiz.' });
  }
};

/**
 * @route   POST /api/admin/quizzes/:quizId/questions
 * @desc    Criar uma nova pergunta para um quiz
 * @access  Admin
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
    res.status(500).json({ error: 'Erro interno ao criar pergunta.' });
  }
};

/**
 * @route   GET /api/admin/quizzes/:quizId/questions
 * @desc    Listar perguntas de um quiz
 * @access  Admin
 */
const getQuestionsForQuiz = async (req, res) => {
  const quizId = parseInt(req.params.quizId, 10);

  if (isNaN(quizId)) {
    return res.status(400).json({ error: 'ID de quiz inválido.' });
  }

  try {
    const perguntas = await prisma.perguntas.findMany({
      where: { quiz_id: quizId },
      orderBy: { id: 'asc' },
    });

    res.json(perguntas);
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
    res.status(500).json({ error: 'Erro interno ao buscar perguntas.' });
  }
};

/**
 * @route   PUT /api/admin/quizzes/:quizId/questions/:questionId
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
    });

    res.json({
      message: 'Pergunta atualizada com sucesso!',
      pergunta: perguntaAtualizada,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Pergunta não encontrada para atualizar.' });
    }

    console.error('Erro ao atualizar pergunta:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar pergunta.' });
  }
};

/**
 * @route   DELETE /api/admin/quizzes/:quizId/questions/:questionId
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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Pergunta não encontrada para deletar.' });
    }

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
