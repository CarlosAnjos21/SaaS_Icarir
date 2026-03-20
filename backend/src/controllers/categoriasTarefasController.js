const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client');

const getAllCategorias = async (req, res) => {
  try {
    const categorias = await prisma.categoriaTarefa.findMany({
      orderBy: { ordem: 'asc' },
      include: { tarefas: { where: { ativa: true }, orderBy: { ordem: 'asc' } } },
    });
    res.json(categorias);
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const getCategoriaById = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const categoria = await prisma.categoriaTarefa.findUnique({
      where: { id },
      include: { tarefas: { where: { ativa: true }, orderBy: { ordem: 'asc' } } },
    });
    if (!categoria) return res.status(404).json({ error: 'Categoria não encontrada.' });
    res.json(categoria);
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const createCategoria = async (req, res) => {
  const { nome, descricao, icone, cor, ordem } = req.body;
  if (!nome) return res.status(400).json({ error: 'O campo "nome" é obrigatório.' });

  try {
    const categoria = await prisma.categoriaTarefa.create({
      data: { nome, descricao: descricao || null, icone: icone || null, cor: cor || null, ordem: ordem ? parseInt(ordem, 10) : 0 },
    });
    res.status(201).json({ message: 'Categoria criada com sucesso!', categoria });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const updateCategoria = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  const { nome, descricao, icone, cor, ordem } = req.body;
  const data = {
    ...(nome !== undefined && { nome }),
    ...(descricao !== undefined && { descricao }),
    ...(icone !== undefined && { icone }),
    ...(cor !== undefined && { cor }),
    ...(ordem !== undefined && { ordem: parseInt(ordem, 10) }),
  };

  try {
    const categoria = await prisma.categoriaTarefa.update({ where: { id }, data });
    res.json({ message: 'Categoria atualizada com sucesso!', categoria });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Categoria não encontrada.' });
    }
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const deleteCategoria = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    await prisma.categoriaTarefa.delete({ where: { id } });
    res.json({ message: 'Categoria removida com sucesso!' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') return res.status(409).json({ error: 'Existem tarefas vinculadas a esta categoria.' });
      if (error.code === 'P2025') return res.status(404).json({ error: 'Categoria não encontrada.' });
    }
    console.error('Erro ao remover categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = { getAllCategorias, getCategoriaById, createCategoria, updateCategoria, deleteCategoria };