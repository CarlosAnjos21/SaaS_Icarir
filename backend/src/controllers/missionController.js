// Importa o Prisma Client
const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client'); // Para capturar erros

/**
 * @route   GET /api/missions
 * @desc    Listar todas as missões ativas
 * @access  Privado (requer token)
 */
const getAllActiveMissions = async (req, res) => {
  try {
    // Busca missões onde 'ativa' = true, ordenadas pela data de início
    const missoes = await prisma.missao.findMany({
      where: { ativa: true },
      // Seleciona os mesmos campos da query SQL original
      select: {
        id: true,
        titulo: true, // [cite: 57, 254]
        descricao: true, // [cite: 60, 257]
        destino: true, // [cite: 65, 260]
        data_inicio: true, // [cite: 66, 271]
        data_fim: true, // [cite: 66, 271]
        preco: true, // [cite: 67, 271]
        vagas_disponiveis: true
      },
      orderBy: { data_inicio: 'asc' }
    });

    // Transformar Decimal para número
    const transformedMissoes = missoes.map(m => ({
      ...m,
      preco: m.preco ? parseFloat(m.preco.toString()) : null,
      vagas_disponiveis: m.vagas_disponiveis ? parseInt(m.vagas_disponiveis.toString(), 10) : null,
    }));
    
    res.json(transformedMissoes);

  } catch (error) {
    console.error('Erro ao buscar missões:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};


/**
 * @route   GET /api/missions/:missionId
 * @desc    Buscar detalhes de uma missão específica
 * @access  Privado (requer token)
 */
const getMissionById = async (req, res) => {
  try {
    const missionId = parseInt(req.params.missionId, 10);
    if (isNaN(missionId)) {
      return res.status(400).json({ error: 'ID da missão inválido.' });
    }

    const missao = await prisma.missao.findFirst({
      where: { id: missionId }
    });

    if (!missao) {
      return res.status(404).json({ error: 'Missão não encontrada.' });
    }
    
    res.json(missao);

  } catch (error) {
    console.error('Erro ao buscar missão por ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};


/**
 * @route   GET /api/missions/:missionId/full
 * @desc    Buscar dados completos de uma missão (tarefas, inscritos, logs, contagens)
 * @access  Privado (requer token)
 */
const getMissionFullById = async (req, res) => {
  try {
    const missionId = parseInt(req.params.missionId, 10);
    if (isNaN(missionId)) {
      return res.status(400).json({ error: 'ID da missão inválido.' });
    }

    const missao = await prisma.missao.findFirst({
      where: { id: missionId },
      include: {
        // Incluir tarefas da missão com categoria e quiz
        tarefas: {
          where: { ativa: true },
          orderBy: { ordem: 'asc' },
          include: {
            categoria: { select: { id: true, nome: true, icone: true, cor: true } },
            quiz: { select: { id: true, titulo: true, descricao: true } },
          },
        },
        // Incluir inscrições com dados básicos do usuário
        usuarios: {
          include: {
            usuario: { select: { id: true, nome: true, email: true, foto_url: true } },
          },
        },
        // Incluir logs relacionados à missão (últimos primeiro)
        logs: {
          orderBy: { data_criacao: 'desc' },
          select: { id: true, usuario_id: true, pontos: true, tipo: true, descricao: true, data_criacao: true },
        },
        // Incluir referência à missão anterior (se houver)
        missaoAnterior: { select: { id: true, titulo: true } },
        proximasMissoes: { select: { id: true, titulo: true } },
        _count: { select: { usuarios: true, tarefas: true } },
      },
    });

    if (!missao) {
      return res.status(404).json({ error: 'Missão não encontrada.' });
    }

    res.json(missao);
  } catch (error) {
    console.error('Erro ao buscar missão completa por ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};


/**
 * @route   POST /api/missions/:missionId/join
 * @desc    Inscrever o usuário logado em uma missão
 * @access  Privado
 */
const joinMission = async (req, res) => {
  const missionId = parseInt(req.params.missionId, 10);
  if (isNaN(missionId)) {
    return res.status(400).json({ error: 'ID da missão inválido.' });
  }
  
  const userId = req.user.id; // Vem do authMiddleware
  
  try {
    // Transação para garantir atomicidade (tudo ou nada)
    const newSubscription = await prisma.$transaction(async (tx) => {
      
      // 1. Verificar a missão
      const mission = await tx.missao.findUnique({
        where: { id: missionId },
        select: { preco: true, ativa: true }
      });

      if (!mission) {
        throw new Error('Missão não encontrada.');
      }
      if (!mission.ativa) {
        throw new Error('Esta missão não está ativa.');
      }

      // 2. Verificar se o usuário já está inscrito
      const existingSub = await tx.usuarioMissao.findUnique({
        where: {
          usuario_id_missao_id: {
            usuario_id: userId,
            missao_id: missionId
          }
        },
        select: { id: true }
      });

      if (existingSub) {
        throw new Error('Você já está inscrito nesta missão.');
      }

      // 3. Preparar dados
      const missionPrice = mission.preco || 0.00;
      // O enum StatusPagamento no schema Prisma não tem 'nao_aplicavel'.
      // Para missões gratuitas, marcar como 'pago' (valor válido do enum).
      const paymentStatus = (Number(missionPrice) > 0) ? 'pendente' : 'pago';
      const participationStatus = 'inscrito';

      // 4. Inserir inscrição
      const subscription = await tx.usuarioMissao.create({
        data: {
          usuario_id: userId,
          missao_id: missionId,
          valor_pago: missionPrice,
          status_pagamento: paymentStatus,
          status_participacao: participationStatus,
        }
      });

      return subscription;
    });

    res.status(201).json({
      message: 'Inscrição na missão realizada com sucesso!',
      subscription: newSubscription,
    });

  } catch (error) {
    // Captura o erro de chave única (usuário já inscrito)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: 'Você já está inscrito nesta missão.' });
    }

    // Captura erros lançados manualmente
    if (error.message.includes('Missão não encontrada') || error.message.includes('Esta missão não está ativa')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Você já está inscrito')) {
      return res.status(409).json({ error: error.message });
    }

    console.error('Erro ao inscrever na missão:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};


module.exports = {
  getAllActiveMissions,
  getMissionById,
  getMissionFullById,
  joinMission,
};

