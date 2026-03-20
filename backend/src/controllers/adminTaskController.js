const prisma = require('../config/prismaClient');

const VALID_TIPOS = ['administrativa', 'conhecimento', 'engajamento', 'social', 'feedback'];
const VALID_DIFICULDADES = ['facil', 'medio', 'dificil'];

const getAllTasks = async (req, res) => {
  try {
    const tasks = await prisma.tarefa.findMany({
      include: { categoria: true, quiz: { include: { perguntas: true } } },
      orderBy: { id: 'desc' },
    });
    res.json(tasks);
  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    res.status(500).json({ error: 'Erro interno.' });
  }
};

const getTaskById = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const task = await prisma.tarefa.findUnique({
      where: { id },
      include: { categoria: true, quiz: { include: { perguntas: true } } },
    });
    if (!task) return res.status(404).json({ error: 'Tarefa não encontrada.' });
    res.json(task);
  } catch (error) {
    console.error('Erro ao buscar tarefa:', error);
    res.status(500).json({ error: 'Erro interno.' });
  }
};

const createTask = async (req, res) => {
  const { missao_id, categoria_id, titulo, descricao, instrucoes, pontos, tipo, dificuldade, ordem, requisitos, quiz } = req.body;

  if (!missao_id || !titulo) {
    return res.status(400).json({ error: 'missao_id e titulo são obrigatórios.' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.tarefa.create({
        data: {
          missao_id: parseInt(missao_id),
          categoria_id: categoria_id ? parseInt(categoria_id) : null,
          titulo,
          descricao: descricao || null,
          instrucoes: instrucoes || null,
          pontos: pontos ? parseInt(pontos) : 0,
          tipo: VALID_TIPOS.includes(tipo) ? tipo : null,
          dificuldade: VALID_DIFICULDADES.includes(dificuldade) ? dificuldade : 'facil',
          ordem: ordem ? parseInt(ordem) : 0,
          requisitos: requisitos || null,
          ativa: true,
        },
      });

      if (quiz?.perguntas?.length > 0) {
        await tx.quiz.create({
          data: {
            tarefa_id: task.id,
            titulo: quiz.titulo || `Quiz: ${titulo}`,
            descricao: quiz.descricao || '',
            perguntas: {
              create: quiz.perguntas.map((p, idx) => ({
                enunciado: p.enunciado,
                opcoes: p.opcoes,
                resposta_correta: p.resposta_correta,
                ordem: idx,
              })),
            },
          },
        });
      }

      return task;
    });

    res.status(201).json({ message: 'Tarefa criada com sucesso!', task: result });
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({ error: 'Erro ao criar tarefa.', details: error.message });
  }
};

const updateTask = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  const { missao_id, categoria_id, titulo, descricao, instrucoes, pontos, tipo, dificuldade, ordem, requisitos, quiz, ativa } = req.body;

  // Só inclui campos que foram explicitamente enviados
  const data = {
    ...(missao_id !== undefined && { missao_id: parseInt(missao_id) }),
    ...(categoria_id !== undefined && { categoria_id: categoria_id ? parseInt(categoria_id) : null }),
    ...(titulo !== undefined && { titulo }),
    ...(descricao !== undefined && { descricao }),
    ...(instrucoes !== undefined && { instrucoes }),
    ...(pontos !== undefined && { pontos: parseInt(pontos) }),
    ...(tipo !== undefined && { tipo: VALID_TIPOS.includes(tipo) ? tipo : null }),
    ...(dificuldade !== undefined && { dificuldade: VALID_DIFICULDADES.includes(dificuldade) ? dificuldade : 'facil' }),
    ...(ordem !== undefined && { ordem: parseInt(ordem) }),
    ...(requisitos !== undefined && { requisitos }),
    ...(ativa !== undefined && { ativa }),
  };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.tarefa.update({ where: { id }, data });

      if (quiz) {
        const existing = await tx.quiz.findUnique({ where: { tarefa_id: id } });

        if (existing) {
          await tx.quiz.update({
            where: { id: existing.id },
            data: {
              ...(quiz.titulo && { titulo: quiz.titulo }),
              ...(quiz.descricao !== undefined && { descricao: quiz.descricao }),
            },
          });

          if (Array.isArray(quiz.perguntas)) {
            await tx.perguntaQuiz.deleteMany({ where: { quiz_id: existing.id } });
            if (quiz.perguntas.length > 0) {
              await tx.perguntaQuiz.createMany({
                data: quiz.perguntas.map((p, idx) => ({
                  quiz_id: existing.id,
                  enunciado: p.enunciado,
                  opcoes: p.opcoes,
                  resposta_correta: p.resposta_correta,
                  ordem: idx,
                })),
              });
            }
          }
        } else if (quiz.perguntas?.length > 0) {
          await tx.quiz.create({
            data: {
              tarefa_id: id,
              titulo: quiz.titulo || `Quiz: ${titulo || 'Tarefa'}`,
              descricao: quiz.descricao || '',
              perguntas: {
                create: quiz.perguntas.map((p, idx) => ({
                  enunciado: p.enunciado,
                  opcoes: p.opcoes,
                  resposta_correta: p.resposta_correta,
                  ordem: idx,
                })),
              },
            },
          });
        }
      }
    });

    const updated = await prisma.tarefa.findUnique({
      where: { id },
      include: { quiz: { include: { perguntas: true } } },
    });

    res.json({ message: 'Tarefa atualizada com sucesso!', task: updated });
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ error: 'Erro ao atualizar tarefa.' });
  }
};

const deleteTask = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    await prisma.tarefa.update({ where: { id }, data: { ativa: false } });
    res.json({ message: 'Tarefa desativada com sucesso.' });
  } catch (error) {
    console.error('Erro ao desativar tarefa:', error);
    res.status(500).json({ error: 'Erro ao desativar tarefa.' });
  }
};

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };