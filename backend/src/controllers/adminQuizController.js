const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client');

const createQuiz = async (req, res) => {
  const { titulo, descricao, ativo, tarefa_id } = req.body;

  if (!titulo) return res.status(400).json({ error: 'O título do quiz é obrigatório.' });
  if (!tarefa_id) return res.status(400).json({ error: 'O ID da tarefa é obrigatório.' });

  try {
    const quiz = await prisma.quiz.create({
      data: {
        titulo,
        descricao: descricao || '',
        ativo: ativo ?? true,
        tarefa_id: Number(tarefa_id),
      },
    });
    res.status(201).json({ message: 'Quiz criado com sucesso!', quiz });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') return res.status(409).json({ error: 'Esta tarefa já possui um quiz.' });
      if (error.code === 'P2025') return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }
    console.error('Erro ao criar quiz:', error);
    res.status(500).json({ error: 'Erro interno ao criar quiz.' });
  }
};

const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: { perguntas: true },
      orderBy: { id: 'asc' },
    });
    res.json(quizzes);
  } catch (error) {
    console.error('Erro ao buscar quizzes:', error);
    res.status(500).json({ error: 'Erro interno ao buscar quizzes.' });
  }
};

const getQuizById = async (req, res) => {
  const id = parseInt(req.params.quizId, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { perguntas: true },
    });
    if (!quiz) return res.status(404).json({ error: 'Quiz não encontrado.' });
    res.json(quiz);
  } catch (error) {
    console.error('Erro ao buscar quiz:', error);
    res.status(500).json({ error: 'Erro interno ao buscar quiz.' });
  }
};

const updateQuiz = async (req, res) => {
  const id = parseInt(req.params.quizId, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  const { titulo, descricao, ativo, tarefa_id } = req.body;

  try {
    const current = await prisma.quiz.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ error: 'Quiz não encontrado.' });

    const data = {
      ...(titulo !== undefined && { titulo }),
      ...(descricao !== undefined && { descricao }),
      ...(ativo !== undefined && { ativo }),
      // só atualiza tarefa_id se for diferente (constraint unique)
      ...(tarefa_id !== undefined && Number(tarefa_id) !== current.tarefa_id && { tarefa_id: Number(tarefa_id) }),
    };

    const quiz = await prisma.quiz.update({
      where: { id },
      data,
      include: { perguntas: true },
    });

    res.json({ message: 'Quiz atualizado com sucesso!', quiz });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') return res.status(404).json({ error: 'Quiz não encontrado.' });
      if (error.code === 'P2002') return res.status(409).json({ error: 'Esta tarefa já está vinculada a outro quiz.' });
    }
    console.error('Erro ao atualizar quiz:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar quiz.' });
  }
};

const deleteQuiz = async (req, res) => {
  const id = parseInt(req.params.quizId, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    await prisma.quiz.delete({ where: { id } });
    res.json({ message: 'Quiz deletado com sucesso!' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Quiz não encontrado.' });
    }
    console.error('Erro ao deletar quiz:', error);
    res.status(500).json({ error: 'Erro interno ao deletar quiz.' });
  }
};

const createQuestionForQuiz = async (req, res) => {
  const quizId = parseInt(req.params.quizId, 10);
  if (isNaN(quizId)) return res.status(400).json({ error: 'ID inválido.' });

  const { enunciado, alternativas, resposta_correta } = req.body;

  if (!enunciado || !Array.isArray(alternativas) || alternativas.length < 2) {
    return res.status(400).json({ error: 'Enunciado e pelo menos duas alternativas são obrigatórios.' });
  }
  if (!resposta_correta || !alternativas.includes(resposta_correta)) {
    return res.status(400).json({ error: 'A resposta correta deve estar entre as alternativas.' });
  }

  try {
    const pergunta = await prisma.perguntaQuiz.create({
      data: {
        enunciado,
        opcoes: alternativas,
        resposta_correta,
        quiz: { connect: { id: quizId } },
      },
    });
    res.status(201).json({ message: 'Pergunta criada com sucesso!', pergunta });
  } catch (error) {
    console.error('Erro ao criar pergunta:', error);
    res.status(500).json({ error: 'Erro interno ao criar pergunta.' });
  }
};

const getQuestionsForQuiz = async (req, res) => {
  const quizId = parseInt(req.params.quizId, 10);
  if (isNaN(quizId)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const perguntas = await prisma.perguntaQuiz.findMany({
      where: { quiz_id: quizId },
      orderBy: { ordem: 'asc' },
    });
    res.json(perguntas);
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
    res.status(500).json({ error: 'Erro interno ao buscar perguntas.' });
  }
};

const updateQuestion = async (req, res) => {
  const id = parseInt(req.params.questionId, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  const { enunciado, alternativas, resposta_correta } = req.body;

  if (!enunciado || !Array.isArray(alternativas) || alternativas.length < 2) {
    return res.status(400).json({ error: 'Enunciado e pelo menos duas alternativas são obrigatórios.' });
  }
  if (!resposta_correta || !alternativas.includes(resposta_correta)) {
    return res.status(400).json({ error: 'A resposta correta deve estar entre as alternativas.' });
  }

  try {
    const pergunta = await prisma.perguntaQuiz.update({
      where: { id },
      data: { enunciado, opcoes: alternativas, resposta_correta },
    });
    res.json({ message: 'Pergunta atualizada com sucesso!', pergunta });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Pergunta não encontrada.' });
    }
    console.error('Erro ao atualizar pergunta:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar pergunta.' });
  }
};

const deleteQuestion = async (req, res) => {
  const id = parseInt(req.params.questionId, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    await prisma.perguntaQuiz.delete({ where: { id } });
    res.json({ message: 'Pergunta deletada com sucesso!' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Pergunta não encontrada.' });
    }
    console.error('Erro ao deletar pergunta:', error);
    res.status(500).json({ error: 'Erro interno ao deletar pergunta.' });
  }
};

module.exports = {
  createQuiz, getAllQuizzes, getQuizById, updateQuiz, deleteQuiz,
  createQuestionForQuiz, getQuestionsForQuiz, updateQuestion, deleteQuestion,
};
