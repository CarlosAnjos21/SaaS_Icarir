const prisma = require('../config/prisma');

/**
 * @route   GET /api/categorias
 * @desc    Lista todas as categorias de tarefas (ordenadas por ordem)
 * @access  Privado
 */
const listarCategorias = async (req, res) => {
  try {
    const categorias = await prisma.categoriaTarefa.findMany({
      orderBy: { ordem: 'asc' },
      include: {
        _count: {
          select: { tarefas: true }
        }
      }
    });

    res.json({
      success: true,
      data: categorias
    });
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao listar categorias de tarefas.' 
    });
  }
};

/**
 * @route   GET /api/categorias/:id
 * @desc    Busca uma categoria específica por ID
 * @access  Privado
 */
const buscarCategoriaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const categoria = await prisma.categoriaTarefa.findUnique({
      where: { id: parseInt(id) },
      include: {
        tarefas: {
          select: {
            id: true,
            titulo: true,
            pontos: true,
            ativa: true
          },
          orderBy: { ordem: 'asc' }
        }
      }
    });

    if (!categoria) {
      return res.status(404).json({ 
        success: false,
        error: 'Categoria não encontrada.' 
      });
    }

    res.json({
      success: true,
      data: categoria
    });
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar categoria.' 
    });
  }
};

/**
 * @route   POST /api/categorias
 * @desc    Cria uma nova categoria de tarefas
 * @access  Admin
 */
const criarCategoria = async (req, res) => {
  const { nome, descricao, icone, cor, ordem } = req.body;

  // Validações
  if (!nome || nome.trim() === '') {
    return res.status(400).json({ 
      success: false,
      error: 'O nome da categoria é obrigatório.' 
    });
  }

  try {
    const categoria = await prisma.categoriaTarefa.create({
      data: {
        nome: nome.trim(),
        descricao: descricao?.trim() || null,
        icone: icone?.trim() || null,
        cor: cor?.trim() || null,
        ordem: ordem ? parseInt(ordem) : 0
      }
    });

    res.status(201).json({
      success: true,
      message: 'Categoria criada com sucesso!',
      data: categoria
    });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao criar categoria de tarefas.' 
    });
  }
};

/**
 * @route   PUT /api/categorias/:id
 * @desc    Atualiza uma categoria existente
 * @access  Admin
 */
const atualizarCategoria = async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, icone, cor, ordem } = req.body;

  try {
    // Verifica se existe
    const categoriaExistente = await prisma.categoriaTarefa.findUnique({
      where: { id: parseInt(id) }
    });

    if (!categoriaExistente) {
      return res.status(404).json({ 
        success: false,
        error: 'Categoria não encontrada.' 
      });
    }

    // Validações
    if (nome !== undefined && nome.trim() === '') {
      return res.status(400).json({ 
        success: false,
        error: 'O nome da categoria não pode ser vazio.' 
      });
    }

    // Atualiza apenas campos fornecidos
    const dadosAtualizacao = {};
    if (nome !== undefined) dadosAtualizacao.nome = nome.trim();
    if (descricao !== undefined) dadosAtualizacao.descricao = descricao?.trim() || null;
    if (icone !== undefined) dadosAtualizacao.icone = icone?.trim() || null;
    if (cor !== undefined) dadosAtualizacao.cor = cor?.trim() || null;
    if (ordem !== undefined) dadosAtualizacao.ordem = parseInt(ordem);

    const categoriaAtualizada = await prisma.categoriaTarefa.update({
      where: { id: parseInt(id) },
      data: dadosAtualizacao
    });

    res.json({
      success: true,
      message: 'Categoria atualizada com sucesso!',
      data: categoriaAtualizada
    });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao atualizar categoria.' 
    });
  }
};

/**
 * @route   DELETE /api/categorias/:id
 * @desc    Remove uma categoria (verifica se tem tarefas associadas)
 * @access  Admin
 */
const deletarCategoria = async (req, res) => {
  const { id } = req.params;

  try {
    // Verifica se existe
    const categoria = await prisma.categoriaTarefa.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { tarefas: true }
        }
      }
    });

    if (!categoria) {
      return res.status(404).json({ 
        success: false,
        error: 'Categoria não encontrada.' 
      });
    }

    // Verifica se tem tarefas associadas
    if (categoria._count.tarefas > 0) {
      return res.status(400).json({ 
        success: false,
        error: `Não é possível excluir esta categoria pois existem ${categoria._count.tarefas} tarefa(s) associada(s).` 
      });
    }

    await prisma.categoriaTarefa.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Categoria excluída com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao deletar categoria.' 
    });
  }
};

module.exports = {
  listarCategorias,
  buscarCategoriaPorId,
  criarCategoria,
  atualizarCategoria,
  deletarCategoria
};
