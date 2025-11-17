const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client');

/**
 * (Admin) Listar todas as tarefas (incluindo inativas)
 */
const getAllTasks = async (req, res) => {
  try {
    const tasks = await prisma.tarefa.findMany({
      orderBy: { data_criacao: 'desc' },
    });
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

    const task = await prisma.tarefa.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ error: 'Tarefa não encontrada.' });

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
    } = req.body;

    if (!titulo || pontos === undefined) {
      return res.status(400).json({ error: 'Campos obrigatórios (titulo, pontos) faltando.' });
    }

    const newTask = await prisma.tarefa.create({
      data: {
        missao_id: missao_id ? parseInt(missao_id, 10) : null,
        categoria_id: categoria_id ? parseInt(categoria_id, 10) : null,
        titulo,
        descricao: descricao || null,
        instrucoes: instrucoes || null,
        pontos: parseInt(pontos, 10),
        tipo: tipo || null,
        dificuldade: dificuldade || 'facil',
        ativa: ativa ?? true,
        ordem: ordem ? parseInt(ordem, 10) : 0,
        requisitos: requisitos || Prisma.JsonNull,
        tarefa_anterior_id: tarefa_anterior_id ? parseInt(tarefa_anterior_id, 10) : null,
      },
    });

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
    } = req.body;

    const data = {};
    if (missao_id !== undefined) data.missao_id = missao_id ? parseInt(missao_id, 10) : null;
    if (categoria_id !== undefined) data.categoria_id = categoria_id ? parseInt(categoria_id, 10) : null;
    if (titulo !== undefined) data.titulo = titulo;
    if (descricao !== undefined) data.descricao = descricao;
    if (instrucoes !== undefined) data.instrucoes = instrucoes;
    if (pontos !== undefined) data.pontos = parseInt(pontos, 10);
    if (tipo !== undefined) data.tipo = tipo;
    if (dificuldade !== undefined) data.dificuldade = dificuldade;
    if (ordem !== undefined) data.ordem = parseInt(ordem, 10);
    if (requisitos !== undefined) data.requisitos = requisitos;
    if (tarefa_anterior_id !== undefined) data.tarefa_anterior_id = tarefa_anterior_id ? parseInt(tarefa_anterior_id, 10) : null;
    if (ativa !== undefined) data.ativa = ativa;

    const updated = await prisma.tarefa.update({ where: { id: taskId }, data });
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
