const prisma = require('../config/prisma');

/**
 * @route   GET /api/admin/tarefas
 * @desc    Lista tarefas com filtros (missao_id, categoria_id, ativa, tipo, dificuldade)
 * @access  Admin
 */
const listarTarefas = async (req, res) => {
  try {
    const { 
      missao_id, 
      categoria_id, 
      ativa, 
      tipo, 
      dificuldade,
      page = 1,
      limit = 20
    } = req.query;

    // Construir filtros dinamicamente
    const where = {};
    
    if (missao_id) where.missao_id = parseInt(missao_id);
    if (categoria_id) where.categoria_id = parseInt(categoria_id);
    if (ativa !== undefined) where.ativa = ativa === 'true';
    if (tipo) where.tipo = tipo;
    if (dificuldade) where.dificuldade = dificuldade;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Buscar tarefas com paginação
    const [tarefas, total] = await Promise.all([
      prisma.tarefa.findMany({
        where,
        skip,
        take,
        orderBy: [
          { ordem: 'asc' },
          { id: 'asc' }
        ],
        include: {
          categoria: {
            select: {
              id: true,
              nome: true,
              icone: true,
              cor: true
            }
          },
          missao: {
            select: {
              id: true,
              titulo: true,
              destino: true
            }
          },
          quiz: {
            select: {
              id: true,
              titulo: true
            }
          },
          _count: {
            select: {
              usuarios: true,
              cards: true
            }
          }
        }
      }),
      prisma.tarefa.count({ where })
    ]);

    res.json({
      success: true,
      data: tarefas,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao listar tarefas.' 
    });
  }
};

/**
 * @route   GET /api/admin/tarefas/:id
 * @desc    Busca uma tarefa específica com todos os relacionamentos
 * @access  Admin
 */
const buscarTarefaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const tarefa = await prisma.tarefa.findUnique({
      where: { id: parseInt(id) },
      include: {
        categoria: true,
        missao: {
          select: {
            id: true,
            titulo: true,
            descricao: true,
            destino: true,
            data_inicio: true,
            data_fim: true,
            ativa: true
          }
        },
        tarefaAnterior: {
          select: {
            id: true,
            titulo: true
          }
        },
        proximasTarefas: {
          select: {
            id: true,
            titulo: true
          }
        },
        quiz: {
          include: {
            perguntas: {
              orderBy: { ordem: 'asc' },
              select: {
                id: true,
                enunciado: true,
                tipo: true,
                opcoes: true,
                ordem: true
              }
            }
          }
        },
        cards: {
          select: {
            id: true,
            titulo: true,
            tipo: true,
            raridade: true
          }
        },
        usuarios: {
          select: {
            id: true,
            usuario_id: true,
            concluida: true,
            pontos_obtidos: true,
            data_conclusao: true
          },
          take: 10,
          orderBy: { data_criacao: 'desc' }
        }
      }
    });

    if (!tarefa) {
      return res.status(404).json({ 
        success: false,
        error: 'Tarefa não encontrada.' 
      });
    }

    res.json({
      success: true,
      data: tarefa
    });
  } catch (error) {
    console.error('Erro ao buscar tarefa:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar tarefa.' 
    });
  }
};

/**
 * @route   POST /api/admin/tarefas
 * @desc    Cria uma nova tarefa
 * @access  Admin
 */
const criarTarefa = async (req, res) => {
  const { 
    missao_id,
    categoria_id,
    titulo,
    descricao,
    instrucoes,
    pontos,
    tipo,
    dificuldade,
    ativa,
    ordem,
    requisitos,
    tarefa_anterior_id
  } = req.body;

  // Validações obrigatórias
  if (!missao_id) {
    return res.status(400).json({ 
      success: false,
      error: 'O ID da missão é obrigatório.' 
    });
  }

  if (!titulo || titulo.trim() === '') {
    return res.status(400).json({ 
      success: false,
      error: 'O título da tarefa é obrigatório.' 
    });
  }

  if (pontos === undefined || pontos < 0) {
    return res.status(400).json({ 
      success: false,
      error: 'Os pontos devem ser informados e não podem ser negativos.' 
    });
  }

  try {
    // Validar se a missão existe
    const missaoExiste = await prisma.missao.findUnique({
      where: { id: parseInt(missao_id) }
    });

    if (!missaoExiste) {
      return res.status(404).json({ 
        success: false,
        error: 'Missão não encontrada.' 
      });
    }

    // Validar categoria se fornecida
    if (categoria_id) {
      const categoriaExiste = await prisma.categoriaTarefa.findUnique({
        where: { id: parseInt(categoria_id) }
      });

      if (!categoriaExiste) {
        return res.status(404).json({ 
          success: false,
          error: 'Categoria não encontrada.' 
        });
      }
    }

    // Validar tarefa anterior se fornecida
    if (tarefa_anterior_id) {
      const tarefaAnteriorExiste = await prisma.tarefa.findUnique({
        where: { id: parseInt(tarefa_anterior_id) }
      });

      if (!tarefaAnteriorExiste) {
        return res.status(404).json({ 
          success: false,
          error: 'Tarefa anterior não encontrada.' 
        });
      }
    }

    // Criar a tarefa
    const tarefa = await prisma.tarefa.create({
      data: {
        missao_id: parseInt(missao_id),
        categoria_id: categoria_id ? parseInt(categoria_id) : null,
        titulo: titulo.trim(),
        descricao: descricao?.trim() || null,
        instrucoes: instrucoes?.trim() || null,
        pontos: parseInt(pontos),
        tipo: tipo || null,
        dificuldade: dificuldade || 'facil',
        ativa: ativa !== undefined ? Boolean(ativa) : true,
        ordem: ordem ? parseInt(ordem) : 0,
        requisitos: requisitos || null,
        tarefa_anterior_id: tarefa_anterior_id ? parseInt(tarefa_anterior_id) : null
      },
      include: {
        categoria: true,
        missao: {
          select: {
            id: true,
            titulo: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Tarefa criada com sucesso!',
      data: tarefa
    });
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    
    // Tratamento de erros específicos do Prisma
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        success: false,
        error: 'Erro de chave estrangeira. Verifique os IDs fornecidos.' 
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Erro ao criar tarefa.' 
    });
  }
};

/**
 * @route   PUT /api/admin/tarefas/:id
 * @desc    Atualiza uma tarefa existente
 * @access  Admin
 */
const atualizarTarefa = async (req, res) => {
  const { id } = req.params;
  const { 
    missao_id,
    categoria_id,
    titulo,
    descricao,
    instrucoes,
    pontos,
    tipo,
    dificuldade,
    ativa,
    ordem,
    requisitos,
    tarefa_anterior_id
  } = req.body;

  try {
    // Verifica se a tarefa existe
    const tarefaExistente = await prisma.tarefa.findUnique({
      where: { id: parseInt(id) }
    });

    if (!tarefaExistente) {
      return res.status(404).json({ 
        success: false,
        error: 'Tarefa não encontrada.' 
      });
    }

    // Validações
    if (titulo !== undefined && titulo.trim() === '') {
      return res.status(400).json({ 
        success: false,
        error: 'O título não pode ser vazio.' 
      });
    }

    if (pontos !== undefined && pontos < 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Os pontos não podem ser negativos.' 
      });
    }

    // Validar missão se fornecida
    if (missao_id) {
      const missaoExiste = await prisma.missao.findUnique({
        where: { id: parseInt(missao_id) }
      });

      if (!missaoExiste) {
        return res.status(404).json({ 
          success: false,
          error: 'Missão não encontrada.' 
        });
      }
    }

    // Validar categoria se fornecida
    if (categoria_id) {
      const categoriaExiste = await prisma.categoriaTarefa.findUnique({
        where: { id: parseInt(categoria_id) }
      });

      if (!categoriaExiste) {
        return res.status(404).json({ 
          success: false,
          error: 'Categoria não encontrada.' 
        });
      }
    }

    // Construir dados de atualização
    const dadosAtualizacao = {};
    if (missao_id !== undefined) dadosAtualizacao.missao_id = parseInt(missao_id);
    if (categoria_id !== undefined) dadosAtualizacao.categoria_id = categoria_id ? parseInt(categoria_id) : null;
    if (titulo !== undefined) dadosAtualizacao.titulo = titulo.trim();
    if (descricao !== undefined) dadosAtualizacao.descricao = descricao?.trim() || null;
    if (instrucoes !== undefined) dadosAtualizacao.instrucoes = instrucoes?.trim() || null;
    if (pontos !== undefined) dadosAtualizacao.pontos = parseInt(pontos);
    if (tipo !== undefined) dadosAtualizacao.tipo = tipo || null;
    if (dificuldade !== undefined) dadosAtualizacao.dificuldade = dificuldade;
    if (ativa !== undefined) dadosAtualizacao.ativa = Boolean(ativa);
    if (ordem !== undefined) dadosAtualizacao.ordem = parseInt(ordem);
    if (requisitos !== undefined) dadosAtualizacao.requisitos = requisitos;
    if (tarefa_anterior_id !== undefined) dadosAtualizacao.tarefa_anterior_id = tarefa_anterior_id ? parseInt(tarefa_anterior_id) : null;

    // Atualizar data_atualizacao
    dadosAtualizacao.data_atualizacao = new Date();

    const tarefaAtualizada = await prisma.tarefa.update({
      where: { id: parseInt(id) },
      data: dadosAtualizacao,
      include: {
        categoria: true,
        missao: {
          select: {
            id: true,
            titulo: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Tarefa atualizada com sucesso!',
      data: tarefaAtualizada
    });
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        success: false,
        error: 'Erro de chave estrangeira. Verifique os IDs fornecidos.' 
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Erro ao atualizar tarefa.' 
    });
  }
};

/**
 * @route   DELETE /api/admin/tarefas/:id
 * @desc    Remove uma tarefa (verifica dependências)
 * @access  Admin
 */
const deletarTarefa = async (req, res) => {
  const { id } = req.params;

  try {
    // Verifica se existe
    const tarefa = await prisma.tarefa.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            usuarios: true,
            quiz: true,
            cards: true,
            proximasTarefas: true
          }
        }
      }
    });

    if (!tarefa) {
      return res.status(404).json({ 
        success: false,
        error: 'Tarefa não encontrada.' 
      });
    }

    // Verifica dependências
    const dependencias = [];
    if (tarefa._count.usuarios > 0) dependencias.push(`${tarefa._count.usuarios} progresso(s) de usuário(s)`);
    if (tarefa._count.quiz > 0) dependencias.push('quiz associado');
    if (tarefa._count.cards > 0) dependencias.push(`${tarefa._count.cards} card(s)`);
    if (tarefa._count.proximasTarefas > 0) dependencias.push(`${tarefa._count.proximasTarefas} tarefa(s) dependente(s)`);

    if (dependencias.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: `Não é possível excluir esta tarefa pois possui: ${dependencias.join(', ')}.` 
      });
    }

    await prisma.tarefa.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Tarefa excluída com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao deletar tarefa.' 
    });
  }
};

/**
 * @route   GET /api/admin/tarefas/missao/:missao_id
 * @desc    Lista todas as tarefas de uma missão específica
 * @access  Admin
 */
const listarTarefasPorMissao = async (req, res) => {
  const { missao_id } = req.params;

  try {
    const tarefas = await prisma.tarefa.findMany({
      where: { missao_id: parseInt(missao_id) },
      orderBy: [
        { ordem: 'asc' },
        { id: 'asc' }
      ],
      include: {
        categoria: {
          select: {
            id: true,
            nome: true,
            icone: true,
            cor: true
          }
        },
        _count: {
          select: {
            usuarios: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: tarefas
    });
  } catch (error) {
    console.error('Erro ao listar tarefas por missão:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao listar tarefas da missão.' 
    });
  }
};

module.exports = {
  listarTarefas,
  buscarTarefaPorId,
  criarTarefa,
  atualizarTarefa,
  deletarTarefa,
  listarTarefasPorMissao
};
