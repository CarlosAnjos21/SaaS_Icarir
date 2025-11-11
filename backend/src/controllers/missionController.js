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
    // Busca missões onde 'ativo' = true, ordenadas pela data de início
    const missoes = await prisma.missoes.findMany({
      where: { ativo: true },
      // Seleciona os mesmos campos da query SQL original
      select: {
        id: true,
        titulo: true, // [cite: 57, 254]
        descricao: true, // [cite: 60, 257]
        foto_url: true, // [cite: 55]
        destino: true, // [cite: 65, 260]
        data_inicio: true, // [cite: 66, 271]
        data_fim: true, // [cite: 66, 271]
        preco: true // [cite: 67, 271]
      },
      orderBy: { data_inicio: 'asc' }
    });
    
    res.json(missoes);

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

    const missao = await prisma.missoes.findFirst({
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
      const mission = await tx.missoes.findUnique({
        where: { id: missionId },
        select: { preco: true, ativo: true }
      });

      if (!mission) {
        throw new Error('Missão não encontrada.');
      }
      if (!mission.ativo) {
        throw new Error('Esta missão não está ativa.');
      }

      // 2. Verificar se o usuário já está inscrito
      const existingSub = await tx.usuariosMissoes.findUnique({
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
      const paymentStatus = (missionPrice > 0) ? 'pendente' : 'nao_aplicavel';
      const participationStatus = 'inscrito';

      // 4. Inserir inscrição
      const subscription = await tx.usuariosMissoes.create({
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
  joinMission,
};
<<<<<<< HEAD
=======

>>>>>>> 163c8d2fff6990e3cc44935d6edf510ddff2c121
