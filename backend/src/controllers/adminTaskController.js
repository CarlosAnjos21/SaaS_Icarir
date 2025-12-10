const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client');

/**
 * (Admin) Listar todas as tarefas (incluindo inativas)
 */
const getAllTasks = async (req, res) => {
  try {
    const tasks = await prisma.tarefa.findMany({
      orderBy: { data_criacao: 'desc' },
      include: {
        categoria: true,
        quiz: {
          include: {
            perguntas: true,
          },
        },
      },
    });

    // Se por algum motivo a relação não foi preenchida (ex: quizzes foram criados através
    // do painel de quizzes e apenas setaram quiz.tarefa_id), buscamos manualmente por tarefa_id
    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i];
      if (!t.quiz) {
        const q = await prisma.quiz.findFirst({ where: { tarefa_id: t.id }, include: { perguntas: true } });
        if (q) {
          t.quiz = q;
          t.quizId = q.id;
        }
      }
    }

    res.json(tasks);
  } catch (error) {
    console.error('Erro ao listar tarefas (admin):', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * (Admin) Buscar tarefa por ID
 */
const getTaskById = async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId, 10);
    if (isNaN(taskId)) return res.status(400).json({ error: 'ID inválido.' });

    let task = await prisma.tarefa.findUnique({
      where: { id: taskId },
      include: {
        categoria: true,
        quiz: {
          include: {
            perguntas: true,
          },
        },
      },
    });
    if (!task) return res.status(404).json({ error: 'Tarefa não encontrada.' });

    // Caso a relação direta 'quiz' não esteja preenchida, tentar localizar pelo campo quiz.tarefa_id
    if (!task.quiz) {
      const q = await prisma.quiz.findFirst({ where: { tarefa_id: task.id }, include: { perguntas: true } });
      if (q) {
        task.quiz = q;
        task.quizId = q.id;
      }
    }

    res.json(task);
  } catch (error) {
    console.error('Erro ao buscar tarefa (admin) por ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * (Admin) Criar tarefa (pode receber missao_id no body)
 */
const createTask = async (req, res) => {
  console.log('adminTaskController.createTask - body received:', req.body);
  try {
    const {
      missao_id,
      categoria_id,
      titulo,
      descricao,
      instrucoes,
      pontos,
      tipo,
      dificuldade,
      ordem,
      requisitos,
      tarefa_anterior_id,
      ativa,
      quiz,
    } = req.body;

    if (!titulo || pontos === undefined) {
      return res.status(400).json({ error: 'Campos obrigatórios (titulo, pontos) faltando.' });
    }

    // Validações e normalizações
    if (!missao_id) {
      return res.status(400).json({ error: 'Campo obrigatório: missao_id.' });
    }

    const allowedTipos = ['administrativa','conhecimento','engajamento','social','feedback'];
    const allowedDifs = ['facil','medio','dificil'];

    const dataToCreate = {
      missao_id: parseInt(missao_id, 10),
      categoria_id: categoria_id ? parseInt(categoria_id, 10) : null,
      titulo,
      descricao: descricao || null,
      instrucoes: instrucoes || null,
      pontos: parseInt(pontos, 10),
      tipo: allowedTipos.includes(tipo) ? tipo : null,
      dificuldade: allowedDifs.includes(dificuldade) ? dificuldade : 'facil',
      ativa: ativa ?? true,
      ordem: ordem ? parseInt(ordem, 10) : 0,
      requisitos: requisitos || Prisma.JsonNull,
      tarefa_anterior_id: tarefa_anterior_id ? parseInt(tarefa_anterior_id, 10) : null,
    };

    const newTask = await prisma.tarefa.create({ data: dataToCreate });

    // Se houver quiz no payload, criar o quiz e suas perguntas
    if (quiz && quiz.titulo && Array.isArray(quiz.perguntas) && quiz.perguntas.length > 0) {
      const newQuiz = await prisma.quiz.create({
        data: {
          titulo: quiz.titulo,
          descricao: quiz.descricao || '',
          ativo: quiz.ativo ?? true,
          tarefa_id: newTask.id,
        },
      });

      // Criar as perguntas do quiz
      for (let i = 0; i < quiz.perguntas.length; i++) {
        const p = quiz.perguntas[i];
        if (p.enunciado && p.opcoes && p.resposta_correta) {
          await prisma.perguntaQuiz.create({
            data: {
              quiz_id: newQuiz.id,
              enunciado: p.enunciado,
              tipo: 'multipla_escolha',
              opcoes: p.opcoes,
              resposta_correta: p.resposta_correta,
              ordem: i,
            },
          });
        }
      }

      console.log('adminTaskController.createTask - quiz created:', newQuiz.id);
    }

    console.log('adminTaskController.createTask - saved task:', newTask);
    res.status(201).json({ message: 'Tarefa criada com sucesso (admin).', task: newTask });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return res.status(400).json({ error: 'Chave estrangeira inválida (missao_id, categoria_id ou tarefa_anterior_id).' });
    }
    console.error('Erro ao criar tarefa (admin):', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * (Admin) Atualizar tarefa
 */
const updateTask = async (req, res) => {
  console.log('adminTaskController.updateTask - body received for id', req.params.taskId, req.body);
  try {
    const taskId = parseInt(req.params.taskId, 10);
    if (isNaN(taskId)) return res.status(400).json({ error: 'ID inválido.' });

    const {
      missao_id,
      categoria_id,
      titulo,
      descricao,
      instrucoes,
      pontos,
      tipo,
      dificuldade,
      ordem,
      requisitos,
      tarefa_anterior_id,
      ativa,
      quiz,
    } = req.body;

    const data = {};
    const allowedTipos = ['administrativa','conhecimento','engajamento','social','feedback'];
    const allowedDifs = ['facil','medio','dificil'];

    if (missao_id !== undefined) {
      // se veio string vazia ou null, não sobrescrever (evita setar missao_id para null em campo non-nullable)
      if (missao_id !== '' && missao_id !== null) data.missao_id = parseInt(missao_id, 10);
    }
    if (categoria_id !== undefined) {
      if (categoria_id !== '' && categoria_id !== null) data.categoria_id = parseInt(categoria_id, 10);
    }
    if (titulo !== undefined) data.titulo = titulo;
    if (descricao !== undefined) data.descricao = descricao;
    if (instrucoes !== undefined) data.instrucoes = instrucoes;
    if (pontos !== undefined) data.pontos = parseInt(pontos, 10);
    if (tipo !== undefined) {
      if (allowedTipos.includes(tipo)) data.tipo = tipo; // caso contrário ignora para evitar erro de enum
    }
    if (dificuldade !== undefined) {
      if (allowedDifs.includes(dificuldade)) data.dificuldade = dificuldade;
    }
    if (ordem !== undefined) data.ordem = parseInt(ordem, 10);
    if (requisitos !== undefined) data.requisitos = requisitos;
    if (tarefa_anterior_id !== undefined) {
      if (tarefa_anterior_id !== '' && tarefa_anterior_id !== null) data.tarefa_anterior_id = parseInt(tarefa_anterior_id, 10);
    }
    if (ativa !== undefined) data.ativa = ativa;

    const updated = await prisma.tarefa.update({ where: { id: taskId }, data });

    // Processar quiz se presente
    if (quiz !== undefined) {
      if (quiz === null) {
        // Remover quiz se foi deletado
        const existingQuiz = await prisma.quiz.findFirst({ where: { tarefa_id: taskId } });
        if (existingQuiz) {
          await prisma.quiz.delete({ where: { id: existingQuiz.id } });
        }
      } else if (quiz.titulo && Array.isArray(quiz.perguntas) && quiz.perguntas.length > 0) {
        // Verificar se já existe quiz para essa tarefa
        const existingQuiz = await prisma.quiz.findFirst({ where: { tarefa_id: taskId } });
        
        if (existingQuiz) {
          // Atualizar quiz existente
          await prisma.quiz.update({
            where: { id: existingQuiz.id },
            data: {
              titulo: quiz.titulo,
              descricao: quiz.descricao || '',
              ativo: quiz.ativo ?? true,
            },
          });

          // Deletar perguntas antigas e criar novas
          await prisma.perguntaQuiz.deleteMany({ where: { quiz_id: existingQuiz.id } });
          for (let i = 0; i < quiz.perguntas.length; i++) {
            const p = quiz.perguntas[i];
            if (p.enunciado && p.opcoes && p.resposta_correta) {
              await prisma.perguntaQuiz.create({
                data: {
                  quiz_id: existingQuiz.id,
                  enunciado: p.enunciado,
                  tipo: 'multipla_escolha',
                  opcoes: p.opcoes,
                  resposta_correta: p.resposta_correta,
                  ordem: i,
                },
              });
            }
          }
        } else {
          // Criar novo quiz
          const newQuiz = await prisma.quiz.create({
            data: {
              titulo: quiz.titulo,
              descricao: quiz.descricao || '',
              ativo: quiz.ativo ?? true,
              tarefa_id: taskId,
            },
          });

          for (let i = 0; i < quiz.perguntas.length; i++) {
            const p = quiz.perguntas[i];
            if (p.enunciado && p.opcoes && p.resposta_correta) {
              await prisma.perguntaQuiz.create({
                data: {
                  quiz_id: newQuiz.id,
                  enunciado: p.enunciado,
                  tipo: 'multipla_escolha',
                  opcoes: p.opcoes,
                  resposta_correta: p.resposta_correta,
                  ordem: i,
                },
              });
            }
          }
        }
      }
    }

    console.log('adminTaskController.updateTask - saved task:', updated);
    res.json({ message: 'Tarefa atualizada com sucesso (admin).', task: updated });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Tarefa não encontrada para atualizar.' });
      }
      if (error.code === 'P2003') {
        return res.status(400).json({ error: 'Chave estrangeira inválida ao atualizar.' });
      }
    }
    console.error('Erro ao atualizar tarefa (admin):', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * (Admin) Deletar/Desativar tarefa
 */
const deleteTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId, 10);
    if (isNaN(taskId)) return res.status(400).json({ error: 'ID inválido.' });

    // Soft delete: marcar como inativa
    const deleted = await prisma.tarefa.update({ where: { id: taskId }, data: { ativa: false } });
    res.json({ message: 'Tarefa desativada com sucesso (admin).', task: deleted });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Tarefa não encontrada para deletar.' });
    }
    console.error('Erro ao deletar tarefa (admin):', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
