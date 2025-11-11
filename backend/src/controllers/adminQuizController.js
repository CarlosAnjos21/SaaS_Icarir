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
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   GET /api/admin/quizzes
 * @desc    (Admin) Listar todos os quizzes
 */
const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await prisma.quizzes.findMany({
      orderBy: { data_criacao: 'desc' }
    });
    res.json(quizzes);
  } catch (error) {
    console.error('Erro ao buscar quizzes:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   GET /api/admin/quizzes/:quizId
 * @desc    (Admin) Buscar um quiz específico (e suas perguntas)
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

  } catch (error) {
    console.error('Erro ao buscar quiz por ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   PUT /api/admin/quizzes/:quizId
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
  }
};

/**
 * @route   DELETE /api/admin/quizzes/:quizId
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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Quiz não encontrado.' });
    }
    console.error('Erro ao deletar quiz:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};


// --- CRUD DE PERGUNTAS_QUIZ (Aninhado) ---

/**
 * @route   POST /api/admin/quizzes/:quizId/questions
 * @desc    (Admin) Criar uma nova pergunta para um quiz
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
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   GET /api/admin/quizzes/:quizId/questions
 * @desc    (Admin) Listar todas as perguntas de um quiz
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
    
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   PUT /api/admin/quizzes/:quizId/questions/:questionId
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
    });
    
    res.json({ message: 'Pergunta atualizada com sucesso!', question: updatedQuestion });

  } catch (error) {
    // Erro se a pergunta não for encontrada
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Pergunta não encontrada ou não pertence a este quiz.' });
    }
    console.error('Erro ao atualizar pergunta:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   DELETE /api/admin/quizzes/:quizId/questions/:questionId
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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Pergunta não encontrada ou não pertence a este quiz.' });
    }
    // Erro se a pergunta já tiver respostas (proteção de FK)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return res.status(409).json({ error: 'Não é possível deletar, pois esta pergunta já possui respostas de usuários.' });
    }
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