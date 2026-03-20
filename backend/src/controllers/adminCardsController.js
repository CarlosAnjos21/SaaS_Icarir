const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client');

const createCard = async (req, res) => {
  const { tarefa_requerida, titulo, descricao, tipo, raridade, imagem_url, ativo } = req.body;

  if (!titulo || !tipo) {
    return res.status(400).json({ error: 'Os campos "titulo" e "tipo" são obrigatórios.' });
  }

  try {
    const card = await prisma.card.create({
      data: {
        titulo,
        descricao: descricao || null,
        tipo,
        raridade: raridade || 'comum',
        imagem_url: imagem_url || null,
        tarefa_requerida: tarefa_requerida ? parseInt(tarefa_requerida, 10) : null,
        ativo: ativo ?? true,
      },
    });
    res.status(201).json({ message: 'Card criado com sucesso!', card });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return res.status(404).json({ error: 'tarefa_requerida inválido.' });
    }
    console.error('Erro ao criar card:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const getAllCards = async (req, res) => {
  try {
    const cards = await prisma.card.findMany({
      orderBy: { data_criacao: 'desc' },
    });
    res.json(cards);
  } catch (error) {
    console.error('Erro ao buscar cards:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const getCardById = async (req, res) => {
  const id = parseInt(req.params.cardId, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const card = await prisma.card.findUnique({ where: { id } });
    if (!card) return res.status(404).json({ error: 'Card não encontrado.' });
    res.json(card);
  } catch (error) {
    console.error('Erro ao buscar card:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const updateCard = async (req, res) => {
  const id = parseInt(req.params.cardId, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  const { titulo, descricao, tipo, raridade, imagem_url, tarefa_requerida, ativo } = req.body;

  try {
    const card = await prisma.card.update({
      where: { id },
      data: {
        ...(titulo !== undefined && { titulo }),
        ...(descricao !== undefined && { descricao }),
        ...(tipo !== undefined && { tipo }),
        ...(raridade !== undefined && { raridade }),
        ...(imagem_url !== undefined && { imagem_url }),
        ...(ativo !== undefined && { ativo }),
        ...(tarefa_requerida !== undefined && {
          tarefa_requerida: tarefa_requerida ? parseInt(tarefa_requerida, 10) : null,
        }),
      },
    });
    res.json({ message: 'Card atualizado com sucesso!', card });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') return res.status(404).json({ error: 'Card não encontrado.' });
      if (error.code === 'P2003') return res.status(404).json({ error: 'tarefa_requerida inválido.' });
    }
    console.error('Erro ao atualizar card:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const deleteCard = async (req, res) => {
  const id = parseInt(req.params.cardId, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const card = await prisma.card.update({
      where: { id },
      data: { ativo: false },
    });
    res.json({ message: 'Card desativado com sucesso!', card });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Card não encontrado.' });
    }
    console.error('Erro ao desativar card:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = { createCard, getAllCards, getCardById, updateCard, deleteCard };