const prisma = require('../config/prismaClient');

const getQuizForUser = async (req, res) => {
  const quizId = parseInt(req.params.quizId, 10);
  if (isNaN(quizId)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId, ativo: true },
      select: {
        id: true, titulo: true, descricao: true,
        perguntas: {
          select: { id: true, enunciado: true, tipo: true, ordem: true, opcoes: true },
          orderBy: { ordem: 'asc' },
        },
      },
    });

    if (!quiz) return res.status(404).json({ error: 'Quiz não encontrado ou inativo.' });

    // Remove campo isCorrect das opções antes de enviar ao usuário
    const perguntas = quiz.perguntas.map((q) => ({
      ...q,
      opcoes: Array.isArray(q.opcoes)
        ? q.opcoes.map(({ isCorrect, ...rest }) => rest)
        : q.opcoes,
    }));

    res.json({ ...quiz, perguntas });
  } catch (error) {
    console.error('Erro ao buscar quiz:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const getQuizzesByTask = async (req, res) => {
  const taskId = parseInt(req.params.taskId, 10);
  if (isNaN(taskId)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const quiz = await prisma.quiz.findFirst({
      where: { tarefa_id: taskId, ativo: true },
      include: { perguntas: { orderBy: { ordem: 'asc' } } },
    });

    if (!quiz) return res.status(404).json({ error: 'Nenhum quiz encontrado para esta tarefa.' });

    const perguntas = quiz.perguntas.map((p) => ({
      ...p,
      opcoes: Array.isArray(p.opcoes)
        ? p.opcoes.map(({ isCorrect, ...rest }) => rest)
        : p.opcoes,
    }));

    res.json({ ...quiz, perguntas });
  } catch (error) {
    console.error('Erro ao buscar quiz por tarefa:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const submitQuiz = async (req, res) => {
  const quizId = parseInt(req.params.quizId, 10);
  if (isNaN(quizId)) return res.status(400).json({ error: 'ID inválido.' });

  const userId = req.user.id;
  const { answers } = req.body;

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'O array "answers" é obrigatório.' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.findFirst({
        where: { id: quizId, ativo: true },
        select: { id: true, tarefa_id: true },
      });
      if (!quiz) throw Object.assign(new Error('Quiz não encontrado ou inativo.'), { status: 404 });

      const { tarefa_id } = quiz;

      // Verifica se tarefa já foi concluída
      if (tarefa_id) {
        const existing = await tx.usuarioTarefa.findUnique({
          where: { usuario_id_tarefa_id: { usuario_id: userId, tarefa_id } },
          select: { concluida: true },
        });
        if (existing?.concluida) {
          throw Object.assign(new Error('Você já completou este quiz.'), { status: 409 });
        }
      }

      const questions = await tx.perguntaQuiz.findMany({
        where: { quiz_id: quizId },
        select: { id: true, resposta_correta: true },
      });

      // Mapa de respostas corretas diretamente do campo resposta_correta
      const correctMap = new Map(questions.map((q) => [q.id, q.resposta_correta]));

      let totalCorrect = 0;
      const submissionResults = [];

      for (const { pergunta_id, resposta } of answers) {
        const isCorrect = correctMap.get(pergunta_id) === resposta;
        if (isCorrect) totalCorrect++;

        const saved = await tx.respostaQuiz.create({
          data: { usuario_id: userId, pergunta_id, resposta, correta: isCorrect },
          select: { id: true, pergunta_id: true, resposta: true, correta: true },
        });
        submissionResults.push(saved);
      }

      const totalQuestions = correctMap.size;
      const allCorrect = totalCorrect === totalQuestions;

      // Só concede pontos e marca concluída se acertou tudo
      if (tarefa_id && allCorrect) {
        const tarefa = await tx.tarefa.findUnique({
          where: { id: tarefa_id },
          select: { pontos: true },
        });
        const taskPoints = tarefa?.pontos || 0;

        await tx.usuarioTarefa.upsert({
          where: { usuario_id_tarefa_id: { usuario_id: userId, tarefa_id } },
          create: { usuario_id: userId, tarefa_id, concluida: true, pontos_obtidos: taskPoints, data_conclusao: new Date() },
          update: { concluida: true, pontos_obtidos: taskPoints, data_conclusao: new Date() },
        });

        await tx.usuario.update({
          where: { id: userId },
          data: { pontos: { increment: taskPoints }, pontos_totais: { increment: taskPoints } },
        });

        await tx.logsPontos.create({
          data: { usuario_id: userId, tarefa_id, pontos: taskPoints, tipo: 'ganho_quiz', descricao: 'Quiz concluído com 100% de acerto.' },
        });

        return {
          message: `Parabéns! Você acertou todas e ganhou ${taskPoints} pontos!`,
          score: { correct: totalCorrect, total: totalQuestions },
          results: submissionResults,
        };
      }

      return {
        message: `Quiz submetido. Você acertou ${totalCorrect} de ${totalQuestions}.`,
        score: { correct: totalCorrect, total: totalQuestions },
        results: submissionResults,
      };
    });

    res.json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error('Erro ao submeter quiz:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = { getQuizForUser, getQuizzesByTask, submitQuiz };